'use client';

import React, { useState, useEffect } from 'react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  group: string;
}

interface HistoryItem {
  date: string;
  paperTitle: string;
  marks: number;
  totalMarks: number;
}

const GetStudent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    group: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // History modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);

  // Date formatting helper function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Simple date format (YYYY-MM-DD)
      return date.toISOString().split('T')[0];
      
      // Alternative formats (uncomment the one you prefer):
      // return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
      // return date.toLocaleDateString('en-US'); // MM/DD/YYYY
      // return date.toLocaleDateString('en-US', { 
      //   year: 'numeric', 
      //   month: 'long', 
      //   day: 'numeric' 
      // }); // January 18, 2025
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.group.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      
      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success && result.data) {
          setStudents(result.data);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to fetch students' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to fetch students' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Network error while fetching students' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch student history
  const fetchStudentHistory = async (studentId: string) => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`/api/students?studentId=${studentId}&includeHistory=true`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setHistoryData(result.data.history || []);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to fetch student history' });
          setHistoryData([]);
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to fetch student history' });
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Error fetching student history:', error);
      setMessage({ type: 'error', text: 'Network error while fetching student history' });
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle show history
  const handleShowHistory = async (student: Student) => {
    setSelectedStudentForHistory(student);
    setShowHistoryModal(true);
    await fetchStudentHistory(student.studentId);
  };

  // Close history modal
  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedStudentForHistory(null);
    setHistoryData([]);
  };

  // Delete student
  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      setDeleteLoading(studentId);
      const response = await fetch(`/api/students?studentId=${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success) {
          setStudents(prev => prev.filter(student => student.studentId !== studentId));
          setMessage({ type: 'success', text: result.message || 'Student deleted successfully' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to delete student' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to delete student' });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setMessage({ type: 'error', text: 'Network error while deleting student' });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Start editing
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      group: student.group,
    });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({ name: '', group: '' });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const response = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: editingStudent.studentId, ...editFormData }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success && result.data) {
          setStudents(prev =>
            prev.map(student =>
              student.studentId === editingStudent.studentId ? result.data : student
            )
          );
          setMessage({ type: 'success', text: 'Student updated successfully' });
          handleCancelEdit();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update student' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to update student' });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      setMessage({ type: 'error', text: 'Network error while updating student' });
    }
  };

  // Calculate percentage for history items
  const calculatePercentage = (marks: number, totalMarks: number) => {
    if (totalMarks === 0) return 0;
    return Math.round((marks / totalMarks) * 100);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-white">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">All Students</h2>
        <button
          onClick={fetchStudents}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, student ID, or Group..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-10 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-400">
            Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </div>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-800 text-green-200 border border-green-600'
              : 'bg-red-800 text-red-200 border border-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {filteredStudents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm ? 
            `No students found matching "${searchTerm}". Try a different search term.` : 
            'No students found. Add some students to get started.'
          }
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map(student => (
            <div key={student._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                  <p className="text-sm text-gray-300">ID: {student.studentId}</p>
                  <p className="text-sm text-gray-300">Group: {student.group}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleShowHistory(student)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 w-full sm:w-auto"
                  >
                    Show History
                  </button>
                  <button
                    onClick={() => handleEdit(student)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 w-full sm:w-auto"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student.studentId)}
                    disabled={deleteLoading === student.studentId}
                    className={`px-3 py-1 text-white text-sm rounded w-full sm:w-auto ${
                      deleteLoading === student.studentId
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {deleteLoading === student.studentId ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
            {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Edit Student</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Student ID (Read-only)
                </label>
                <input
                  type="text"
                  value={editingStudent.studentId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Group *</label>
                <input
                  type="text"
                  name="group"
                  value={editFormData.group}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button type="submit" className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Update Student
                </button>
                <button type="button" onClick={handleCancelEdit} className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedStudentForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-gray-700 gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Test History</h3>
                <p className="text-gray-300 text-sm mt-1">
                  {selectedStudentForHistory.name} (ID: {selectedStudentForHistory.studentId})
                </p>
              </div>
              <button
                onClick={handleCloseHistoryModal}
                className="text-gray-400 hover:text-white transition-colors self-end sm:self-auto"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {historyLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-white">Loading history...</div>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">No Data to Display</div>
                  <p className="text-gray-500 text-sm">This student hasn't taken any tests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="pb-3 text-gray-300 font-medium">Date</th>
                            <th className="pb-3 text-gray-300 font-medium">Test Title</th>
                            <th className="pb-3 text-gray-300 font-medium">Score</th>
                            <th className="pb-3 text-gray-300 font-medium">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyData.map((item, index) => (
                            <tr key={index} className="border-b border-gray-700 last:border-b-0">
                              <td className="py-3 text-white">{formatDate(item.date)}</td>
                              <td className="py-3 text-white">{item.paperTitle}</td>
                              <td className="py-3 text-white">
                                {item.marks}/{item.totalMarks}
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  calculatePercentage(item.marks, item.totalMarks) >= 70
                                    ? 'bg-green-800 text-green-200'
                                    : calculatePercentage(item.marks, item.totalMarks) >= 50
                                    ? 'bg-yellow-800 text-yellow-200'
                                    : 'bg-red-800 text-red-200'
                                }`}>
                                  {calculatePercentage(item.marks, item.totalMarks)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {historyData.map((item, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium text-sm">{item.paperTitle}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            calculatePercentage(item.marks, item.totalMarks) >= 70
                              ? 'bg-green-800 text-green-200'
                              : calculatePercentage(item.marks, item.totalMarks) >= 50
                              ? 'bg-yellow-800 text-yellow-200'
                              : 'bg-red-800 text-red-200'
                          }`}>
                            {calculatePercentage(item.marks, item.totalMarks)}%
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Date:</span>
                            <span className="text-white">{formatDate(item.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Score:</span>
                            <span className="text-white">{item.marks}/{item.totalMarks}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  {historyData.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <h4 className="text-white font-medium mb-3">Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-700 rounded p-3">
                          <div className="text-gray-300">Total Tests</div>
                          <div className="text-white font-medium text-lg">{historyData.length}</div>
                        </div>
                        <div className="bg-gray-700 rounded p-3">
                          <div className="text-gray-300">Average Score</div>
                          <div className="text-white font-medium text-lg">
                            {Math.round(
                              historyData.reduce((acc, item) => 
                                acc + calculatePercentage(item.marks, item.totalMarks), 0
                              ) / historyData.length
                            )}%
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded p-3">
                          <div className="text-gray-300">Best Score</div>
                          <div className="text-white font-medium text-lg">
                            {Math.max(
                              ...historyData.map(item => 
                                calculatePercentage(item.marks, item.totalMarks)
                              )
                            )}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={handleCloseHistoryModal}
                className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetStudent;

