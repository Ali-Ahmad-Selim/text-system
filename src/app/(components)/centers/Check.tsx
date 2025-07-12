'use client';

import React, { useState } from 'react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  group: string;
}

const Check = () => {
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [showgroupInput, setShowgroupInput] = useState(false);
  const [enteredgroup, setEnteredgroup] = useState('');

  const checkStudent = async () => {
    if (!searchName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a student name' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setFoundStudent(null);
    setShowgroupInput(false);

    try {
      const response = await fetch('/api/students');
      
      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success && result.data) {
          const students: Student[] = result.data;
          
          // Find student by exact name match (case-insensitive)
          const student = students.find(student => 
            student.name.toLowerCase().trim() === searchName.toLowerCase().trim()
          );

          if (student) {
            setFoundStudent(student);
            setShowgroupInput(true);
            setMessage({ type: 'success', text: `Student "${student.name}" found! Please enter your roll number to continue.` });
          } else {
            setMessage({ type: 'error', text: `Student "${searchName}" does not exist` });
          }
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to fetch students' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to check student' });
      }
    } catch (error) {
      console.error('Error checking student:', error);
      setMessage({ type: 'error', text: 'Network error while checking student' });
    } finally {
      setLoading(false);
    }
  };

  const verifygroup = () => {
    if (!foundStudent || !enteredgroup.trim()) {
      setMessage({ type: 'error', text: 'Please enter your roll number' });
      return;
    }

    try {
      // Get saved center from localStorage
      const savedCenter = localStorage.getItem("user");
      
      if (!savedCenter) {
        setMessage({ type: 'error', text: 'No user data found. Please login again.' });
        return;
      }

      // Check if entered roll number matches the found student's roll number
      if (foundStudent.group === enteredgroup.trim()) {
        // Also check if it matches the saved center (assuming savedCenter contains roll number)
        if (savedCenter === enteredgroup.trim()) {
          setMessage({ type: 'success', text: 'Verification successful! Redirecting to papers...' });
          
          // Redirect to papers page after a short delay
          setTimeout(() => {
            window.location.href = '/papers';
          }, 1500);
        } else {
          setMessage({ type: 'error', text: 'Roll number does not match your registered center data' });
        }
      } else {
        setMessage({ type: 'error', text: 'Incorrect roll number for this student' });
      }
    } catch (error) {
      console.error('Error verifying roll number:', error);
      setMessage({ type: 'error', text: 'Error during verification' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showgroupInput) {
        verifygroup();
      } else {
        checkStudent();
      }
    }
  };

  const clearSearch = () => {
    setSearchName('');
    setEnteredgroup('');
    setMessage(null);
    setFoundStudent(null);
    setShowgroupInput(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-2xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">
            Student Verification
          </h2>
          
          {/* Search Input */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter exact student name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                disabled={loading || showgroupInput}
              />
              
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={checkStudent}
                  disabled={loading || showgroupInput}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    loading || showgroupInput
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
                
                {(searchName || showgroupInput) && (
                  <button
                    onClick={clearSearch}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Helper text for exact matching */}
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Note: Enter the complete and exact student name (case doesn't matter)
            </p>
          </div>

          {/* Roll Number Input (shown after student is found) */}
          {showgroupInput && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Roll Number for Verification
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter your roll number..."
                  value={enteredgroup}
                  onChange={(e) => setEnteredgroup(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
                
                <button
                  onClick={verifygroup}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Result Message */}
          {message && (
            <div
              className={`p-3 sm:p-4 rounded-lg border text-center mb-4 sm:mb-6 ${
                message.type === 'success'
                  ? 'bg-green-900 text-green-200 border-green-600'
                  : 'bg-red-900 text-red-200 border-red-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm sm:text-base lg:text-lg font-medium break-words">
                  {message.text}
                </span>
              </div>
            </div>
          )}

          {/* Student Info Display */}
          {foundStudent && (
            <div className="mt-4 p-3 sm:p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Student Found:
              </h3>
              <div className="space-y-1 text-sm sm:text-base">
                <p className="text-gray-300">
                  <span className="font-medium">Name:</span> {foundStudent.name}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Student ID:</span> {foundStudent.studentId}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Check;
