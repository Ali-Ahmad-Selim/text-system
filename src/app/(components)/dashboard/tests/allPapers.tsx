'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  question: string;
}

interface Test {
  _id: string;
  title: string;
  questions: Question[];
}

const AllPapers = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    questions: [] as Question[]
  });
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter tests based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTests(tests);
    } else {
      const filtered = tests.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.questions.some(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTests(filtered);
    }
  }, [tests, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fetch all tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/papers');
      
      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success && result.data) {
          setTests(result.data);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to fetch tests' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to fetch tests' });
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      setMessage({ type: 'error', text: 'Network error while fetching tests' });
    } finally {
      setLoading(false);
    }
  };

  // Delete test
  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
      setDeleteLoading(testId);
      const response = await fetch(`/api/papers?id=${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success) {
          setTests(prev => prev.filter(test => test._id !== testId));
          setMessage({ type: 'success', text: result.message || 'Test deleted successfully' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to delete test' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to delete test' });
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      setMessage({ type: 'error', text: 'Network error while deleting test' });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Start editing
  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setEditFormData({
      title: test.title,
      questions: [...test.questions]
    });
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
    setEditFormData({ title: '', questions: [] });
    setCurrentQuestion('');
  };

  const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { question: value } : q
      )
    }));
  };

  const addQuestionToEdit = () => {
    if (currentQuestion.trim()) {
      setEditFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { question: currentQuestion }]
      }));
      setCurrentQuestion('');
    }
  };

  const removeQuestionFromEdit = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    if (!editFormData.title.trim()) {
      setMessage({ type: 'error', text: 'Test title is required' });
      return;
    }

    if (editFormData.questions.length === 0) {
      setMessage({ type: 'error', text: 'At least one question is required' });
      return;
    }

    try {
      const response = await fetch('/api/papers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _id: editingTest._id, 
          title: editFormData.title,
          questions: editFormData.questions
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // ✅ Handle new API response format
        if (result.success && result.data) {
          setTests(prev =>
            prev.map(test =>
              test._id === editingTest._id ? result.data : test
            )
          );
          setMessage({ type: 'success', text: 'Test updated successfully' });
          handleCancelEdit();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update test' });
        }
      } else {
        const errorResult = await response.json();
        setMessage({ type: 'error', text: errorResult.error || 'Failed to update test' });
      }
    } catch (error) {
      console.error('Error updating test:', error);
      setMessage({ type: 'error', text: 'Network error while updating test' });
    }
  };

  useEffect(() => {
    fetchTests();
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
        <div className="text-lg text-white">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">All Test Papers</h2>
        <button
          onClick={fetchTests}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by test title or question content..."
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
            Found {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} matching "{searchTerm}"
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

      {filteredTests.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm ? 
            `No tests found matching "${searchTerm}". Try a different search term.` : 
            'No tests found. Create some tests to get started.'
          }
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTests.map(test => (
            <div key={test._id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{test.title}</h3>
                  <p className="text-sm text-gray-400">
                    {test.questions.length} question{test.questions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(test)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    disabled={deleteLoading === test._id}
                    className={`px-3 py-1 text-white text-sm rounded ${
                      deleteLoading === test._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {deleteLoading === test._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Questions Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Questions:</h4>
                {test.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="text-sm text-gray-400 bg-gray-700 p-2 rounded border-l-2 border-blue-500">
                    <span className="font-medium">Q{index + 1}:</span> {question.question}
                  </div>
                ))}
                {test.questions.length > 3 && (
                  <div className="text-sm text-gray-500 italic">
                    ... and {test.questions.length - 3} more question{test.questions.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Edit Test</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Test Title *</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={handleEditTitleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Questions</label>
                <div className="space-y-2 mb-4">
                  {editFormData.questions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestionFromEdit(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                    <textarea
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Add new question..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={addQuestionToEdit}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Test
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEdit} 
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
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

export default AllPapers;
