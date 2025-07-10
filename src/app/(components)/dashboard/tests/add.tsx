'use client'
import React, { useState } from 'react'

interface Answer {
  text: string;
}

interface Question {
  question: string;
  answers: string[];
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
    question: '',
    answers: ['', '', '', '']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentQuestion(prev => ({
      ...prev,
      question: e.target.value
    }));
  };

  const handleAnswerChange = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => i === index ? value : answer)
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.question.trim() && currentQuestion.answers.every(answer => answer.trim())) {
      setTestData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
      
      // Reset current question
      setCurrentQuestion({
        question: '',
        answers: ['', '', '', '']
      });
    } else {
      setMessage('Please fill in the question and all 4 answers');
    }
  };

  const removeQuestion = (index: number) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
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
            <input
              type="text"
              value={currentQuestion.question}
              onChange={handleQuestionChange}
              placeholder="Enter your question"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {currentQuestion.answers.map((answer, index) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-2 text-gray-300">Answer {index + 1}</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Enter answer ${index + 1}`}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Question
          </button>
        </div>

        {/* Questions List */}
        {testData.questions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Questions ({testData.questions.length})</h2>
            <div className="space-y-4">
              {testData.questions.map((q, index) => (
                <div key={index} className="bg-gray-800 p-4 border border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">Q{index + 1}: {q.question}</h3>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    {q.answers.map((answer, ansIndex) => (
                      <div key={ansIndex}>
                        {String.fromCharCode(65 + ansIndex)}) {answer}
                      </div>
                    ))}
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
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating Test...' : 'Create Test'}
          </button>
          
          {message && (
            <div className={`p-3 rounded-lg ${message.includes('Error') || message.includes('Failed') || message.includes('Please') 
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
