import ErrorBoundary from '@/ErrorBoundary'
import AppRouter from '@/router'

/**
 * App - Root application component that wraps the Router with Error Boundary
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  )
}
