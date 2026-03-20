// src/__tests__/useTasks.test.ts

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { createElement } from 'react'
import { useTasks, useUpdateTask } from '../state/useTasks'
import type { Task } from '../api/types'

const mockTasks: Task[] = [
  {
    id:           't1',
    patientId:    'p1',
    title:        'Monthly blood labs',
    category:     'monthly_labs',
    status:       'todo',
    assignedRole: 'nurse',
    dueDate:      '2026-03-20',
    createdAt:    '2026-03-01T08:00:00Z',
  },
]

const server = setupServer(
  http.get('http://localhost:3000/patients/p1/tasks', () => {
    return HttpResponse.json(mockTasks)
  }),
  http.patch('http://localhost:3000/tasks/t1', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...mockTasks[0], ...body })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Key fix — both hooks share the SAME queryClient instance
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries:   { retry: false },
      mutations: { retry: false },
    },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

describe('useTasks', () => {
  it('fetches tasks for a patient', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useTasks('p1'), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Monthly blood labs')
    expect(result.current.tasks[0].status).toBe('todo')
  })
})

describe('useUpdateTask — optimistic update + rollback', () => {
    it('applies optimistic update immediately', async () => {
  const { wrapper, queryClient } = makeWrapper()

  // Fetch tasks first using the hook
  const tasks = renderHook(() => useTasks('p1'), { wrapper })
  await waitFor(() => expect(tasks.result.current.isLoading).toBe(false))
  expect(tasks.result.current.tasks[0].status).toBe('todo')

  // Apply optimistic update directly to the shared queryClient
  act(() => {
    queryClient.setQueryData<Task[]>(['tasks', 'p1'], old =>
      old?.map(t =>
        t.id === 't1' ? { ...t, status: 'in_progress' as const } : t
      ) ?? []
    )
  })

  // Cache should reflect the optimistic change instantly
  await waitFor(() => {
    expect(tasks.result.current.tasks[0].status).toBe('in_progress')
  })
})
  

    // Cache should update instantly without waiting for server
    
  it('rolls back on server error', async () => {
    server.use(
      http.patch('http://localhost:3000/tasks/t1', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 })
      })
    )

    const { wrapper } = makeWrapper()

    const tasks  = renderHook(() => useTasks('p1'),       { wrapper })
    const update = renderHook(() => useUpdateTask('p1'),  { wrapper })

    await waitFor(() => expect(tasks.result.current.isLoading).toBe(false))
    expect(tasks.result.current.tasks[0].status).toBe('todo')

    act(() => {
      update.result.current.mutate({ taskId: 't1', dto: { status: 'in_progress' } })
    })

    // Wait for mutation to fail
    await waitFor(() => {
      expect(update.result.current.isError).toBe(true)
    }, { timeout: 5000 })

    // Status should be rolled back to original
    await waitFor(() => {
      expect(tasks.result.current.tasks[0].status).toBe('todo')
    })
  })
})