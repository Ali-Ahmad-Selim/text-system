import { NextResponse } from 'next/server';
import Permit from '../../../model/permit.js';
import connection from "../../../database/connection";

// POST - Create a new permit
export async function POST(request) {
  try {
    await connection();
    
    const body = await request.json();
    const { Hazirlik, Ibtidai, Ihzari, Hafizlik } = body;
    
    // Create permit data with defaults if not provided
    const permitData = {
      Hazirlik: {
        permission: Hazirlik?.permission || 'denied'
      },
      Ibtidai: {
        permission: Ibtidai?.permission || 'denied'
      },
      Ihzari: {
        permission: Ihzari?.permission || 'denied'
      },
      Hafizlik: {
        permission: Hafizlik?.permission || 'denied'
      }
    };
    
    // Validate permission values
    const validPermissions = ['granted', 'denied'];
    const categories = ['Hazirlik', 'Ibtidai', 'Ihzari', 'Hafizlik'];
    
    for (const category of categories) {
      if (!validPermissions.includes(permitData[category].permission)) {
        return NextResponse.json(
          { success: false, error: `${category} permission must be either "granted" or "denied"` },
          { status: 400 }
        );
      }
    }
    
    // Create new permit
    const newPermit = new Permit(permitData);
    const savedPermit = await newPermit.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Permit created successfully',
        data: savedPermit
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST Error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create permit' },
      { status: 500 }
    );
  }
}

// PATCH - Update permit permissions
export async function PATCH(request) {
  try {
    await connection();
    
    const body = await request.json();
    const { permitId, category, permission, updateData } = body;
    
    // Validate required fields
    if (!permitId) {
      return NextResponse.json(
        { success: false, error: 'Permit ID is required' },
        { status: 400 }
      );
    }
    
    let updateObject = {};
    
    // Check if updating a specific category
    if (category && permission) {
      // Validate category
      const validCategories = ['Hazirlik', 'Ibtidai', 'Ihzari', 'Hafizlik'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category. Must be one of: Hazirlik, Ibtidai, Ihzari, Hafizlik' },
          { status: 400 }
        );
      }
      
      // Validate permission value
      if (!['granted', 'denied'].includes(permission)) {
        return NextResponse.json(
          { success: false, error: 'Permission must be either "granted" or "denied"' },
          { status: 400 }
        );
      }
      
      updateObject[`${category}.permission`] = permission;
    }
    // Check if updating multiple categories at once
    else if (updateData) {
      const validCategories = ['Hazirlik', 'Ibtidai', 'Ihzari', 'Hafizlik'];
      const validPermissions = ['granted', 'denied'];
      
      for (const [cat, data] of Object.entries(updateData)) {
        if (!validCategories.includes(cat)) {
          return NextResponse.json(
            { success: false, error: `Invalid category: ${cat}` },
            { status: 400 }
          );
        }
        
        if (data.permission && !validPermissions.includes(data.permission)) {
          return NextResponse.json(
            { success: false, error: `Invalid permission for ${cat}: ${data.permission}` },
            { status: 400 }
          );
        }
        
        if (data.permission) {
          updateObject[`${cat}.permission`] = data.permission;
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Either category and permission, or updateData is required' },
        { status: 400 }
      );
    }
    
    // Update the permit
    const updatedPermit = await Permit.findByIdAndUpdate(
      permitId,
      updateObject,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedPermit) {
      return NextResponse.json(
        { success: false, error: 'Permit not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Permission updated successfully',
        data: updatedPermit
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('PATCH Error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid permit ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update permission' },
      { status: 500 }
    );
  }
}

// Your existing GET function - no changes needed
export async function GET(request) {
  try {
    await connection();
    
    const { searchParams } = new URL(request.url);
    const permitId = searchParams.get('id');
    
    if (permitId) {
      const permit = await Permit.findById(permitId);
      if (!permit) {
        return NextResponse.json(
          { success: false, error: 'Permit not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: permit });
    } else {
      const permits = await Permit.find({});
      return NextResponse.json({ success: true, data: permits });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve permits' },
      { status: 500 }
    );
  }
}

