'use client'
import React, { useState } from 'react'
import Add from './add'
import AllPapers from './allPapers'

const Page = () => {
  const [activeComponent, setActiveComponent] = useState<'add' | 'allPapers' | 'delete'>('add');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'add':
        return <Add />;
      case 'allPapers':
        return <AllPapers />;
    
      default:
        return <Add />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveComponent('add')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeComponent === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Add Paper
          </button>
          <button
            onClick={() => setActiveComponent('allPapers')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeComponent === 'allPapers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Papers
          </button>
         
        </div>

        {/* Render Active Component */}
        <div>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Page;
