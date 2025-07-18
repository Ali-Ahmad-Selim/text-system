'use client'
import React, { useState } from 'react'

interface Question {
  question: string;
}

interface Paper {
  _id: string;
  title: string;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

interface StudentData {
  name: string;
  group: string;
  studentId: string;
}

interface TestProps {
  paper: Paper;
  onBack: () => void;
  studentData: StudentData;
  testTitle: string;
  userName: string;
}

const Test: React.FC<TestProps> = ({ 
  paper, 
  onBack, 
  studentData, 
  testTitle, 
  userName 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(paper.questions.length).fill(''));
  const [showResults, setShowResults] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [marks, setMarks] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < paper.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = () => {
    setShowMarksModal(true);
  };

  const handleMarksSubmit = async () => {
    if (!marks.trim() || !totalMarks.trim()) {
      setSubmitError('Please enter both marks and total marks');
      return;
    }

    const marksNumber = parseFloat(marks);
    const totalMarksNumber = parseFloat(totalMarks);
    
    if (isNaN(marksNumber) || marksNumber < 0) {
      setSubmitError('Please enter a valid positive number for marks');
      return;
    }

    if (isNaN(totalMarksNumber) || totalMarksNumber < 0) {
      setSubmitError('Please enter a valid positive number for total marks');
      return;
    }

    if (marksNumber > totalMarksNumber) {
      setSubmitError('Marks cannot be greater than total marks');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get student studentId from studentData or localStorage as fallback
      const studentId = studentData.studentId || localStorage.getItem("student");
      
      if (!studentId) {
        setSubmitError('No student ID found');
        setIsSubmitting(false);
        return;
      }

      // First, get the current student data using studentId
      const studentResponse = await fetch(`/api/students?studentId=${studentId}`);
      const studentDataResponse = await studentResponse.json();

      if (!studentDataResponse.success) {
        setSubmitError('Failed to fetch student data');
        setIsSubmitting(false);
        return;
      }

      const currentStudent = studentDataResponse.data;

      // Prepare the new history entry
      const historyEntry = {
        date: new Date().toISOString(),
        paperTitle: testTitle,
        marks: marksNumber,
        totalMarks: totalMarksNumber,
        totalQuestions: paper.questions.length,
        answeredQuestions: answers.filter(answer => answer.trim() !== '').length
      };

      // Update student history using PATCH request with studentId
      const updateResponse = await fetch('/api/students', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  studentId: studentId,
  paperTitle: testTitle,
  marks: marksNumber,
  totalMarks: totalMarksNumber
}),

      });

      const updateData = await updateResponse.json();

      if (!updateData.success) {
        setSubmitError(updateData.error || 'Failed to update student history');
        setIsSubmitting(false);
        return;
      }

      // Success - close modal and show results
      setShowMarksModal(false);
      setShowResults(true);
      setIsSubmitting(false);

    } catch (error) {
      console.error('Error submitting test:', error);
      setSubmitError('Network error occurred');
      setIsSubmitting(false);
    }
  };


  const answeredQuestions = answers.filter(answer => answer.trim() !== '').length;
  const progress = ((currentQuestionIndex + 1) / paper.questions.length) * 100;

  // Marks Modal
  if (showMarksModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            Submit Test Results
          </h2>
          
          {/* Read-only Student Information */}
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Student ID:
              </label>
              <input
                type="text"
                value={studentData.studentId}
                readOnly
                className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Student Name:
              </label>
              <input
                type="text"
                value={studentData.name}
                readOnly
                className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Paper Title:
              </label>
              <input
                type="text"
                value={testTitle}
                readOnly
                className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Editable Marks Fields */}
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Marks Obtained: <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="Enter marks obtained (e.g., 85)"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Marks: <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="Enter total marks (e.g., 100)"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300">
              <span className="font-medium">Questions Answered:</span> {answeredQuestions} / {paper.questions.length}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Test Date:</span> {new Date().toLocaleDateString()}
            </p>
          </div>

          {submitError && (
            <div className="mb-4 p-3 rounded-lg border bg-red-900 text-red-200 border-red-600">
              <p className="text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowMarksModal(false);
                setMarks('');
                setTotalMarks('');
                setSubmitError('');
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleMarksSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                Test Completed Successfully!
              </h1>
              <h2 className="text-lg sm:text-xl text-gray-300 mb-4">
                {testTitle}
              </h2>
              
              <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-6">
                <p className="text-green-200 text-lg font-medium">
                  {studentData.name} scored {marks} out of {totalMarks} marks
                </p>
                <p className="text-green-200 text-sm mt-2">
                  Questions Answered: {answeredQuestions} / {paper.questions.length} | Submitted on: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {paper.questions.map((question, index) => (
                <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">
                    Question {index + 1}: {question.question}
                  </h3>
                  <div className="bg-gray-800 border border-gray-600 rounded p-3">
                    <p className="text-gray-300">
                      <span className="font-medium text-blue-400">Your Answer:</span>{' '}
                      {answers[index] || <span className="text-red-400 italic">Not answered</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Papers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        {/* Student Info Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-gray-300">
              <span className="font-medium text-white">Student:</span> {studentData.name}
            </div>
            <div className="text-gray-300">
                         <span className="font-medium text-white">Group:</span> {studentData.group}
            </div>
            <div className="text-gray-300">
              <span className="font-medium text-white">ID:</span> {studentData.studentId}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center flex-1 mx-4">
              {testTitle}
            </h1>
            
            <div className="text-sm text-gray-400">
              {currentQuestionIndex + 1} / {paper.questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                Question {currentQuestionIndex + 1}
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                {paper.questions[currentQuestionIndex].question}
              </p>
            </div>
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Answer:
            </label>
            <textarea
              value={answers[currentQuestionIndex]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {currentQuestionIndex === paper.questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Question Overview */}
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Question Overview</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {paper.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[index].trim() !== ''
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Answered: <span className="text-green-400 font-medium">{answeredQuestions}</span> | 
              Remaining: <span className="text-yellow-400 font-medium">{paper.questions.length - answeredQuestions}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;

