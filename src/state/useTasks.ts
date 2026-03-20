// src/state/useTasks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, updateTask } from '../api/client'
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../api/types'

// ── Fetch tasks for a patient ─────────────────────────────

export function useTasks(patientId: string) {
  const query = useQuery({
    queryKey: ['tasks', patientId],
    queryFn: () => fetchTasks(patientId),
    enabled: !!patientId,   // don't fetch if patientId is empty
  })

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

// ── Update task (with optimistic UI + rollback) ───────────

export function useUpdateTask(patientId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['tasks', patientId]

  return useMutation({
    mutationFn: ({ taskId, dto }: { taskId: string; dto: UpdateTaskDTO }) =>
      updateTask(taskId, dto),

    // 1. Optimistically update the cache before request completes
    onMutate: async ({ taskId, dto }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the current cache (for rollback)
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)

      // Apply optimistic update to cache
      queryClient.setQueryData<Task[]>(queryKey, old =>
        old?.map(task =>
          task.id === taskId ? { ...task, ...dto } : task
        ) ?? []
      )

      // Return snapshot so onError can roll back
      return { previousTasks }
    },

    // 2. If server returns error — roll back to snapshot
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks)
      }
    },

    // 3. Always refetch after success or error to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// ── Create task ───────────────────────────────────────────

export function useCreateTask(patientId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['tasks', patientId]

  return useMutation({
    mutationFn: (dto: CreateTaskDTO) => createTask(patientId, dto),

    // Refetch task list after creating
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}