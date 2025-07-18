'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Test from './Test'

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

const page = () => {
  const searchParams = useSearchParams();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [studentData, setStudentData] = useState({
    name: '',
    group: '',
    studentId: ''
  });

  useEffect(() => {
    // Get student data from URL parameters
    const name = searchParams.get('name') || '';
    const group = searchParams.get('group') || '';
    const studentId = searchParams.get('studentId') || '';

    setStudentData({ name, group, studentId });

    const fetchPapers = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const user = localStorage.getItem("user") || "";
        setUserName(user);
        
        if (!user) {
          setError("No user found in localStorage");
          setLoading(false);
          return;
        }

        // Fetch papers from API
        const response = await fetch('/api/papers');
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to fetch papers');
          setLoading(false);
          return;
        }

        // Filter papers that start with the user name
        const filteredPapers = data.data.filter((paper: Paper) => 
          paper.title.toLowerCase().startsWith(user.toLowerCase())
        );

        setPapers(filteredPapers);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching papers:', err);
        setError('Failed to fetch papers');
        setLoading(false);
      }
    };

    fetchPapers();
  }, [searchParams]);

  const handlePaperClick = (paper: Paper) => {
    setSelectedPaper(paper);
  };

  const handleBackToPapers = () => {
    setSelectedPaper(null);
  };

  // If a paper is selected, show the Test component with all student data and test info
  if (selectedPaper) {
    return (
      <Test 
        paper={selectedPaper} 
        onBack={handleBackToPapers}
        studentData={studentData}
        testTitle={selectedPaper.title}
        userName={userName}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 text-center">
              Papers for {studentData.name || userName || 'Loading...'}
            </h1>
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-600 hover:bg-blue-500 transition ease-in-out duration-150 cursor-not-allowed">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading papers...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 text-center">
              Papers
            </h1>
            <div className="p-3 sm:p-4 rounded-lg border bg-red-900 text-red-200 border-red-600 text-center">
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg font-medium">
                  Error: {error}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">
            Papers for {studentData.name || userName}
          </h1>
          
          {/* Display student info if available from URL */}
          {studentData.name && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Student Information:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm sm:text-base">
                <p className="text-gray-300">
                  <span className="font-medium">Name:</span> {studentData.name}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Group:</span> {studentData.group}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Student ID:</span> {studentData.studentId}
                </p>
              </div>
            </div>
          )}
          
          {papers.length === 0 ? (
            <div className="p-3 sm:p-4 rounded-lg border bg-yellow-900 text-yellow-200 border-yellow-600 text-center">
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg font-medium">
                  No papers found for user "{studentData.name || userName}"
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {papers.map((paper) => (
                <div 
                  key={paper._id} 
                  onClick={() => handlePaperClick(paper)}
                  className="bg-gray-700 border border-gray-600 rounded-lg p-4 sm:p-6 shadow-lg cursor-pointer hover:bg-gray-600 hover:border-gray-500 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                      {paper.title}
                    </h2>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200 border border-blue-600">
                      {paper.questions.length} Questions
                    </span>
                    
                    {paper.createdAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(paper.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Click to view test
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
