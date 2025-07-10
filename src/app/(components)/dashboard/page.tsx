'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  UserPlusIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const router = useRouter()

  const dashboardItems = [
    {
      title: 'Papers',
      description: 'Create and manage test papers',
      icon: DocumentTextIcon,
      path: '/dashboard/tests',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'Students',
      description: 'View and manage students',
      icon: UserGroupIcon,
      path: '/dashboard/students',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      title: 'Signup',
      description: 'Register new students',
      icon: UserPlusIcon,
      path: '/dashboard/signup',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-400">
              Welcome, Administrator
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Test Management System
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your test papers, students, and registrations from one central location
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`
                  relative group cursor-pointer transform transition-all duration-300 
                  hover:scale-105 hover:-translate-y-2
                `}
              >
                {/* Card */}
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 
                    group-hover:opacity-10 rounded-2xl transition-opacity duration-300
                  `} />
                  
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 
                    bg-gradient-to-r ${item.color} rounded-xl mb-6
                    group-hover:shadow-lg group-hover:shadow-blue-500/25
                    transition-all duration-300
                  `}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-base leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Button */}
                  <div className={`
                    inline-flex items-center px-6 py-3 
                    bg-gradient-to-r ${item.color} ${item.hoverColor}
                    text-white font-semibold rounded-lg
                    transform transition-all duration-300
                    group-hover:shadow-lg group-hover:shadow-blue-500/25
                  `}>
                    <span>Go to {item.title}</span>
                    <svg 
                      className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 
                  group-hover:opacity-20 rounded-2xl blur-xl -z-10
                  transition-opacity duration-300
                `} />
              </div>
            )
          })}
        </div>

      
      </div>
    </div>
  )
}

export default Dashboard
