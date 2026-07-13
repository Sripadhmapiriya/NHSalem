import React from 'react'
import Button from '@/components/ui/Button'

/**
 * ErrorBoundary - catches rendering errors and displays a user-friendly error page.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '48px' }} aria-hidden="true">
                error
              </span>
            </div>
            <h1 className="text-display-lg-mobile text-on-surface mb-2 font-bold">Something Went Wrong</h1>
            <p className="text-body-lg text-on-surface-variant mb-8">
              An unexpected error occurred. Please try reloading the page or return to safety.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="secondary" onClick={this.handleReset}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
