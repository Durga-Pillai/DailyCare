# DailyCare — Dialysis Task Management

A frontend task management system for dialysis teams built with React + TypeScript.
Manages recurring and ad-hoc patient tasks across multiple roles — nurse, dietician,
and social worker.

##Live Demo
https://daily-care-lovat.vercel.app/


git clone https://github.com/Durga-Pillai/DailyCare.git
cd DailyCare

# 2. Install
npm install

# 3. Initialize MSW (once only)
npx msw init public/ --save

# 4. Run
npm run dev

> No backend needed. MSW intercepts all API calls and returns
> mock data automatically.

## Tech Stack
- React+TypeScript 
- Vite
- React Query
- Zustand for Client-side filter and search state
- MSW fro Mock backend
- Vitest+React Testing Library for unit and component testing


## Project Structure
```
src/
├── api/
│   ├── apiClient.ts
│   ├── types.ts
│   └── msw/
│       ├── browser.ts
│       └── handlers.ts
├── state/
│   ├── usePatients.ts
│   ├── useTasks.ts
│   └── useFilters.ts
├── components/
│   ├── Taskboard.tsx
│   ├── TaskCard.tsx
│   ├── FilterBar.tsx
│   ├── CreateTaskModal.tsx
│   └── NetworkBanner.tsx
└── __tests__/
    ├── useTasks.test.ts
    └── TaskCard.test.tsx

docs/
└── integration-failures.md
```

---

### Module Responsibilities

**`src/api/`** — All network concerns live here. `apiClient.ts` wraps
axios with retry logic (3 attempts, exponential backoff). `types.ts`
defines every data contract. MSW handlers mock the backend.

**`src/state/`** — Server state via React Query, client state via Zustand.
`useTasks` handles optimistic updates and rollback. `useFilters` manages
role, time, and search filters without touching the server.

**`src/components/`** — Pure UI. Components receive data from hooks and
render it. No direct API calls anywhere in components.


### Trade-offs

**Optimistic UI on every status change**
Every PATCH immediately updates the UI before the server confirms.
This feels fast but means the UI can briefly show an incorrect state
if the network is slow and the server rejects the update.

**MSW over a real stub backend**
MSW runs entirely in the browser — no separate process needed.
Trade-off: MSW data resets on page refresh since it lives in memory.
A real stub backend (Express/json-server) would persist across reloads.

**Inline styles over a CSS framework**
Inline styles were chosen for portability and to avoid build config
complexity. Trade-off: no responsive breakpoints, harder to maintain
at scale compared to Tailwind or CSS modules.

## What can be done next
- Add a real backend
- Add Authentication
- Make the layout responsive
- Link the work to a dialysis center


## AI Usage

AI used - Claude

- **Boilerplate generation** - MSW handlers for stub backend,Typecript interfaces to speed up set up
- **Debugging** - resolving TypeScript errors, test failures, and MSW configuration issues that came up during development

## What I reveiwed and changed manually

-Verified the update and rollback logic in `useTasks.ts` to confirm restore worked correctly
- Added delete feature for completed task
- Adjusted the UI - removed unnecessay emoji,changed the font to Nunito, added patient search, fixed the status cycle logic so done tasks cannot be cycled back to todo.

### One example where I disagreed with AI output
One instance where I disagreed with the AI-generated output was when it implemented a status cycle as todo → in progress → done → todo, which incorrectly allowed completed tasks to return to the initial state. I corrected this by adding a conditional check to ensure that once the status reaches completed, it does not transition further.








 