// src/components/CreateTaskModal.tsx

import { useState } from 'react'
import { useCreateTask } from '../state/useTasks'
import type { Patient, Role, TaskCategory } from '../api/types'

interface Props {
  patient: Patient
  onClose: () => void
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'nurse',         label: '🩺 Nurse' },
  { value: 'dietician',     label: '🥗 Dietician' },
  { value: 'social_worker', label: '🤝 Social Worker' },
]

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'monthly_labs',    label: '🧪 Monthly Labs' },
  { value: 'access_check',    label: '🔍 Access Check' },
  { value: 'diet_counselling',label: '🥗 Diet Counselling' },
  { value: 'vaccination',     label: '💉 Vaccination' },
  { value: 'social_work',     label: '🤝 Social Work' },
  { value: 'other',           label: '📋 Other' },
]

export default function CreateTaskModal({ patient, onClose }: Props) {
  const { mutate: createTask, isPending, isError } = useCreateTask(patient.id)

  const [form, setForm] = useState({
    title:        '',
    category:     'monthly_labs' as TaskCategory,
    assignedRole: 'nurse' as Role,
    dueDate:      '',
    notes:        '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.dueDate) return

    createTask(
      {
        patientId:    patient.id,
        title:        form.title.trim(),
        category:     form.category,
        assignedRole: form.assignedRole,
        dueDate:      form.dueDate,
        notes:        form.notes.trim() || undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(0,0,0,0.4)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          1000,
      }}
    >
      {/* Modal box — stop click from closing */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:   '#fff',
          borderRadius: '14px',
          padding:      '24px',
          width:        '100%',
          maxWidth:     '440px',
          boxShadow:    '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px' }}>New Task</h2>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>
              for {patient.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border:     'none',
              fontSize:   '20px',
              cursor:     'pointer',
              color:      '#999',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Task Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Monthly blood labs"
              style={inputStyle}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={inputStyle}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label style={labelStyle}>Assign To *</label>
            <select
              name="assignedRole"
              value={form.assignedRole}
              onChange={handleChange}
              style={inputStyle}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label style={labelStyle}>Due Date *</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional info..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Error */}
          {isError && (
            <div style={{
              padding:      '8px 12px',
              background:   '#fff0f0',
              border:       '1px solid #ffcccc',
              borderRadius: '6px',
              color:        '#cc0000',
              fontSize:     '13px',
            }}>
              ⚠️ Failed to create task. Please try again.
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={onClose}
              style={{
                flex:         1,
                padding:      '10px',
                borderRadius: '8px',
                border:       '1px solid #ddd',
                background:   '#fff',
                cursor:       'pointer',
                fontSize:     '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !form.title.trim() || !form.dueDate}
              style={{
                flex:         2,
                padding:      '10px',
                borderRadius: '8px',
                border:       'none',
                background:   isPending || !form.title.trim() || !form.dueDate
                  ? '#ccc'
                  : '#1a1a1a',
                color:        '#fff',
                cursor:       isPending || !form.title.trim() || !form.dueDate
                  ? 'not-allowed'
                  : 'pointer',
                fontSize:     '14px',
                fontWeight:   600,
              }}
            >
              {isPending ? '⏳ Creating...' : '+ Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display:      'block',
  fontSize:     '12px',
  fontWeight:   600,
  color:        '#444',
  marginBottom: '4px',
}

const inputStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '8px 10px',
  borderRadius: '6px',
  border:       '1px solid #ddd',
  fontSize:     '13px',
  boxSizing:    'border-box',
  outline:      'none',
}