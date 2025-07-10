"use client";

import React, { useState, useEffect } from 'react'
import Haji from './Haji'
import Hamidiye from './Hamidiye'
import Valencia from './Valencia'
import Uni from './Uni'
import Vefa from './Vefa'

const Page = () => {
  const [center, setCenter] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCenter = localStorage.getItem("user");
    setCenter(savedCenter);

    // Optional: Remove after reading if you want
    // localStorage.removeItem("user");
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Render appropriate component based on center
  const renderCenterComponent = () => {

    switch(center) {
      case 'Uni Hostel':
        return <Uni />;
      case 'Valencia':
        return <Valencia />;
      case 'Hamidiye':
        return <Hamidiye />;
      case 'Haji Unal':
        return <Haji />;
      case 'Vefa':
        return <Vefa />;
      default:
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-white text-xl">
              No center selected or invalid center: {center}
            </div>

            
          </div>
        );
    }
  };

  return (
    <div>

      {renderCenterComponent()}
    </div>
  );
};

export default Page;
