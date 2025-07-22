'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DocumentTextIcon,
  UserGroupIcon,
  UserPlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface PermitData {
  _id: string;
  Hazirlik: { permission: 'granted' | 'denied' };
  Ibtidai: { permission: 'granted' | 'denied' };
  Ihzari: { permission: 'granted' | 'denied' };
  Hafizlik: { permission: 'granted' | 'denied' };
}

// Helper function to get permission for a category
const getPermissionForCategory = (permitData: PermitData | null, category: string): 'granted' | 'denied' => {
  if (!permitData) return 'denied';
  
  switch (category) {
    case 'Hazirlik':
      return permitData.Hazirlik?.permission || 'denied';
    case 'Ibtidai':
      return permitData.Ibtidai?.permission || 'denied';
    case 'Ihzari':
      return permitData.Ihzari?.permission || 'denied';
    case 'Hafizlik':
      return permitData.Hafizlik?.permission || 'denied';
    default:
      return 'denied';
  }
};

const DashboardContent = () => {
  const [userRole, setUserRole] = useState<string>('user')
  const [permitData, setPermitData] = useState<PermitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const categories = ['Hazirlik', 'Ibtidai', 'Ihzari', 'Hafizlik']

  useEffect(() => {
    // Extract role from URL parameters
    const roleFromUrl = searchParams.get('role')
    if (roleFromUrl) {
      setUserRole(roleFromUrl)
    }

    // Load permit data if admin
    if (roleFromUrl === 'admin') {
      fetchPermitData()
    } else {
      setLoading(false)
    }
  }, [searchParams])

  // Fetch permit data from API
  const fetchPermitData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/permit')
      const result = await response.json()

      if (result.success && result.data.length > 0) {
        // Use the first permit if multiple exist
        setPermitData(result.data[0])
      } else {
        // Create a new permit if none exists
        await createDefaultPermit()
      }
    } catch (error) {
      console.error('Failed to fetch permit data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create default permit
  const createDefaultPermit = async () => {
    try {
      const response = await fetch('/api/permit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      const result = await response.json()
      if (result.success) {
        setPermitData(result.data)
      }
    } catch (error) {
      console.error('Failed to create default permit:', error)
    }
  }

  // Update permission using PATCH request
  const updatePermission = async (category: string, permission: 'granted' | 'denied') => {
    if (!permitData) return

    try {
      setUpdating(category)
      
      const response = await fetch('/api/permit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permitId: permitData._id,
          category,
          permission
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setPermitData(result.data)
        console.log(`${category} permission updated to ${permission}`)
      } else {
        console.error('Failed to update permission:', result.error)
      }
    } catch (error) {
      console.error('Error updating permission:', error)
    } finally {
      setUpdating(null)
    }
  }

  // Define all dashboard items
  const allDashboardItems = [
    {
      title: 'Papers',
      description: 'Create and manage test papers',
      icon: DocumentTextIcon,
      path: '/dashboard/tests',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      roles: ['admin']
    },
    {
      title: 'Students',
      description: 'View and manage students',
      icon: UserGroupIcon,
      path: '/dashboard/students',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      roles: ['admin', 'user']
    },
    {
      title: 'Signup',
      description: 'Register new Teacher',
      icon: UserPlusIcon,
      path: '/dashboard/signup',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      roles: ['admin']
    }
  ]

  // Filter dashboard items based on user role
  const dashboardItems = allDashboardItems.filter(item =>
    item.roles.includes(userRole)
  )

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Permission Management Section - Only show for admin */}
      {userRole === 'admin' && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
                Group Access Control
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="ml-3 text-white">Loading permissions...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {categories.map((category) => {
                    const currentPermission = getPermissionForCategory(permitData, category)
                    const isUpdating = updating === category

                    return (
                      <div key={category} className="bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600">
                        {/* Category Name */}
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center">
                          {category}
                        </h3>
                        
                        {/* Current Status */}
                        <div className="mb-3 sm:mb-4 text-center">
                          <span className="text-xs sm:text-sm text-gray-300 block mb-1">Current Status:</span>
                          <div className="flex items-center justify-center">
                            {currentPermission === 'granted' ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-1" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-400 mr-1" />
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              currentPermission === 'granted'
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}>
                              {currentPermission.charAt(0).toUpperCase() + currentPermission.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePermission(category, 'granted')}
                            disabled={isUpdating}
                            className={`flex-1 py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded transition-all duration-200 flex items-center justify-center ${
                              currentPermission === 'granted'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Granted
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => updatePermission(category, 'denied')}
                            disabled={isUpdating}
                            className={`flex-1 py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded transition-all duration-200 flex items-center justify-center ${
                              currentPermission === 'denied'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Denied
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {userRole === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs sm:text-sm text-gray-400">
                Welcome, {userRole === 'admin' ? 'Administrator' : 'User'}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Test Management System
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            {userRole === 'admin'
              ? 'Manage your test papers, students, and registrations from one central location'
              : 'Access and manage student information'
            }
          </p>
        </div>

        {/* Role Badge */}
        <div className="flex justify-center mb-8">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            userRole === 'admin'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            {userRole === 'admin' ? 'Administrator' : 'User'} Access
          </span>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r ${item.color} opacity-0
                    group-hover:opacity-10 rounded-2xl transition-opacity duration-300
                  `} />
                  
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16
                    bg-gradient-to-r ${item.color} rounded-xl mb-4 sm:mb-6
                    group-hover:shadow-lg group-hover:shadow-blue-500/25
                    transition-all duration-300
                  `}>
                    <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    {item.description}
                  </p>

                  {/* Button */}
                  <div className={`
                    inline-flex items-center px-4 py-2 sm:px-6 sm:py-3
                    bg-gradient-to-r ${item.color} ${item.hoverColor}
                    text-white font-semibold rounded-lg text-sm sm:text-base
                    transform transition-all duration-300
                    group-hover:shadow-lg group-hover:shadow-blue-500/25
                  `}>
                    <span>Go to {item.title}</span>
                    <svg
                      className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300"
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
        
        {/* No Access Message for Users */}
        {userRole === 'user' && dashboardItems.length === 1 && (
          <div className="mt-8 text-center">
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Limited Access</h3>
              <p className="text-blue-200 text-sm">
                You have user-level access. You can view and manage students, but other administrative features are restricted to administrators.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardContent

