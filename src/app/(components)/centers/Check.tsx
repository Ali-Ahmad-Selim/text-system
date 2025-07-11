'use client';

import React, { useState, useEffect } from 'react';
import {connection} from "../../../database/connection"

interface Student {
  _id: string;
  studentId: string;
  name: string;
  rollNumber: string;
}

connection()
const Check = () => {
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [showRollNumberInput, setShowRollNumberInput] = useState(false);
  const [enteredRollNumber, setEnteredRollNumber] = useState('');

  const checkStudent = async () => {
    if (!searchName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a student name' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setFoundStudent(null);
    setShowRollNumberInput(false);

    try {
      const response = await fetch('/api/students');
      
      if (response.ok) {
        const students: Student[] = await response.json();
        
        // Find student by exact name match (case-insensitive)
        const student = students.find(student => 
          student.name.toLowerCase().trim() === searchName.toLowerCase().trim()
        );

        if (student) {
          setFoundStudent(student);
          setShowRollNumberInput(true);
          setMessage({ type: 'success', text: `Student "${student.name}" found! Please enter your roll number to continue.` });
        } else {
          setMessage({ type: 'error', text: `Student "${searchName}" does not exist` });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to check student' });
      }
    } catch (error) {
      console.error('Error checking student:', error);
      setMessage({ type: 'error', text: 'Network error while checking student' });
    } finally {
      setLoading(false);
    }
  };

  const verifyRollNumber = () => {
    if (!foundStudent || !enteredRollNumber.trim()) {
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
      if (foundStudent.rollNumber === enteredRollNumber.trim()) {
        // Also check if it matches the saved center (assuming savedCenter contains roll number)
        if (savedCenter === enteredRollNumber.trim()) {
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
      if (showRollNumberInput) {
        verifyRollNumber();
      } else {
        checkStudent();
      }
    }
  };

  const clearSearch = () => {
    setSearchName('');
    setEnteredRollNumber('');
    setMessage(null);
    setFoundStudent(null);
    setShowRollNumberInput(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Student Verification</h2>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter exact student name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || showRollNumberInput}
            />
            
            <button
              onClick={checkStudent}
              disabled={loading || showRollNumberInput}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                loading || showRollNumberInput
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
            
            {(searchName || showRollNumberInput) && (
              <button
                onClick={clearSearch}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Helper text for exact matching */}
          <p className="text-sm text-gray-400 mt-2">
            Note: Enter the complete and exact student name (case doesn't matter)
          </p>
        </div>

        {/* Roll Number Input (shown after student is found) */}
        {showRollNumberInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Roll Number for Verification
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter your roll number..."
                value={enteredRollNumber}
                onChange={(e) => setEnteredRollNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              
              <button
                onClick={verifyRollNumber}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Result Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border text-center ${
              message.type === 'success'
                ? 'bg-green-900 text-green-200 border-green-600'
                : 'bg-red-900 text-red-200 border-red-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {message.type === 'success' ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-lg font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Student Info Display (optional) */}
        {foundStudent && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-2">Student Found:</h3>
            <p className="text-gray-300">Name: {foundStudent.name}</p>
            <p className="text-gray-300">Student ID: {foundStudent.studentId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Check;
