// src/state/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/client'
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../api/types'

// ── Fetch tasks for a patient ─────────────────────────────

export function useTasks(patientId: string) {
  const query = useQuery({
    queryKey: ['tasks', patientId],
    queryFn:  () => fetchTasks(patientId),
    enabled:  !!patientId,
  })

  return {
    tasks:     query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
  }
}

// ── Update task (optimistic UI + rollback) ────────────────

export function useUpdateTask(patientId: string) {
  const queryClient = useQueryClient()
  const queryKey    = ['tasks', patientId]

  return useMutation({
    mutationFn: ({ taskId, dto }: { taskId: string; dto: UpdateTaskDTO }) =>
      updateTask(taskId, dto),

    onMutate: async ({ taskId, dto }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)

      queryClient.setQueryData<Task[]>(queryKey, old =>
        old?.map(task =>
          task.id === taskId ? { ...task, ...dto } : task
        ) ?? []
      )

      return { previousTasks }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// ── Create task ───────────────────────────────────────────

export function useCreateTask(patientId: string) {
  const queryClient = useQueryClient()
  const queryKey    = ['tasks', patientId]

  return useMutation({
    mutationFn: (dto: CreateTaskDTO) => createTask(patientId, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// ── Delete task (optimistic) ──────────────────────────────

export function useDeleteTask(patientId: string) {
  const queryClient = useQueryClient()
  const queryKey    = ['tasks', patientId]

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)

      // Optimistically remove from cache
      queryClient.setQueryData<Task[]>(queryKey, old =>
        old?.filter(t => t.id !== taskId) ?? []
      )

      return { previousTasks }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}