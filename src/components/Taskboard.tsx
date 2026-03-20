// src/components/Taskboard.tsx

import { usePatients } from '../state/usePatients'
import { useTasks } from '../state/useTasks'
import FilterBar from './FilterBar'
import { useFilters, applyFilters } from '../state/useFilters'

function PatientRow({ patientId }: { patientId: string }) {
  const { tasks, isLoading } = useTasks(patientId)
  const { selectedRoles, timeFilter } = useFilters()

  if (isLoading) return <div>Loading tasks...</div>

  const filtered = applyFilters(tasks, selectedRoles, timeFilter)

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {filtered.length === 0 && (
        <div style={{ color: '#999' }}>No tasks match filters</div>
      )}
      {filtered.map(task => (
        <div key={task.id} style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '13px',
          background: task.status === 'done'
            ? '#e8f5e9'
            : task.status === 'in_progress'
            ? '#fff8e1'
            : '#fff',
        }}>
          <div><strong>{task.title}</strong></div>
          <div style={{ color: '#666' }}>{task.status} · {task.assignedRole}</div>
          <div style={{ color: '#999' }}>Due: {task.dueDate}</div>
        </div>
      ))}
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
        <div key={p.id} style={{
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}>
          <h3 style={{ marginBottom: '12px' }}>
            {p.name} · Age {p.age} · {p.dialysisType}
          </h3>
          <PatientRow patientId={p.id} />
        </div>
      ))}
    </div>
  )
}