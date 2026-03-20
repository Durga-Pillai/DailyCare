// src/api/apiClient.ts

import axios, { AxiosError } from 'axios'
import type { Patient, Task, CreateTaskDTO, UpdateTaskDTO } from './types'

const client = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Retry logic ──────────────────────────────────────────
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: AxiosError | unknown

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const isNetworkError = axios.isAxiosError(err) && !err.response
      const isServerError =
        axios.isAxiosError(err) && (err.response?.status ?? 0) >= 500

      // Only retry on network failures or 5xx server errors
      if (!isNetworkError && !isServerError) throw err

      // Don't wait after last attempt
      if (attempt < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, RETRY_DELAY * attempt))
      }
    }
  }

  throw lastError
}

// ── API calls ─────────────────────────────────────────────

export async function fetchPatients(): Promise<Patient[]> {
  return withRetry(async () => {
    const res = await client.get<Patient[]>('/patients')
    return res.data
  })
}

export async function fetchTasks(patientId: string): Promise<Task[]> {
  return withRetry(async () => {
    const res = await client.get<Task[]>(`/patients/${patientId}/tasks`)
    return res.data
  })
}

export async function createTask(
  patientId: string,
  dto: CreateTaskDTO
): Promise<Task> {
  return withRetry(async () => {
    const res = await client.post<Task>(
      `/patients/${patientId}/tasks`,
      dto
    )
    return res.data
  })
}

export async function updateTask(
  taskId: string,
  dto: UpdateTaskDTO
): Promise<Task> {
  return withRetry(async () => {
    const res = await client.patch<Task>(`/tasks/${taskId}`, dto)
    return res.data
  })
}