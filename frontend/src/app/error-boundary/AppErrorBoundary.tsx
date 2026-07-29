import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '@/shared/components/ErrorState'
import { env } from '@/shared/config/env'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (env.isDev) {
      console.error('[AppErrorBoundary]', error.message, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-main">
          <ErrorState
            onRetry={() => {
              this.setState({ hasError: false })
              window.location.assign('/')
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}
