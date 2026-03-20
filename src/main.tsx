// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  // Only run MSW in development
  if (import.meta.env.DEV) {
    const { worker } = await import('./api/msw/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }

  // In production — still use MSW but as a fallback
  const { worker } = await import('./api/msw/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
