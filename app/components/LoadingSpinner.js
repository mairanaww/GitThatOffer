// components/LoadingSpinner.js
export default function LoadingSpinner({ size = 'md', color = 'blue' }) {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    }
  
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      gray: 'text-gray-600',
      white: 'text-white'
    }
  
    return (
      <div className="flex justify-center items-center">
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }
  
  export function LoadingOverlay({ message = 'Loading...' }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    )
  }
  
  export function InlineLoader({ message = 'Loading...', className = '' }) {
    return (
      <div className={`flex items-center justify-center space-x-3 py-8 ${className}`}>
        <LoadingSpinner />
        <span className="text-gray-600">{message}</span>
      </div>
    )
  }
  