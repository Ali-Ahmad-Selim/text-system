import { NextResponse } from 'next/server';
import Test from '../../../model/test';
import mongoose from 'mongoose';


// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// GET - Fetch all tests
export async function GET() {
  try {
    await connectDB();
    const tests = await Test.find({});
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

// POST - Create a new test
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { error: 'Title and questions array are required' },
        { status: 400 }
      );
    }

    // Validate questions format (only question text needed now)
    for (let i = 0; i < body.questions.length; i++) {
      const question = body.questions[i];
      if (!question.question || typeof question.question !== 'string') {
        return NextResponse.json(
          { error: `Question ${i + 1} must have a question text` },
          { status: 400 }
        );
      }
    }

    // Create new test with simplified structure
    const newTest = new Test({
      title: body.title,
      questions: body.questions.map(q => ({
        question: q.question
      }))
    });

    const savedTest = await newTest.save();
    return NextResponse.json(savedTest, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing test
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json(
        { error: 'Test ID is required for update' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { error: 'Title and questions array are required' },
        { status: 400 }
      );
    }

    // Validate questions format
    for (let i = 0; i < body.questions.length; i++) {
      const question = body.questions[i];
      if (!question.question || typeof question.question !== 'string') {
        return NextResponse.json(
          { error: `Question ${i + 1} must have a question text` },
          { status: 400 }
        );
      }
    }

    const updatedTest = await Test.findByIdAndUpdate(
      body._id,
      {
        title: body.title,
        questions: body.questions.map(q => ({
          question: q.question
        }))
      },
      { new: true }
    );

    if (!updatedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a test
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const deletedTest = await Test.findByIdAndDelete(testId);

    if (!deletedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}
