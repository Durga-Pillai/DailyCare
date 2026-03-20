import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Taskboard from './components/Taskboard'
import NetworkBanner from './components/NetworkBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 30 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ minHeight: '100vh', background: 'var(--slate-50)' }}>

        <header style={{
          background: 'var(--blue-900)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 32px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'var(--blue-500)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>✚</div>
            <span style={{ fontWeight: 600, fontSize: '16px', color: '#fff', letterSpacing: '-0.3px' }}>
              DailyCare
            </span>
            <span style={{
              fontSize: '11px',
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              padding: '2px 8px', borderRadius: '99px',
              fontFamily: 'var(--font-mono)',
            }}>
              Dialysis Unit
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 0 2px rgba(34,197,94,0.3)',
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Live</span>
          </div>
        </header>

        <main style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--slate-900)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              Patient Task Board
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
              Manage recurring and ad-hoc tasks across your dialysis team
            </p>
          </div>
          <NetworkBanner />
          <Taskboard />
        </main>
      </div>
    </QueryClientProvider>
  )
}