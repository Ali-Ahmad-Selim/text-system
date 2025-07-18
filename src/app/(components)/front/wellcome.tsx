"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  
  const handle = (e: string) => {
    localStorage.setItem("user", e);
    router.push("/centers");
  };

  const handleLogin = () => {
    router.push("/login");
  };

 

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-[100%] bg-gray-900 flex flex-col p-6">
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

              {/* Centers List */}
              <div className="space-y-3">
                {hostels.map((hostel) => (
                  <button
                    key={hostel.id}
                    className="block w-full px-4 py-3 md:px-6 md:py-4 text-base md:text-lg font-medium text-white bg-transparent border border-gray-600 hover:bg-blue-600 hover:border-blue-600 active:bg-blue-800 active:border-blue-800 rounded-lg transition-all duration-200 text-center"
                    onClick={() => { handle(hostel.name) }}
                  >
                    {hostel.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <p className="text-gray-600 text-sm">© 2024 Hamidiye Test System</p>
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
