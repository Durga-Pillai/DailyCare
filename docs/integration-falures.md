# Integration & Failure Modes

DailyCare frontend — dialysis task management system.  
Stack: React · TypeScript · React Query · MSW · Zustand

---

## 1. Data Contracts

All shapes are defined in `src/api/types.ts`.

### Patient
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier |
| `name` | `string` | Yes | Full name |
| `age` | `number` | Yes | Age in years |
| `dialysisType` | `string` | Yes | e.g. Hemodialysis, Peritoneal |

### Task
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier |
| `patientId` | `string` | Yes | Links to Patient |
| `title` | `string` | Yes | Human readable description |
| `category` | `TaskCategory` | Yes | One of 6 categories |
| `status` | `TaskStatus` | Yes | todo, in_progress, done |
| `assignedRole` | `Role` | Yes | nurse, dietician, social_worker |
| `assigneeName` | `string` | Optional | Staff name |
| `dueDate` | `string` | Yes | ISO date e.g. 2026-03-20 |
| `notes` | `string` | Optional | Extra info |
| `createdAt` | `string` | Yes | ISO datetime |

### DTOs
```ts
// POST /patients/:id/tasks
CreateTaskDTO {
  patientId, title, category,
  assignedRole, dueDate, notes?
}

// PATCH /tasks/:id
UpdateTaskDTO {
  status?, assignedRole?,
  assigneeName?, dueDate?, notes?
}
```

---

## 2. Behavior Under Partial Failures

### GET /patients fails
- `usePatients` returns `isError: true`
- Taskboard renders a red error banner: "Failed to load patients. Please refresh."
- No crash — error boundary catches unexpected throws
- React Query retries automatically 2 times before marking as error

### GET /patients/:id/tasks fails
- Only that patient's row shows a loading skeleton
- Other patient rows are unaffected
- Each patient's tasks are fetched independently via separate `useQuery` calls

### POST /patients/:id/tasks fails
- Modal stays open
- Red error message shown inside the modal: "Failed to create task"
- No task is added to the board
- User can retry without losing their form input

### PATCH /tasks/:id fails (most critical)
This is the optimistic update flow:
```
1. User clicks status button
2. onMutate fires → cache updated instantly → UI reflects new status
3. PATCH request sent to server
4. IF server returns 5xx or network error:
   - onError fires
   - previousTasks snapshot (saved in onMutate) is restored to cache
   - UI reverts to original status
   - TaskCard shows: "Failed to update. Reverted."
5. onSettled always fires → invalidates query → refetch from server
```

This ensures the UI never shows a status the server did not confirm.

### Network goes offline
- `NetworkBanner` listens to `window offline/online` events
- Red banner appears immediately when connection drops
- Green "Connection restored" banner shows for 3 seconds when back online
- `withRetry()` in `apiClient.ts` retries failed requests up to 3 times
  with exponential backoff (1s, 2s, 3s delays)
- Only retries on network errors or 5xx — never retries 4xx (client errors)

### Backend returns unexpected shape
Optional fields (`assigneeName`, `notes`) may be missing.  
The UI handles this safely:
- `assigneeName` — rendered only if present (`task.assigneeName && ...`)
- `notes` — not displayed in card, stored only
- Unknown fields — ignored by TypeScript, do not cause crashes
- Missing required fields — TypeScript catches at compile time via strict types

---

## 3. Adding a New Role

Example: adding a `psychologist` role.

**Step 1 — Update the type union in `src/api/types.ts`:**
```ts
export type Role =
  | 'nurse'
  | 'dietician'
  | 'social_worker'
  | 'psychologist'   // add here
```

**Step 2 — Add role config in `TaskCard.tsx`:**
```ts
const ROLE_CONFIG = {
  // existing roles...
  psychologist: {
    label: 'Psychologist',
    color: '#B45309',
    bg:    '#FFFBEB',
  },
}
```

**Step 3 — Add to filter options in `FilterBar.tsx`:**
```ts
const ROLES = [
  // existing roles...
  { value: 'psychologist', label: 'Psychologist', color: '#B45309' },
]
```

**Step 4 — Add to modal dropdown in `CreateTaskModal.tsx`:**
```ts
const ROLES = [
  // existing roles...
  { value: 'psychologist', label: 'Psychologist' },
]
```

No changes needed to:
- `apiClient.ts` — fetch logic is role-agnostic
- `useTasks.ts` / `usePatients.ts` — hooks do not care about roles
- `Taskboard.tsx` — renders whatever the API returns
- MSW handlers — just add the role to mock data if needed

TypeScript will show compile errors anywhere the `Role` type is used
but not handled — so nothing gets missed.

---

## 4. Adding a New Task Category

Example: adding a `physiotherapy` category.

**Step 1 — Update the type union in `src/api/types.ts`:**
```ts
export type TaskCategory =
  | 'monthly_labs'
  | 'access_check'
  | 'diet_counselling'
  | 'vaccination'
  | 'social_work'
  | 'other'
  | 'physiotherapy'   // add here
```

**Step 2 — Add icon in `TaskCard.tsx`:**
```ts
const CATEGORY_ICON = {
  // existing...
  physiotherapy: '🦵',
}
```

**Step 3 — Add to modal dropdown in `CreateTaskModal.tsx`:**
```ts
const CATEGORIES = [
  // existing...
  { value: 'physiotherapy', label: 'Physiotherapy', icon: '🦵' },
]
```

The board renders it automatically — no column or layout changes needed.

---

## 5. Adding a New Task Status Column

Example: adding a `cancelled` status.

**Step 1 — Update type in `src/api/types.ts`:**
```ts
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
```

**Step 2 — Add to `STATUS_COLUMNS` in `Taskboard.tsx`:**
```ts
{ key: 'cancelled', label: 'Cancelled', color: 'var(--red-600)', bg: 'var(--red-50)' }
```

**Step 3 — Add to `STATUS_NEXT` and `STATUS_CONFIG` in `TaskCard.tsx`**

A new column appears automatically for every patient row.

---

## 6. Summary

| Failure | Behavior | Recovery |
|---|---|---|
| GET /patients fails | Error banner shown | Manual refresh |
| GET tasks fails | That row shows error | React Query retries |
| POST task fails | Modal stays open | User retries |
| PATCH task fails | UI reverts | Automatic rollback |
| Network offline | Banner shown | Auto-retry on reconnect |
| Missing optional fields | UI skips gracefully | No crash |
| Unknown fields from server | Ignored silently | No crash |