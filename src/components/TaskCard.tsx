import { useState } from 'react'
import { useUpdateTask, useDeleteTask } from '../state/useTasks'
import type { Task, TaskStatus } from '../api/types'

interface Props { task: Task; patientId: string }

const STATUS_NEXT: Partial<Record<TaskStatus, TaskStatus>> = {
  todo:        'in_progress',
  in_progress: 'done',
  
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; color: string; border: string }> = {
  todo:        { label: 'To Do',       bg: 'var(--slate-100)', color: 'var(--slate-600)', border: 'var(--slate-300)' },
  in_progress: { label: 'In Progress', bg: 'var(--amber-50)',  color: 'var(--amber-600)', border: 'var(--amber-500)' },
  done:        { label: 'Done',        bg: 'var(--green-50)',  color: 'var(--green-600)', border: 'var(--green-500)' },
}

const ROLE_CONFIG: Record<Task['assignedRole'], { label: string; color: string; bg: string }> = {
  nurse:         { label: 'Nurse',         color: 'var(--blue-700)', bg: 'var(--blue-50)'  },
  dietician:     { label: 'Dietician',     color: '#0E7490',         bg: '#ECFEFF'         },
  social_worker: { label: 'Social Worker', color: '#6D28D9',         bg: '#F5F3FF'         },
}

export default function TaskCard({ task, patientId }: Props) {
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(patientId)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(patientId)
  const [showError,         setShowError]         = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const today = new Date(); today.setHours(0,0,0,0)
  const due   = new Date(task.dueDate); due.setHours(0,0,0,0)
  const diff  = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  const isOverdue  = diff < 0  && task.status !== 'done'
  const isDueToday = diff === 0 && task.status !== 'done'

  const isPending = isUpdating || isDeleting
  const statusCfg = STATUS_CONFIG[task.status]
  const roleCfg   = ROLE_CONFIG[task.assignedRole]
  const nextStatus = STATUS_NEXT[task.status]
  const nextLabel  = nextStatus ? STATUS_CONFIG[nextStatus].label : null

  function handleStatusClick() {
    if (!nextStatus) return
    setShowError(false)
    updateTask(
      { taskId: task.id, dto: { status: nextStatus } },
      { onError: () => setShowError(true) }
    )
  }

  function handleDelete() {
    deleteTask(task.id, {
      onError: () => setShowError(true),
    })
    setShowDeleteConfirm(false)
  }

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${isOverdue ? 'var(--red-100)' : 'var(--slate-200)'}`,
        borderLeft: `3px solid ${isOverdue ? 'var(--red-500)' : isDueToday ? 'var(--amber-500)' : 'var(--blue-400)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        boxShadow: 'var(--shadow-sm)',
        opacity: isPending ? 0.65 : 1,
        transition: 'opacity 0.2s, box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      {/* Title */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-800)', lineHeight: 1.4 }}>
          {task.title}
        </span>
      </div>

      {/* Role badge */}
      <div style={{ marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block', fontSize: '11px', fontWeight: 500,
          color: roleCfg.color, background: roleCfg.bg,
          padding: '2px 8px', borderRadius: '99px',
        }}>
          {roleCfg.label}
        </span>
        {task.assigneeName && (
          <span style={{ fontSize: '11px', color: 'var(--slate-400)', marginLeft: '6px' }}>
            {task.assigneeName}
          </span>
        )}
      </div>

      {/* Due date */}
      <div style={{
        fontSize: '13px', fontFamily: 'var(--font-mono)',
        color: isOverdue ? 'var(--red-600)' : isDueToday ? 'var(--amber-600)' : 'var(--slate-400)',
        marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <span>{task.dueDate}</span>
        {isOverdue  && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>· Overdue</span>}
        {isDueToday && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>· Today</span>}
      </div>

      {/* Status button */}
      <button
        onClick={handleStatusClick}
        disabled={isPending || task.status === 'done'}
        style={{
          width: '100%', padding: '6px 0',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${statusCfg.border}`,
          background: statusCfg.bg, color: statusCfg.color,
          fontSize: '13px', fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: isPending || task.status === 'done' ? 'not-allowed' : 'pointer',
          opacity: task.status === 'done' ? 0.7 : 1,
          transition: 'all 0.15s',
        }}
      >
        {isUpdating ? 'Saving...' : statusCfg.label}
      </button>

      {/* Next step hint */}
      {!isPending && nextLabel && (
        <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--slate-400)', marginTop: '4px' }}>
          → {nextLabel}
        </div>
      )}

      {/* Delete button — only when done */}
      {task.status === 'done' && !showDeleteConfirm && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isPending}
          style={{
            width: '100%', padding: '6px 0',
            marginTop: '8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--red-100)',
            background: 'var(--red-50)', color: 'var(--red-600)',
            fontSize: '12px', fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Delete Task
        </button>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div style={{
          marginTop: '8px',
          padding: '10px',
          background: 'var(--red-50)',
          border: '1px solid var(--red-100)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--red-600)', marginBottom: '8px', fontWeight: 600 }}>
            Delete this task?
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex: 1, padding: '5px 0',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--slate-200)',
                background: '#fff', color: 'var(--slate-600)',
                fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                flex: 1, padding: '5px 0',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--red-600)', color: '#fff',
                fontSize: '12px', fontWeight: 600,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {showError && (
        <div style={{
          marginTop: '8px', padding: '6px 10px',
          background: 'var(--red-50)', border: '1px solid var(--red-100)',
          borderRadius: 'var(--radius-sm)', color: 'var(--red-600)',
          fontSize: '13px', textAlign: 'center',
        }}>
          Failed to update. Reverted.
        </div>
      )}
    </div>
  )
}