import { NextResponse } from 'next/server';
import Student from '../../../model/student.js';
import mongoose from 'mongoose';

// Connect to MongoDB (you might want to move this to a separate utility file)
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// GET - Retrieve all students or a specific student by ID
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (studentId) {
      // Get specific student
      const student = await Student.findOne({ studentId });
      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(student);
    } else {
      // Get all students
      const students = await Student.find({});
      return NextResponse.json(students);
    }
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create a new student
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId, name, rollNumber, history = [] } = body;
    
    // Validate required fields
    if (!studentId || !name || !rollNumber) {
      return NextResponse.json(
        { error: 'studentId, name, and rollNumber are required' },
        { status: 400 }
      );
    }
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 409 }
      );
    }
    
    // Create new student
    const newStudent = new Student({
      studentId,
      name,
      rollNumber,
      history
    });
    
    const savedStudent = await newStudent.save();
    return NextResponse.json(savedStudent, { status: 201 });
    
  } catch (error) {
    console.error('POST Error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Student ID must be unique' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing student
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId, name, rollNumber, history } = body;
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required for update' },
        { status: 400 }
      );
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (history !== undefined) updateData.history = history;
    
    // Find and update student
    const updatedStudent = await Student.findOneAndUpdate(
      { studentId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedStudent);
    
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a student
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required for deletion' },
        { status: 400 }
      );
    }
    
    const deletedStudent = await Student.findOneAndDelete({ studentId });
    
    if (!deletedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Student deleted successfully', student: deletedStudent }
    );
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
