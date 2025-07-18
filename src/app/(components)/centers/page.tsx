"use client";

import React, { useState, useEffect } from 'react'
import Hafizlik from './Hafizlik';
import Hazirlik from './Hazirlik';
import Ibtidai from './Ibtidai';
import Ihzari from './Ihzari';


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
      case 'Hazirlik':
        return <Hazirlik />;
      case 'Ibtidai':
        return <Ibtidai />;
      case 'Ihzari':
        return <Ihzari />;
      case 'Hafizlik':
        return <Hafizlik />;
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
