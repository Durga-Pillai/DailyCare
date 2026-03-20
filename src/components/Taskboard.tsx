// src/components/Taskboard.tsx

import { usePatients } from '../state/usePatients'
import { useTasks } from '../state/useTasks'
import { useFilters, applyFilters } from '../state/useFilters'
import FilterBar from './FilterBar'
import TaskCard from './TaskCard'
import { useState } from 'react'
import CreateTaskModal from './CreateTaskModal'

const STATUS_COLUMNS = ['todo', 'in_progress', 'done'] as const
const COLUMN_LABEL = {
  todo:        '⬜ Todo',
  in_progress: '🟡 In Progress',
  done:        '✅ Done',
}

function PatientRow({ patientId, patientName, age, dialysisType, patient }: {
  patientId: string
  patientName: string
  age: number
  dialysisType: string
  patient: import('../api/types').Patient
}) {
  const { tasks, isLoading } = useTasks(patientId)
  const { selectedRoles, timeFilter } = useFilters()
  const [showModal, setShowModal] = useState(false)

  if (isLoading) return <div>Loading tasks...</div>

  const filtered = applyFilters(tasks, selectedRoles, timeFilter)

  return (
    <div style={{
      marginBottom: '24px',
      padding:      '16px',
      border:       '1px solid #ddd',
      borderRadius: '12px',
    }}>
      {/* Patient header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>
          {patientName}
          <span style={{ fontWeight: 400, color: '#666', marginLeft: '8px' }}>
            Age {age} · {dialysisType}
          </span>
        </h3>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding:      '5px 14px',
            borderRadius: '8px',
            border:       'none',
            background:   '#1a1a1a',
            color:        '#fff',
            cursor:       'pointer',
            fontSize:     '13px',
            fontWeight:   600,
          }}
        >
          + Add Task
        </button>
      </div>

      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {STATUS_COLUMNS.map(status => {
          const columnTasks = filtered.filter(t => t.status === status)
          return (
            <div key={status}>
              <div style={{
                fontWeight:    600,
                fontSize:      '12px',
                color:         '#666',
                marginBottom:  '8px',
                paddingBottom: '6px',
                borderBottom:  '2px solid #eee',
              }}>
                {COLUMN_LABEL[status]}
                <span style={{
                  marginLeft:   '6px',
                  background:   '#eee',
                  borderRadius: '10px',
                  padding:      '1px 7px',
                  fontSize:     '11px',
                }}>
                  {columnTasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {columnTasks.length === 0
                  ? <div style={{ color: '#ccc', fontSize: '12px' }}>No tasks</div>
                  : columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} patientId={patientId} />
                    ))
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateTaskModal
          patient={patient}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default function Taskboard() {
  const { patients, isLoading, isError } = usePatients()

  if (isLoading) return <div>Loading patients...</div>
  if (isError)   return <div>Failed to load patients.</div>

  return (
    <div>
      <FilterBar />
      {patients.map(p => (
        <PatientRow
          key={p.id}
          patientId={p.id}
          patientName={p.name}
          age={p.age}
          dialysisType={p.dialysisType}
           patient={p}
        />
      ))}
    </div>
  )
}