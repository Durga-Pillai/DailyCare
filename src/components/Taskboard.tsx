import { useState } from 'react'
import { usePatients } from '../state/usePatients'
import { useTasks } from '../state/useTasks'
import { useFilters, applyFilters } from '../state/useFilters'
import FilterBar from './FilterBar'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import type { Patient, TaskStatus } from '../api/types'

const COLUMNS: { key: TaskStatus; label: string; color: string; bg: string }[] = [
  { key: 'todo',        label: 'To Do',      color: 'var(--slate-500)', bg: 'var(--slate-100)' },
  { key: 'in_progress', label: 'In Progress', color: 'var(--amber-600)', bg: 'var(--amber-50)'  },
  { key: 'done',        label: 'Done',        color: 'var(--green-600)', bg: 'var(--green-50)'  },
]

function PatientRow({ patient }: { patient: Patient }) {
  const { tasks, isLoading } = useTasks(patient.id)
  const { selectedRoles, timeFilter } = useFilters()
  const [showModal, setShowModal]   = useState(false)
  const [collapsed, setCollapsed]   = useState(false)

  const filtered     = applyFilters(tasks, selectedRoles, timeFilter)
  const overdueTasks = tasks.filter(t => {
    const today = new Date(); today.setHours(0,0,0,0)
    const due   = new Date(t.dueDate); due.setHours(0,0,0,0)
    return due < today && t.status !== 'done'
  }).length

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: collapsed ? 'none' : '1px solid var(--slate-100)',
          background: 'var(--slate-50)', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--blue-100)', color: 'var(--blue-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, flexShrink: 0,
          }}>
            {patient.name.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)', letterSpacing: '-0.2px' }}>
              {patient.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '1px' }}>
              Age {patient.age} · {patient.dialysisType}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, background: 'var(--blue-50)', color: 'var(--blue-700)', padding: '2px 8px', borderRadius: '99px' }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
            {overdueTasks > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 600, background: 'var(--red-50)', color: 'var(--red-600)', padding: '2px 8px', borderRadius: '99px' }}>
                {overdueTasks} overdue
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={e => { e.stopPropagation(); setShowModal(true) }}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'var(--blue-600)', color: '#fff',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            + Add Task
          </button>
          <span style={{
            fontSize: '12px', color: 'var(--slate-400)',
            display: 'inline-block',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▾</span>
        </div>
      </div>

      {/* Columns */}
      {!collapsed && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {COLUMNS.map((col, i) => {
            const colTasks = filtered.filter(t => t.status === col.key)
            return (
              <div key={col.key} style={{
                padding: '16px',
                borderRight: i < 2 ? '1px solid var(--slate-100)' : 'none',
                minHeight: '120px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    color: col.color, background: col.bg,
                    padding: '3px 10px', borderRadius: '99px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontFamily: 'var(--font-mono)' }}>
                    {colTasks.length}
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ height: '60px', background: 'var(--slate-100)', borderRadius: 'var(--radius-md)' }} />
                ) : colTasks.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--slate-300)', textAlign: 'center', paddingTop: '20px' }}>
                    No tasks
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} patientId={patient.id} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && <CreateTaskModal patient={patient} onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default function Taskboard() {
  const { patients, isLoading, isError } = usePatients()

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: '80px', background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  )

  if (isError) return (
    <div style={{ padding: '20px', background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 'var(--radius-md)', color: 'var(--red-600)', fontSize: '14px' }}>
      ⚠ Failed to load patients. Please refresh.
    </div>
  )

  return (
    <div>
      <FilterBar />
      {patients.map(p => <PatientRow key={p.id} patient={p} />)}
    </div>
  )
}