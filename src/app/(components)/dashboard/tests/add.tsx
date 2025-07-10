'use client'
import React, { useState } from 'react'

interface Question {
  question: string;
}

interface TestData {
  title: string;
  questions: Question[];
}

const Add = () => {
  const [testData, setTestData] = useState<TestData>({
    title: '',
    questions: []
  });
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentQuestion(prev => ({
      ...prev,
      question: e.target.value
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.question.trim()) {
      setTestData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
      
      // Reset current question
      setCurrentQuestion({
        question: ''
      });
      setMessage('Question added successfully!');
      
      // Clear success message after 2 seconds
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('Please enter a question');
    }
  };

  const removeQuestion = (index: number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    setMessage('Question removed successfully!');
    setTimeout(() => setMessage(''), 2000);
  };

  const submitTest = async () => {
    if (!testData.title.trim()) {
      setMessage('Please enter a test title');
      return;
    }
    
    if (testData.questions.length === 0) {
      setMessage('Please add at least one question');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Test created successfully!');
        // Reset form
        setTestData({
          title: '',
          questions: []
        });
        setCurrentQuestion({
          question: ''
        });
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('Failed to create test. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Create New Test Paper</h1>
        
        {/* Test Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Test Title</label>
          <input
            type="text"
            value={testData.title}
            onChange={handleTitleChange}
            placeholder="Enter test title"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>

        {/* Add Question Section */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Add Question</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">Question</label>
            <textarea
              value={currentQuestion.question}
              onChange={handleQuestionChange}
              placeholder="Enter your question here..."
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-vertical"
            />
          </div>

          <button
            onClick={addQuestion}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Add Question
          </button>
        </div>

        {/* Questions List */}
        {testData.questions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Questions ({testData.questions.length})
            </h2>
            <div className="space-y-4">
              {testData.questions.map((q, index) => (
                <div key={index} className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white text-lg">
                      Question {index + 1}
                    </h3>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 rounded transition-colors bg-red-900 hover:bg-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-gray-300 bg-gray-700 p-3 rounded border-l-4 border-blue-500">
                    {q.question}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={submitTest}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg transition-colors font-medium"
          >
            {isSubmitting ? 'Creating Test...' : 'Create Test'}
          </button>
          
          {message && (
            <div className={`p-3 rounded-lg max-w-md ${
              message.includes('Error') || message.includes('Failed') || message.includes('Please') 
                ? 'bg-red-900 text-red-300 border border-red-700' 
                : 'bg-green-900 text-green-300 border border-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Preview JSON */}
        {testData.questions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Preview (JSON Format)</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 border border-gray-700">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Add;
