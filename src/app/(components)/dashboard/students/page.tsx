'use client';

import React, { useState } from 'react';
import AddStudent from './AddStudent';
import GetStudent from './GetStudent';

type ActiveView = 'home' | 'add' | 'view';

const Page = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  const renderContent = () => {
    switch (activeView) {
      case 'add':
        return <AddStudent />;
      case 'view':
        return <GetStudent />;
      default:
        return <AddStudent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Buttons */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveView('add')}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              activeView === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Add Student
          </button>
          <button
            onClick={() => setActiveView('view')}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              activeView === 'view'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Get Students
          </button>
        </div>

        {/* Main Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Page;
