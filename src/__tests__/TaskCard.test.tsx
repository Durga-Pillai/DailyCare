// src/__tests__/TaskCard.test.tsx

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { createElement } from 'react'
import TaskCard from '../components/TaskCard'
import type { Task } from '../api/types'

const mockTask: Task = {
  id:           't1',
  patientId:    'p1',
  title:        'Monthly blood labs',
  category:     'monthly_labs',
  status:       'todo',
  assignedRole: 'nurse',
  dueDate:      '2026-03-20',
  createdAt:    '2026-03-01T08:00:00Z',
}

const server = setupServer(
  http.patch('http://localhost:3000/tasks/t1', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...mockTask, ...body })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderCard(task = mockTask) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries:   { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(TaskCard, { task, patientId: 'p1' })
    )
  )
}

describe('TaskCard', () => {

  it('renders task title and role', () => {
    renderCard()
    expect(screen.getByText('Monthly blood labs')).toBeInTheDocument()
    expect(screen.getByText('🩺 Nurse')).toBeInTheDocument()
  })

  it('renders due date in the card', () => {
    const { container } = renderCard()
    // Check raw HTML since date is split across emoji + text nodes
    expect(container.innerHTML).toContain('2026-03-20')
  })

  it('shows next status hint text', () => {
    const { container } = renderCard()
    // Check raw HTML since hint text is split across nodes
    expect(container.innerHTML).toContain('In Progress')
  })

  it('shows todo status button', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /todo/i })).toBeInTheDocument()
  })

  it('shows error message on server failure', async () => {
    server.use(
      http.patch('http://localhost:3000/tasks/t1', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        )
      })
    )

    const { container } = renderCard()
    const button = screen.getByRole('button', { name: /todo/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(container.innerHTML).toContain('Failed to update')
    }, { timeout: 8000 })
  })
})