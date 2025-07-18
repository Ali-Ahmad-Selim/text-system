"use client";
import React, { useState } from 'react';
import Add from './Add';
import AllUsers from './AllUsers';

const page = () => {
  const [activeComponent, setActiveComponent] = useState('add');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Buttons */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveComponent('add')}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              activeComponent === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Add
          </button>
          <button
            onClick={() => setActiveComponent('allUsers')}
            className={`px-6 py-3 rounded-lg transition-colors font-medium ${
              activeComponent === 'allUsers'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Users
          </button>
        </div>

        {/* Main Content */}
        <div>
          {activeComponent === 'add' ? <Add /> : <AllUsers />}
        </div>
      </div>
    </div>
  );
};

export default page;