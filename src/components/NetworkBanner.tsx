// src/components/NetworkBanner.tsx

import { useState, useEffect } from 'react'

export default function NetworkBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    function handleOffline() {
      setIsOnline(false)
      setShowRestored(false)
    }

    function handleOnline() {
      setIsOnline(true)
      setShowRestored(true)
      // Hide "restored" message after 3 seconds
      setTimeout(() => setShowRestored(false), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  // Online and no recent restore — show nothing
  if (isOnline && !showRestored) return null

  return (
    <div style={{
      padding:      '10px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize:     '13px',
      fontWeight:   600,
      display:      'flex',
      alignItems:   'center',
      gap:          '8px',
      background:   isOnline ? '#e8f5e9' : '#fff0f0',
      border:       `1px solid ${isOnline ? '#a5d6a7' : '#ffcccc'}`,
      color:        isOnline ? '#2e7d32' : '#cc0000',
    }}>
      {isOnline
        ? '✅ Connection restored — changes will sync automatically.'
        : '⚠️ You are offline — changes may not save until connection is restored.'
      }
    </div>
  )
}