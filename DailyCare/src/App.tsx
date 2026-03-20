import {QueryClient,QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>DailyCare</h1>
      </div>
    </QueryClientProvider>
  )
}

export default App