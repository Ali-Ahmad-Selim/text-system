import { NextResponse } from 'next/server';
import Student from '../../../model/student.js';
import connection from "../../../database/connection";

// GET - Retrieve all students or a specific student by ID
export async function GET(request) {
  try {
    await connection();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (studentId) {
      const student = await Student.findOne({ studentId }).lean();
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: student });
    }
    
    const students = await Student.find({}).lean();
    return NextResponse.json({ success: true, data: students });
    
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create a new student
export async function POST(request) {
  try {
    await connection();
    
    const body = await request.json();
    const { studentId, name, group } = body;
    
    // Validate required fields
    if (!studentId || !name || !group) {
      return NextResponse.json(
        { success: false, error: 'studentId, name, and group are required' },
        { status: 400 }
      );
    }
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId }).lean();
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student already exists' },
        { status: 409 }
      );
    }
    
    // Create new student
    const studentData = {
      studentId: studentId.trim(),
      name: name.trim(),
      group: group.trim(),
      history: []
    };
    
    const newStudent = await Student.create(studentData);
    
    return NextResponse.json(
      { success: true, data: newStudent },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST Error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing student or add test result
export async function PATCH(request) {
  try {
    await connection();

    const body = await request.json();
    const { studentId, name, group, paperTitle, marks, totalMarks } = body;

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'studentId is required'
      });
    }

    const updateOps = {};

    if (name) updateOps.name = name.trim();
    if (group) updateOps.group = group.trim();

    // If test result is provided
    const pushOps = {};
    if (paperTitle && marks !== undefined && totalMarks !== undefined) {
      if (
        typeof marks !== 'number' || typeof totalMarks !== 'number' ||
        marks < 0 || totalMarks < 0 || marks > totalMarks
      ) {
        return NextResponse.json({
          success: false,
          error: 'Invalid marks or totalMarks'
        });
      }

      const historyEntry = {
        date: new Date().toISOString(),
        paperTitle: paperTitle.trim(),
        marks,
        totalMarks
      };

      pushOps.history = historyEntry;
    }

    // Combine update and push operators
    const updateQuery = {
      ...(Object.keys(updateOps).length > 0 && { $set: updateOps }),
      ...(Object.keys(pushOps).length > 0 && { $push: pushOps })
    };

    if (Object.keys(updateQuery).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { studentId },
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      });
    }

    return NextResponse.json({ success: true, data: updatedStudent });

  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update student',
      details: error.message
    });
  }
}



// DELETE - Delete a student
export async function DELETE(request) {
  try {
    await connection();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId is required' },
        { status: 400 }
      );
    }
    
    const deletedStudent = await Student.findOneAndDelete({ studentId });
    
    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      data: deletedStudent
    });
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
