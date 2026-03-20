// src/api/msw/handlers.ts

import { http, HttpResponse } from 'msw'
import type { Patient, Task } from '../types'

// ── Fake data ─────────────────────────────────────────────

const patients: Patient[] = [
  {
    id: 'p1',
    name: 'Ravi Kumar',
    age: 54,
    dialysisType: 'Hemodialysis',
  },
  {
    id: 'p2',
    name: 'Meena Pillai',
    age: 61,
    dialysisType: 'Peritoneal',
  },
  {
    id: 'p3',
    name: 'Arjun Nair',
    age: 47,
    dialysisType: 'Hemodialysis',
  },
]

const tasks: Task[] = [
  {
    id: 't1',
    patientId: 'p1',
    title: 'Monthly blood labs',
    category: 'monthly_labs',
    status: 'todo',
    assignedRole: 'nurse',
    assigneeName: 'Nurse Divya',
    dueDate: '2026-03-20',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 't2',
    patientId: 'p1',
    title: 'Diet counselling session',
    category: 'diet_counselling',
    status: 'in_progress',
    assignedRole: 'dietician',
    dueDate: '2026-03-18',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 't3',
    patientId: 'p2',
    title: 'Vascular access check',
    category: 'access_check',
    status: 'done',
    assignedRole: 'nurse',
    assigneeName: 'Nurse Priya',
    dueDate: '2026-03-15',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 't4',
    patientId: 'p2',
    title: 'Social work follow-up',
    category: 'social_work',
    status: 'todo',
    assignedRole: 'social_worker',
    dueDate: '2026-03-25',
    createdAt: '2026-03-02T08:00:00Z',
  },
  {
    id: 't5',
    patientId: 'p3',
    title: 'Hepatitis B vaccination',
    category: 'vaccination',
    status: 'todo',
    assignedRole: 'nurse',
    dueDate: '2026-03-19',
    createdAt: '2026-03-01T08:00:00Z',
  },
]

// ── Handlers ──────────────────────────────────────────────

export const handlers = [

  // GET /patients
  http.get('http://localhost:3000/patients', () => {
    return HttpResponse.json(patients)
  }),

  // GET /patients/:id/tasks
  http.get('http://localhost:3000/patients/:patientId/tasks', ({ params }) => {
    const { patientId } = params
    const patientTasks = tasks.filter(t => t.patientId === patientId)
    return HttpResponse.json(patientTasks)
  }),

  // POST /patients/:id/tasks
  http.post('http://localhost:3000/patients/:patientId/tasks', async ({ request, params }) => {
    const { patientId } = params
    const body = await request.json() as Record<string, unknown>

    const newTask: Task = {
      id: `t${Date.now()}`,
      patientId: patientId as string,
      title: body.title as string,
      category: body.category as Task['category'],
      status: 'todo',
      assignedRole: body.assignedRole as Task['assignedRole'],
      assigneeName: body.assigneeName as string | undefined,
      dueDate: body.dueDate as string,
      notes: body.notes as string | undefined,
      createdAt: new Date().toISOString(),
    }

    tasks.push(newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),

  // PATCH /tasks/:id
  http.patch('http://localhost:3000/tasks/:taskId', async ({ request, params }) => {
    const { taskId } = params
    const body = await request.json() as Record<string, unknown>

    const index = tasks.findIndex(t => t.id === taskId)

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    tasks[index] = { ...tasks[index], ...body }
    return HttpResponse.json(tasks[index])
  }),
]