import { useFilters } from '../state/useFilters'
import type { TimeFilter } from '../state/useFilters'
import type { Role } from '../api/types'

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: 'nurse',         label: 'Nurse',         color: 'var(--blue-600)' },
  { value: 'dietician',     label: 'Dietician',     color: '#0891B2' },
  { value: 'social_worker', label: 'Social Worker', color: '#7C3AED' },
]

const TIME_FILTERS: { value: TimeFilter; label: string; dot?: string }[] = [
  { value: 'all',       label: 'All Tasks' },
  { value: 'overdue',   label: 'Overdue',   dot: 'var(--red-500)' },
  { value: 'due_today', label: 'Due Today', dot: 'var(--amber-500)' },
  { value: 'upcoming',  label: 'Upcoming',  dot: 'var(--blue-500)' },
]

export default function FilterBar() {
  const {
    selectedRoles,
    timeFilter,
    searchQuery,
    toggleRole,
    setTimeFilter,
    setSearchQuery,
    resetFilters,
  } = useFilters()

  const hasFilters = selectedRoles.length > 0 || timeFilter !== 'all' || searchQuery !== ''

  return (
    <div className="filter-bar" style={{
      background: '#fff',
      border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 20px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      boxShadow: 'var(--shadow-sm)',
    }}>

      {/* Search */}
      <div
        className="search-box"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--slate-50)',
          border: '1.5px solid var(--slate-200)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 12px',
          minWidth: '200px',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--blue-500)')}
        onBlurCapture={e  => (e.currentTarget.style.borderColor = 'var(--slate-200)')}
      >
        <span style={{ fontSize: '13px', color: 'var(--slate-400)', flexShrink: 0 }}>🔍</span>
        <input
          type="text"
          placeholder="Search patient..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: '13px',
            color: 'var(--slate-700)',
            fontFamily: 'var(--font-sans)',
            width: '100%',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--slate-400)',
              fontSize: '12px', padding: '0', flexShrink: 0,
            }}
          >✕</button>
        )}
      </div>

      <div style={{ width: '1px', height: '20px', background: 'var(--slate-200)', flexShrink: 0 }} />

      {/* Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: 'var(--slate-400)',
          textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px',
        }}>
          Role
        </span>
        {ROLES.map(role => {
          const active = selectedRoles.includes(role.value)
          return (
            <button key={role.value} onClick={() => toggleRole(role.value)} style={{
              padding: '5px 14px', borderRadius: '99px',
              border: `1.5px solid ${active ? role.color : 'var(--slate-200)'}`,
              background: active ? role.color : '#fff',
              color: active ? '#fff' : 'var(--slate-600)',
              fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap',
            }}>
              {role.label}
            </button>
          )
        })}
      </div>

      <div style={{ width: '1px', height: '20px', background: 'var(--slate-200)', flexShrink: 0 }} />

      {/* Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: 'var(--slate-400)',
          textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px',
        }}>
          Time
        </span>
        {TIME_FILTERS.map(tf => {
          const active = timeFilter === tf.value
          return (
            <button key={tf.value} onClick={() => setTimeFilter(tf.value)} style={{
              padding: '5px 14px', borderRadius: '99px',
              border: `1.5px solid ${active ? 'var(--blue-600)' : 'var(--slate-200)'}`,
              background: active ? 'var(--blue-600)' : '#fff',
              color: active ? '#fff' : 'var(--slate-600)',
              fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            }}>
              {tf.dot && !active && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tf.dot, flexShrink: 0 }} />
              )}
              {tf.label}
            </button>
          )
        })}
      </div>

      {/* Reset */}
      {hasFilters && (
        <button onClick={resetFilters} style={{
          marginLeft: 'auto', padding: '5px 12px', borderRadius: '99px',
          border: '1.5px solid var(--red-100)', background: 'var(--red-50)',
          color: 'var(--red-600)', fontSize: '12px', fontWeight: 500,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}>
          ✕ Reset filters
        </button>
      )}
    </div>
  )
}