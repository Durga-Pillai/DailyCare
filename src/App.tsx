// src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Taskboard from './components/Taskboard'
import NetworkBanner from './components/NetworkBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,                // retry failed requests twice
      staleTime: 1000 * 30,   // cache fresh for 30 seconds
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <h1 style={{ marginBottom: '8px' }}>🏥 DailyCare</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Dialysis Task Management
        </p>
        <NetworkBanner />
        <Taskboard />
      </div>
    </QueryClientProvider>
  )
}

export default App