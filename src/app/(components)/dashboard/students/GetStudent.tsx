'use client';

import React, { useState, useEffect } from 'react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  rollNumber: string;
}

const GetStudent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    rollNumber: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch students' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Network error while fetching students' });
    } finally {
      setLoading(false);
    }
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
        setStudents(prev => prev.filter(student => student.studentId !== studentId));
        setMessage({ type: 'success', text: 'Student deleted successfully' });
      } else {
        const result = await response.json();
        setMessage({ type: 'error', text: result.error || 'Failed to delete student' });
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
      rollNumber: student.rollNumber,
    });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({ name: '', rollNumber: '' });
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
        const updatedStudent = await response.json();
        setStudents(prev =>
          prev.map(student =>
            student.studentId === editingStudent.studentId ? updatedStudent : student
          )
        );
        setMessage({ type: 'success', text: 'Student updated successfully' });
        handleCancelEdit();
      } else {
        const result = await response.json();
        setMessage({ type: 'error', text: result.error || 'Failed to update student' });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      setMessage({ type: 'error', text: 'Network error while updating student' });
    }
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">All Students</h2>
        <button
          onClick={fetchStudents}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
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

      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No students found. Add some students to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map(student => (
            <div key={student._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                  <p className="text-sm text-gray-300">ID: {student.studentId}</p>
                  <p className="text-sm text-gray-300">Roll: {student.rollNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student.studentId)}
                    disabled={deleteLoading === student.studentId}
                    className={`px-3 py-1 text-white text-sm rounded ${
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Roll Number *</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={editFormData.rollNumber}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
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
    </div>
  );
};

export default GetStudent;
