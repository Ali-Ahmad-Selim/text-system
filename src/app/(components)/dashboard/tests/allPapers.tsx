"use client";
import React, { useState, useEffect } from "react";

interface Question {
  question: string;
  answers: string[];
}

interface Test {
  _id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

const AllPapers = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Add question states
  const [addingQuestionTo, setAddingQuestionTo] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    answers: ["", "", "", ""],
  });

  // Fetch all tests
  const fetchTests = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/papers");
      const result = await response.json();

      if (response.ok) {
        setTests(result.tests);
        if (result.tests.length === 0) {
          setMessage("No tests found");
        }
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to fetch tests");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle test expansion
  const toggleTestExpansion = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  // Delete entire test
  const deleteTest = async (testId: string, testTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${testTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(testId);
    setMessage("");

    try {
      const response = await fetch(
        `  /api/papers?id=${testId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage(`Test "${testTitle}" deleted successfully!`);
        setTests((prevTests) =>
          prevTests.filter((test) => test._id !== testId)
        );
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to delete test");
      console.error("Error:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Delete individual question
  const deleteQuestion = async (testId: string, questionIndex: number) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `  /api/papers?id=${testId}&action=delete&questionIndex=${questionIndex}`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Question deleted successfully!");
        // Update the test in state
        setTests((prevTests) =>
          prevTests.map((test) => (test._id === testId ? result.test : test))
        );
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to delete question");
      console.error("Error:", error);
    }
  };

  // Handle new question input
  const handleNewQuestionChange = (
    field: string,
    value: string,
    index?: number
  ) => {
    if (field === "question") {
      setNewQuestion((prev) => ({ ...prev, question: value }));
    } else if (field === "answer" && index !== undefined) {
      setNewQuestion((prev) => ({
        ...prev,
        answers: prev.answers.map((answer, i) =>
          i === index ? value : answer
        ),
      }));
    }
  };

  // Add new question
  const addQuestion = async (testId: string) => {
    if (
      !newQuestion.question.trim() ||
      !newQuestion.answers.every((answer) => answer.trim())
    ) {
      setMessage("Please fill in the question and all 4 answers");
      return;
    }

    try {
      const response = await fetch(
        `  /api/papers?id=${testId}&action=add`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newQuestion),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Question added successfully!");
        // Update the test in state
        setTests((prevTests) =>
          prevTests.map((test) => (test._id === testId ? result.test : test))
        );
        // Reset form
        setNewQuestion({ question: "", answers: ["", "", "", ""] });
        setAddingQuestionTo(null);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to add question");
      console.error("Error:", error);
    }
  };

  // Load tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">All Test Papers</h1>
        <button
          onClick={fetchTests}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-900 text-red-300 border border-red-700"
              : message.includes("successfully")
              ? "bg-green-900 text-green-300 border border-green-700"
              : "bg-yellow-900 text-yellow-300 border border-yellow-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading tests...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No tests found</div>
          <p className="text-gray-500 mt-2">Create some tests first</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test._id}
              className="bg-gray-800 border border-gray-700 rounded-lg"
            >
              {/* Test Header */}
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => toggleTestExpansion(test._id)}
                    className="mr-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        expandedTests.has(test._id) ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">
                      {test.title}
                    </h2>
                    <div className="text-gray-400 text-sm">
                      <span className="mr-4">
                        Questions: {test.questions.length}
                      </span>
                      <span>
                        Created: {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setAddingQuestionTo(
                        addingQuestionTo === test._id ? null : test._id
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => deleteTest(test._id, test.title)}
                    disabled={isDeleting === test._id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    {isDeleting === test._id ? "Deleting..." : "Delete Test"}
                  </button>
                </div>
              </div>

              {/* Add Question Form */}
              {addingQuestionTo === test._id && (
                <div className="px-4 pb-4 border-t border-gray-700">
                  <div className="bg-gray-700 p-4 rounded-lg mt-4">
                    <h3 className="text-white font-medium mb-3">
                      Add New Question
                    </h3>

                    <div className="mb-3">
                      <input
                        type="text"
                        value={newQuestion.question}
                        onChange={(e) =>
                          handleNewQuestionChange("question", e.target.value)
                        }
                        placeholder="Enter question"
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {newQuestion.answers.map((answer, index) => (
                        <input
                          key={index}
                          type="text"
                          value={answer}
                          onChange={(e) =>
                            handleNewQuestionChange(
                              "answer",
                              e.target.value,
                              index
                            )
                          }
                          placeholder={`Answer ${index + 1}`}
                          className="p-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
                        />
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => addQuestion(test._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => {
                          setAddingQuestionTo(null);
                          setNewQuestion({
                            question: "",
                            answers: ["", "", "", ""],
                          });
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              {expandedTests.has(test._id) && (
                <div className="px-4 pb-4 border-t border-gray-700">
                  <div className="mt-4 space-y-3">
                    {test.questions.map((question, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white">
                            Q{index + 1}: {question.question}
                          </h3>
                          <button
                            onClick={() => deleteQuestion(test._id, index)}
                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                          {question.answers.map((answer, ansIndex) => (
                            <div
                              key={ansIndex}
                              className="bg-gray-600 p-2 rounded"
                            >
                              {String.fromCharCode(65 + ansIndex)}) {answer}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {tests.length > 0 && (
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Total Tests: {tests.length}</span>
            <span>
              Total Questions:{" "}
              {tests.reduce((sum, test) => sum + test.questions.length, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPapers;
