"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PermitData {
  _id: string;
  Hazirlik: { permission: 'granted' | 'denied' };
  Ibtidai: { permission: 'granted' | 'denied' };
  Ihzari: { permission: 'granted' | 'denied' };
  Hafizlik: { permission: 'granted' | 'denied' };
}

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [permitData, setPermitData] = useState<PermitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<{[key: string]: boolean}>({});

  const router = useRouter();

  // Fetch permit data from API
  const fetchPermitData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permit');
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const permit = result.data[0]; // Use the first permit
        setPermitData(permit);
        
        // Set access status based on permit data
        const status: {[key: string]: boolean} = {};
        hostels.forEach(hostel => {
          const permission = permit[hostel.name as keyof PermitData]?.permission;
          status[hostel.name] = permission === 'granted';
        });
        setAccessStatus(status);
      } else {
        // If no permit data, deny access to all
        const status: {[key: string]: boolean} = {};
        hostels.forEach(hostel => {
          status[hostel.name] = false;
        });
        setAccessStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch permit data:', error);
      // On error, deny access to all
      const status: {[key: string]: boolean} = {};
      hostels.forEach(hostel => {
        status[hostel.name] = false;
      });
      setAccessStatus(status);
    } finally {
      setLoading(false);
    }
  };

  const handle = (centerName: string) => {
    const hasAccess = accessStatus[centerName];
    
    if (hasAccess) {
      localStorage.setItem("user", centerName);
      router.push("/centers");
    } else {
      alert(`Access denied to ${centerName}. Please contact administrator.`);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    setMounted(true);
    fetchPermitData();
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-[110%] bg-gray-900 flex flex-col p-6">
      {/* Header with Login/Signup buttons */}
      <div className="w-full flex justify-end mb-6">
        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            className="px-4 py-2 md:px-6 md:py-2 text-sm md:text-base font-medium text-white bg-transparent border border-gray-600 hover:bg-gray-700 hover:border-gray-500 rounded-lg transition-all duration-200"
          >
            Login
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-300 mb-4">
              Welcome to
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Hamidiye Test System
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto">
              Your gateway to comprehensive testing solutions
            </p>
          </div>

          {/* Choose Center Section */}
          <div>
            <div className="bg-gray-800 rounded-xl p-6 md:p-8 border border-gray-700">
              {/* Choose Your Center Title */}
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-6 md:mb-8">
                Choose Your Center
              </h3>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="ml-3 text-white">Loading centers...</span>
                </div>
              ) : (
                /* Centers List */
                <div className="space-y-3">
                  {hostels.map((hostel) => {
                    const hasAccess = accessStatus[hostel.name];
                    
                    return (
                      <button
                        key={hostel.id}
                        className={`block w-full px-4 py-3 md:px-6 md:py-4 text-base md:text-lg font-medium text-white bg-transparent border rounded-lg transition-all duration-200 text-center relative ${
                          hasAccess 
                            ? 'border-gray-600 hover:bg-blue-600 hover:border-blue-600 active:bg-blue-800 active:border-blue-800 cursor-pointer' 
                            : 'border-red-600/50 bg-gray-900/50 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => { handle(hostel.name) }}
                        disabled={!hasAccess}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{hostel.name}</span>
                          
                          {/* Access Status Indicator */}
                          <div className="flex items-center ml-4">
                            {hasAccess ? (
                              <div className="flex items-center text-green-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs">Accessible</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs">Access Denied</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Refresh Button */}
              {!loading && (
                <div className="mt-6 text-center">
                  <button
                    onClick={fetchPermitData}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
                  >
                    Refresh Access Status
                  </button>
                </div>
              )}
            </div>
          </div>

          

          {/* Footer */}
          <div className="mt-8">
            <p className="text-gray-600 text-sm">© Designed and developed by <a className="text-blue-600 hover:underline" >Ali Ahmad</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const hostels = [
  { id: 1, name: "Hazirlik" },
  { id: 2, name: "Ibtidai" },
  { id: 3, name: "Ihzari" },
  { id: 4, name: "Hafizlik" },
];
