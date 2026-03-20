// src/components/FilterBar.tsx

import { useFilters} from '../state/useFilters'
import type {TimeFilter} from '../state/useFilters'
import type { Role } from '../api/types'

const ROLES: { value: Role; label: string }[] = [
  { value: 'nurse',         label: '🩺 Nurse' },
  { value: 'dietician',     label: '🥗 Dietician' },
  { value: 'social_worker', label: '🤝 Social Worker' },
]

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'overdue',   label: '🔴 Overdue' },
  { value: 'due_today', label: '🟡 Due Today' },
  { value: 'upcoming',  label: '🔵 Upcoming' },
]

export default function FilterBar() {
  const { selectedRoles, timeFilter, toggleRole, setTimeFilter, resetFilters } =
    useFilters()

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      padding: '12px 16px',
      background: '#f9f9f9',
      borderRadius: '10px',
      marginBottom: '20px',
      border: '1px solid #eee',
    }}>

      {/* Role filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
          Role:
        </span>
        {ROLES.map(role => (
          <button
            key={role.value}
            onClick={() => toggleRole(role.value)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              fontSize: '13px',
              background: selectedRoles.includes(role.value)
                ? '#1a1a1a'
                : '#fff',
              color: selectedRoles.includes(role.value)
                ? '#fff'
                : '#333',
              transition: 'all 0.15s',
            }}
          >
            {role.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: '#ddd' }} />

      {/* Time filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
          Time:
        </span>
        {TIME_FILTERS.map(tf => (
          <button
            key={tf.value}
            onClick={() => setTimeFilter(tf.value)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              fontSize: '13px',
              background: timeFilter === tf.value ? '#1a1a1a' : '#fff',
              color: timeFilter === tf.value ? '#fff' : '#333',
              transition: 'all 0.15s',
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Reset */}
      {(selectedRoles.length > 0 || timeFilter !== 'all') && (
        <button
          onClick={resetFilters}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #ffcccc',
            background: '#fff5f5',
            color: '#cc0000',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          ✕ Reset
        </button>
      )}
    </div>
  )
}