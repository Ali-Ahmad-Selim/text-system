import { NextResponse } from 'next/server';
import Test from '../../../model/test';
import { connection } from "../../../database/connection";

// GET - Fetch all papers
export async function GET(request) {
  try {
    // Connect to database
    await connection();
    
    // Fetch all tests from database
    const tests = await Test.find({}).sort({ createdAt: -1 }); // Sort by newest first
    
    return NextResponse.json(
      { 
        message: 'Tests fetched successfully',
        tests: tests,
        count: tests.length
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

// POST - Create new paper
export async function POST(request) {
  try {
    // Connect to database
    await connection();
    
    // Get data from request body
    const { title, questions } = await request.json();
    
    // Validate required fields
    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Title and questions array are required' },
        { status: 400 }
      );
    }
    
    // Validate each question has 4 answers
    for (let i = 0; i < questions.length; i++) {
      const { question, answers } = questions[i];
      
      if (!question || !answers || !Array.isArray(answers) || answers.length !== 4) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have exactly 4 answers` },
          { status: 400 }
        );
      }
    }
    
    // Create new test
    const newTest = new Test({
      title,
      questions
    });
    
    // Save to database
    const savedTest = await newTest.save();
    
    return NextResponse.json(
      { 
        message: 'Test created successfully',
        test: savedTest 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

// PATCH - Add or delete individual questions
export async function PATCH(request) {
  try {
    // Connect to database
    await connection();
    
    // Get the URL and extract the ID from query parameters
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');
    const action = searchParams.get('action'); // 'add' or 'delete'
    
    // Validate required parameters
    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }
    
    if (!action || !['add', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "add" or "delete"' },
        { status: 400 }
      );
    }
    
    // Find the test
    const test = await Test.findById(testId);
    
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    if (action === 'add') {
      // Add new question
      const { question, answers } = await request.json();
      
      // Validate new question
      if (!question || !answers || !Array.isArray(answers) || answers.length !== 4) {
        return NextResponse.json(
          { error: 'Question must have exactly 4 answers' },
          { status: 400 }
        );
      }
      
      // Add question to the test
      test.questions.push({ question, answers });
      
      // Save updated test
      const updatedTest = await test.save();
      
      return NextResponse.json(
        { 
          message: 'Question added successfully',
          test: updatedTest,
          addedQuestion: { question, answers }
        },
        { status: 200 }
      );
      
    } else if (action === 'delete') {
      // Delete question by index
      const questionIndex = searchParams.get('questionIndex');
      
      if (questionIndex === null || isNaN(parseInt(questionIndex))) {
        return NextResponse.json(
          { error: 'Valid question index is required for deletion' },
          { status: 400 }
        );
      }
      
      const index = parseInt(questionIndex);
      
      if (index < 0 || index >= test.questions.length) {
        return NextResponse.json(
          { error: 'Question index out of range' },
          { status: 400 }
        );
      }
      
      // Check if test has at least 2 questions (to prevent deleting all questions)
      if (test.questions.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last question. Test must have at least one question.' },
          { status: 400 }
        );
      }
      
      // Store deleted question for response
      const deletedQuestion = test.questions[index];
      
      // Remove question from array
      test.questions.splice(index, 1);
      
      // Save updated test
      const updatedTest = await test.save();
      
      return NextResponse.json(
        { 
          message: 'Question deleted successfully',
          test: updatedTest,
          deletedQuestion: deletedQuestion
        },
        { status: 200 }
      );
    }
    
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a paper
export async function DELETE(request) {
  try {
    // Connect to database
    await connection();
    
    // Get the URL and extract the ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }
    
    // Find and delete the test
    const deletedTest = await Test.findByIdAndDelete(id);
    
    if (!deletedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Test deleted successfully',
        deletedTest: deletedTest
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}
