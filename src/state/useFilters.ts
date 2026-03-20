// src/state/useFilters.ts

import { create } from 'zustand'
import type { Role, TaskStatus } from '../api/types'

export type TimeFilter = 'all' | 'overdue' | 'due_today' | 'upcoming'

interface FilterState {
  selectedRoles: Role[]
  timeFilter: TimeFilter
  searchQuery: string

  // Actions
  toggleRole: (role: Role) => void
  setTimeFilter: (filter: TimeFilter) => void
  resetFilters: () => void
  setSearchQuery:(query: string )=> void
}

export const useFilters = create<FilterState>(set => ({
  selectedRoles: [],       // empty = show all roles
  timeFilter: 'all',
  searchQuery: '',

  toggleRole: (role) =>
    set(state => ({
      selectedRoles: state.selectedRoles.includes(role)
        ? state.selectedRoles.filter(r => r !== role)   // remove if already selected
        : [...state.selectedRoles, role],               // add if not selected
    })),

  setTimeFilter: (filter) => set({ timeFilter: filter }),
    setSearchQuery:(query) => set({searchQuery:query}),
  resetFilters: () => set({ selectedRoles: [], timeFilter: 'all' }),
}))

// ── Helper — filter tasks based on current filter state ───

export function applyFilters(
  tasks: import('../api/types').Task[],
  selectedRoles: Role[],
  timeFilter: TimeFilter
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return tasks.filter(task => {
    // Role filter — if nothing selected show all
    if (selectedRoles.length > 0 && !selectedRoles.includes(task.assignedRole)) {
      return false
    }

    // Time filter
    if (timeFilter !== 'all') {
      const due = new Date(task.dueDate)
      due.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (timeFilter === 'overdue'   && diffDays >= 0) return false
      if (timeFilter === 'due_today' && diffDays !== 0) return false
      if (timeFilter === 'upcoming'  && diffDays <= 0) return false
    }

    return true
  })
}