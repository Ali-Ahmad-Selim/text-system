import { NextResponse } from 'next/server';
import Test from '../../../model/test';
import connection from "../../../database/connection";

// GET - Fetch all tests
export async function GET() {
  try {
    await connection();
    
    const tests = await Test.find({}).lean();
    return NextResponse.json({ success: true, data: tests });
    
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

// POST - Create a new test
export async function POST(request) {
  try {
    await connection();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { success: false, error: 'Title and questions array are required' },
        { status: 400 }
      );
    }

    // Validate questions format
    for (let i = 0; i < body.questions.length; i++) {
      const question = body.questions[i];
      if (!question.question || typeof question.question !== 'string') {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} must have a question text` },
          { status: 400 }
        );
      }
    }

    // Create new test with simplified structure
    const testData = {
      title: body.title.trim(),
      questions: body.questions.map(q => ({
        question: q.question.trim()
      }))
    };

    const newTest = await Test.create(testData);
    
    return NextResponse.json(
      { success: true, data: newTest },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing test
export async function PUT(request) {
  try {
    await connection();
    
    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json(
        { success: false, error: 'Test ID is required for update' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { success: false, error: 'Title and questions array are required' },
        { status: 400 }
      );
    }

    // Validate questions format
    for (let i = 0; i < body.questions.length; i++) {
      const question = body.questions[i];
      if (!question.question || typeof question.question !== 'string') {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} must have a question text` },
          { status: 400 }
        );
      }
    }

    const updateData = {
      title: body.title.trim(),
      questions: body.questions.map(q => ({
        question: q.question.trim()
      }))
    };

    const updatedTest = await Test.findByIdAndUpdate(
      body._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTest) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedTest });
    
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a test
export async function DELETE(request) {
  try {
    await connection();
    
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');

    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const deletedTest = await Test.findByIdAndDelete(testId);

    if (!deletedTest) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully',
      data: deletedTest
    });
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}
