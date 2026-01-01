'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">문제가 발생했습니다!</h2>
      <p className="text-gray-600 text-center mb-6">
        저희가 처리할 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        다시 시도
      </button>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-w-full overflow-auto">
          <code>{error.message}</code>
        </pre>
      )}
    </div>
  )
}
