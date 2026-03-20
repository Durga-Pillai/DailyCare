import { useState, useEffect } from 'react'

export default function NetworkBanner() {
  const [isOnline, setIsOnline]       = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    function handleOffline() { setIsOnline(false); setShowRestored(false) }
    function handleOnline()  { setIsOnline(true); setShowRestored(true); setTimeout(() => setShowRestored(false), 3000) }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    return () => { window.removeEventListener('offline', handleOffline); window.removeEventListener('online', handleOnline) }
  }, [])

  if (isOnline && !showRestored) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 16px', borderRadius: 'var(--radius-md)',
      marginBottom: '16px', fontSize: '13px', fontWeight: 500,
      background: isOnline ? 'var(--green-50)' : 'var(--red-50)',
      border: `1px solid ${isOnline ? 'var(--green-100)' : 'var(--red-100)'}`,
      color: isOnline ? 'var(--green-700)' : 'var(--red-600)',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? 'var(--green-500)' : 'var(--red-500)', flexShrink: 0 }} />
      {isOnline ? 'Connection restored — changes will sync automatically.' : 'You are offline — changes may not save until connection is restored.'}
    </div>
  )
}