import { useState } from 'react'
import { useCreateTask } from '../state/useTasks'
import type { Patient, Role, TaskCategory } from '../api/types'

interface Props { patient: Patient; onClose: () => void }

const ROLES: { value: Role; label: string }[] = [
  { value: 'nurse',         label: 'Nurse'         },
  { value: 'dietician',     label: 'Dietician'     },
  { value: 'social_worker', label: 'Social Worker' },
]

const CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'monthly_labs',     label: 'Monthly Labs',     icon: '🧪' },
  { value: 'access_check',     label: 'Access Check',     icon: '🔍' },
  { value: 'diet_counselling', label: 'Diet Counselling', icon: '🥗' },
  { value: 'vaccination',      label: 'Vaccination',      icon: '💉' },
  { value: 'social_work',      label: 'Social Work',      icon: '🤝' },
  { value: 'other',            label: 'Other',            icon: '📋' },
]

const field: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--slate-200)',
  fontSize: '13px', fontFamily: 'var(--font-sans)',
  color: 'var(--slate-800)', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600,
  color: 'var(--slate-500)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '6px',
}

export default function CreateTaskModal({ patient, onClose }: Props) {
  const { mutate: createTask, isPending, isError } = useCreateTask(patient.id)
  const [form, setForm] = useState({
    title: '', category: 'monthly_labs' as TaskCategory,
    assignedRole: 'nurse' as Role, dueDate: '', notes: '',
  })

  const isValid = form.title.trim() && form.dueDate
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 'var(--radius-xl)',
        padding: '28px', width: '100%', maxWidth: '460px',
        boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', letterSpacing: '-0.3px', marginBottom: '3px' }}>New Task</h2>
            <p style={{ fontSize: '12px', color: 'var(--slate-400)' }}>for {patient.name}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--slate-100)', border: 'none',
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '14px', color: 'var(--slate-500)',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={lbl}>Task Title *</span>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Monthly blood labs" style={field}
              onFocus={e => (e.target.style.borderColor = 'var(--blue-500)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--slate-200)')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={lbl}>Category *</span>
              <select name="category" value={form.category} onChange={handleChange} style={field}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <span style={lbl}>Assign To *</span>
              <select name="assignedRole" value={form.assignedRole} onChange={handleChange} style={field}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <span style={lbl}>Due Date *</span>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} style={field}
              onFocus={e => (e.target.style.borderColor = 'var(--blue-500)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--slate-200)')} />
          </div>

          <div>
            <span style={lbl}>Notes (optional)</span>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Any additional info..." rows={3}
              style={{ ...field, resize: 'vertical' }}
              onFocus={e => (e.target.style.borderColor = 'var(--blue-500)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--slate-200)')} />
          </div>

          {isError && (
            <div style={{ padding: '10px 14px', background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 'var(--radius-sm)', color: 'var(--red-600)', fontSize: '12px' }}>
              ⚠ Failed to create task. Please try again.
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--slate-200)', background: '#fff',
              color: 'var(--slate-600)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>Cancel</button>
            <button
              onClick={() => isValid && createTask({ patientId: patient.id, title: form.title.trim(), category: form.category, assignedRole: form.assignedRole, dueDate: form.dueDate, notes: form.notes.trim() || undefined }, { onSuccess: onClose })}
              disabled={isPending || !isValid}
              style={{
                flex: 2, padding: '10px', borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: !isValid || isPending ? 'var(--slate-200)' : 'var(--blue-600)',
                color: !isValid || isPending ? 'var(--slate-400)' : '#fff',
                fontSize: '13px', fontWeight: 600,
                cursor: !isValid || isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >{isPending ? '⏳ Creating...' : '+ Create Task'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}