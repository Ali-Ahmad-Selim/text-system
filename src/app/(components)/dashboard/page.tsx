import { Suspense } from 'react'
import DashboardContent from '../dashboard/DashboardContent'

// Loading component for the dashboard
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header Skeleton */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-600 rounded mr-2 sm:mr-3 animate-pulse"></div>
              <div className="h-6 w-48 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section Skeleton */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-8 w-96 bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-64 bg-gray-700 rounded mx-auto animate-pulse"></div>
        </div>

        {/* Role Badge Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-8 w-32 bg-gray-700 rounded-full animate-pulse"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-xl mb-4 sm:mb-6 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-600 rounded mb-2 sm:mb-3 animate-pulse"></div>
              <div className="h-4 w-full bg-gray-600 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-600 rounded mb-4 sm:mb-6 animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-600 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Page Component (Server Component)
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
