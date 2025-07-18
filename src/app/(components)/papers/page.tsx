'use client'
import React, { Suspense } from 'react'
import PapersContent  from './PapersContent'
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 text-center">
          Loading...
        </h1>
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-600 hover:bg-blue-500 transition ease-in-out duration-150 cursor-not-allowed">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading papers...
          </div>
        </div>
      </div>
    </div>
  </div>
)

const PapersPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PapersContent />
    </Suspense>
  )
}

export default PapersPage
