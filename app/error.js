'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Global Error Boundary
 * Catches errors in the app and displays a safe error page
 * without exposing sensitive information
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to console (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    } else {
      // In production, log to error tracking service (e.g., Sentry)
      console.error('Application error occurred')
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again later.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline">
              Return Home
            </Button>
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-8 p-4 bg-gray-100 rounded text-left">
            <summary className="cursor-pointer font-semibold mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
