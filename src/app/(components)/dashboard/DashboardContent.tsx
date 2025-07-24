'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DocumentTextIcon,
  UserGroupIcon,
  UserPlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
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
  const [accessDenied, setAccessDenied] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const categories = ['Hazirlik', 'Ibtidai', 'Ihzari', 'Hafizlik']

  useEffect(() => {
    validateAccess()
  }, [searchParams])

  // Validate user access based on URL parameters and stored data
  const validateAccess = async () => {
    try {
      setIsValidating(true)
      
      // Extract role from URL parameters
const encodedRole = searchParams.get("role");
const decodedRole = encodedRole ? atob(encodedRole) : null;
      const roleFromUrl = decodedRole || 'user'; // Default to 'user' if no role provided      
      // Check if role is provided in URL
      if (!roleFromUrl) {
        console.warn('No role specified in URL, defaulting to user')
        setUserRole('user')
        setAccessDenied(false)
        setLoading(false)
        setIsValidating(false)
        return
      }

      // Validate role value
      if (!['admin', 'user'].includes(roleFromUrl)) {
        console.error('Invalid role specified:', roleFromUrl)
        setAccessDenied(true)
        setIsValidating(false)
        return
      }

      // Set the role
      setUserRole(roleFromUrl)

      // Additional validation: Check if user has valid token (optional)
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (!token || !userData) {
        console.warn('No authentication data found')
        // Optionally redirect to login
        // router.push('/login')
        // return
      }

      // If admin role, validate admin access and load permit data
      if (roleFromUrl === 'admin') {
        // Optional: Add server-side role verification
        const isValidAdmin = await validateAdminRole(token)
        
        if (!isValidAdmin) {
          console.error('Admin role validation failed')
          setAccessDenied(true)
          setIsValidating(false)
          return
        }

        // Load permit data for admin
        await fetchPermitData()
      } else {
        setLoading(false)
      }

      setAccessDenied(false)
    } catch (error) {
      console.error('Access validation error:', error)
      setAccessDenied(true)
    } finally {
      setIsValidating(false)
    }
  }

  // Optional: Validate admin role with server
  const validateAdminRole = async (token: string | null): Promise<boolean> => {
    try {
      if (!token) return false;
      
      // You can add a server endpoint to validate admin role
      // const response = await fetch('/api/validate-admin', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // const result = await response.json()
      // return result.isAdmin
      
      // For now, return true (you can implement server validation)
      return true;
    } catch (error) {
      console.error('Admin validation error:', error)
      return false;
    }
  }

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

  // Define all dashboard items with role-based access
  const allDashboardItems = [
    {
      title: 'Papers',
      description: 'Create and manage test papers',
      icon: DocumentTextIcon,
      path: '/dashboard/tests',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      roles: ['admin'], // Only admin can access
      requiresAdmin: true
    },
    {
      title: 'Students',
      description: 'View and manage students',
      icon: UserGroupIcon,
      path: '/dashboard/students',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      roles: ['admin', 'user'], // Both admin and user can access
      requiresAdmin: false
    },
    {
      title: 'Signup',
      description: 'Register new Teacher',
      icon: UserPlusIcon,
      path: '/dashboard/signup',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      roles: ['admin'], // Only admin can access
      requiresAdmin: true
    }
  ]

  // Filter dashboard items based on user role
  const dashboardItems = allDashboardItems.filter(item =>
    item.roles.includes(userRole)
  )

  const handleNavigation = (path: string) => {
    // Add role parameter to maintain context
    const urlWithRole = `${path}?role=${userRole}`
    router.push(urlWithRole)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Show loading state while validating access
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Validating access...</p>
        </div>
      </div>
    )
  }

  // Show access denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-8">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-300 mb-4">Access Denied</h2>
            <p className="text-red-200 mb-6">
              You don't have permission to access this dashboard or the role specified is invalid.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/dashboard?role=user')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
              >
                Access as User
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
              <div className="flex items-center gap-2">
                {/* Role Indicator */}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  userRole === 'admin'
                    ? 'bg-red-600/20 text-red-300 border border-red-600/30'
                    : 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                }`}>
                  {userRole.toUpperCase()}
                </span>
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

        {/* Access Control Info */}
        <div className="mb-8">
          <div className={`p-4 rounded-lg border ${
            userRole === 'admin'
              ? 'bg-red-900/20 border-red-600/30 text-red-200'
              : 'bg-blue-900/20 border-blue-600/30 text-blue-200'
          }`}>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm">
                  <strong>Current Role:</strong> {userRole === 'admin' ? 'Administrator' : 'User'}
                </p>
                <p className="text-xs mt-1 opacity-75">
                  {userRole === 'admin' 
                    ? 'You have full access to all dashboard features'
                    : 'You have limited access - some features are restricted to administrators'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon
            const isAccessible = item.roles.includes(userRole)
            
            return (
              <div
                key={index}
                onClick={() => isAccessible && handleNavigation(item.path)}
                className={`
                  relative group transform transition-all duration-300
                  ${isAccessible 
                    ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' 
                    : 'cursor-not-allowed opacity-60'
                  }
                `}
              >
                {/* Card */}
                <div className={`bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${
                  isAccessible 
                    ? 'border-gray-700 hover:border-gray-600' 
                    : 'border-gray-800'
                }`}>
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r ${item.color} opacity-0
                    ${isAccessible ? 'group-hover:opacity-10' : ''} rounded-2xl transition-opacity duration-300
                  `} />
                  
                  {/* Access Restriction Overlay */}
                  {!isAccessible && (
                    <div className="absolute inset-0 bg-gray-900/50 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-yellow-300 text-sm font-semibold">Admin Only</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16
                    bg-gradient-to-r ${item.color} rounded-xl mb-4 sm:mb-6
                    ${isAccessible ? 'group-hover:shadow-lg group-hover:shadow-blue-500/25' : ''}
                    transition-all duration-300
                  `}>
                    <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 transition-colors duration-300 ${
                    isAccessible ? 'group-hover:text-blue-400' : ''
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    {item.description}
                  </p>

                  {/* Button */}
                  <div className={`
                    inline-flex items-center px-4 py-2 sm:px-6 sm:py-3
                    bg-gradient-to-r ${item.color} ${isAccessible ? item.hoverColor : ''}
                    text-white font-semibold rounded-lg text-sm sm:text-base
                    transform transition-all duration-300
                    ${isAccessible ? 'group-hover:shadow-lg group-hover:shadow-blue-500/25' : ''}
                  `}>
                    <span>
                      {isAccessible ? `Go to ${item.title}` : 'Access Restricted'}
                    </span>
                    {isAccessible && (
                      <svg
                        className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Glow Effect */}
                {isAccessible && (
                  <div className={`
                    absolute inset-0 bg-gradient-to-r ${item.color} opacity-0
                    group-hover:opacity-20 rounded-2xl blur-xl -z-10
                    transition-opacity duration-300
                  `} />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Access Summary for Users */}
        {userRole === 'user' && (
          <div className="mt-8 text-center">
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">User Access Level</h3>
              <p className="text-blue-200 text-sm mb-4">
                You have user-level access. You can view and manage students, but other administrative features are restricted to administrators.
              </p>
              <div className="text-xs text-blue-300">
                <p><strong>Available:</strong> Students Management</p>
                <p><strong>Restricted:</strong> Papers Management, User Registration</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Features Summary */}
        {userRole === 'admin' && (
          <div className="mt-8 text-center">
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">Administrator Access</h3>
              <p className="text-red-200 text-sm mb-4">
                You have full administrative access to all dashboard features and group access controls.
              </p>
              <div className="text-xs text-red-300">
                <p><strong>Full Access:</strong> Papers, Students, User Registration, Group Permissions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardContent

