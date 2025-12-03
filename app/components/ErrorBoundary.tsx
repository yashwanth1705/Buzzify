'use client'

import React from 'react'
import { ToastProvider } from '@/app/dashboard/components/toast-provider'

type Props = {
  children: React.ReactNode
}

class Boundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: any}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error in ErrorBoundary:', error, info)
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred. The team has been notified.</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function ErrorBoundary({ children }: Props) {
  return (
    <ToastProvider>
      <Boundary>{children}</Boundary>
    </ToastProvider>
  )
}
