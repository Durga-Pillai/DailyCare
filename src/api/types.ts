// src/api/types.ts

export type Role = 'nurse' | 'dietician' | 'social_worker'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskCategory =
  | 'monthly_labs'
  | 'access_check'
  | 'diet_counselling'
  | 'vaccination'
  | 'social_work'
  | 'other'

export interface Patient {
  id: string
  name: string
  age: number
  dialysisType: string        // e.g. "Hemodialysis", "Peritoneal"
}

export interface Task {
  id: string
  patientId: string
  title: string
  category: TaskCategory
  status: TaskStatus
  assignedRole: Role
  assigneeName?: string       // optional — might not be assigned yet
  dueDate: string             // ISO date string e.g. "2026-03-20"
  notes?: string              // optional extra info
  createdAt: string           // ISO datetime
}

// What you send when creating a task
export interface CreateTaskDTO {
  patientId: string
  title: string
  category: TaskCategory
  assignedRole: Role
  dueDate: string
  notes?: string
}

// What you send when updating a task
export interface UpdateTaskDTO {
  status?: TaskStatus
  assignedRole?: Role
  assigneeName?: string
  dueDate?: string
  notes?: string
}