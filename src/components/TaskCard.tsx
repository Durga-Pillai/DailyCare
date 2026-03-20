// src/components/TaskCard.tsx

import { useState } from 'react'
import { useUpdateTask } from '../state/useTasks'
import type { Task, TaskStatus } from '../api/types'

interface Props {
  task: Task
  patientId: string
}

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  todo:        'in_progress',
  in_progress: 'done',
  done:        'todo',
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo:        '⬜ Todo',
  in_progress: '🟡 In Progress',
  done:        '✅ Done',
}

const STATUS_BG: Record<TaskStatus, string> = {
  todo:        '#ffffff',
  in_progress: '#fff8e1',
  done:        '#e8f5e9',
}

const ROLE_LABEL: Record<Task['assignedRole'], string> = {
  nurse:         '🩺 Nurse',
  dietician:     '🥗 Dietician',
  social_worker: '🤝 Social Worker',
}

export default function TaskCard({ task, patientId }: Props) {
  const { mutate: updateTask, isPending, isError } = useUpdateTask(patientId)
  const [showError, setShowError] = useState(false)

  function handleStatusClick() {
    const nextStatus = STATUS_NEXT[task.status]
    setShowError(false)

    updateTask(
      { taskId: task.id, dto: { status: nextStatus } },
      {
        onError: () => setShowError(true),
      }
    )
  }

  // Is this task overdue?
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.dueDate)
  due.setHours(0, 0, 0, 0)
  const isOverdue = due < today && task.status !== 'done'

  return (
    <div style={{
      padding: '12px',
      border: `1px solid ${isOverdue ? '#ffcccc' : '#ddd'}`,
      borderRadius: '8px',
      fontSize: '13px',
      background: STATUS_BG[task.status],
      minWidth: '180px',
      maxWidth: '220px',
      opacity: isPending ? 0.6 : 1,
      transition: 'opacity 0.2s',
      position: 'relative',
    }}>

      {/* Overdue badge */}
      {isOverdue && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#ff4444',
          color: '#fff',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '10px',
          fontWeight: 600,
        }}>
          OVERDUE
        </div>
      )}

      {/* Title */}
      <div style={{ fontWeight: 600, marginBottom: '6px', paddingRight: '60px' }}>
        {task.title}
      </div>

      {/* Role */}
      <div style={{ color: '#666', marginBottom: '4px' }}>
        {ROLE_LABEL[task.assignedRole]}
      </div>

      {/* Assignee */}
      {task.assigneeName && (
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
          👤 {task.assigneeName}
        </div>
      )}

      {/* Due date */}
      <div style={{
        color: isOverdue ? '#cc0000' : '#999',
        fontSize: '12px',
        marginBottom: '10px',
      }}>
        📅 {task.dueDate}
      </div>

      {/* Status button — triggers optimistic update */}
      <button
        onClick={handleStatusClick}
        disabled={isPending}
        style={{
          width: '100%',
          padding: '5px 0',
          borderRadius: '6px',
          border: '1px solid #ddd',
          background: isPending ? '#f0f0f0' : '#fff',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {isPending ? '⏳ Saving...' : STATUS_LABEL[task.status]}
      </button>

      {/* Click hint */}
      {!isPending && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
          click to → {STATUS_LABEL[STATUS_NEXT[task.status]]}
        </div>
      )}

      {/* Error state — shows when server rejects */}
      {showError && (
        <div style={{
          marginTop: '8px',
          padding: '6px',
          background: '#fff0f0',
          border: '1px solid #ffcccc',
          borderRadius: '6px',
          color: '#cc0000',
          fontSize: '11px',
          textAlign: 'center',
        }}>
          ⚠️ Failed to update. Reverted.
        </div>
      )}
    </div>
  )
}