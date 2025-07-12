import bcrypt from 'bcrypt';
import connection from "../../../../database/connection";
import model from "../../../../model/schemma";

// POST - Create new user (signup)
export async function POST(request) {
    try {
        await connection();
        
        const { username, email, password } = await request.json();
        
        // Validate required fields
        if (!username || !email || !password) {
            return Response.json(
                { success: false, error: "Username, email, and password are required" },
                { status: 400 }
            );
        }
        
        // Validate input formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { success: false, error: "Please provide a valid email address" },
                { status: 400 }
            );
        }
        
        if (password.length < 6) {
            return Response.json(
                { success: false, error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }
        
        // Check if user already exists
        const existingUser = await model.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        }).lean();
        
        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
            return Response.json(
                { success: false, error: `User with this ${field} already exists` },
                { status: 409 }
            );
        }
        
        // Hash the password before saving
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const userData = {
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        };
        
        const newUser = await model.create(userData);
        
        return Response.json(
            { 
                success: true,
                message: "User created successfully",
                data: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            },
            { status: 201 }
        );
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return Response.json(
                { success: false, error: `User with this ${field} already exists` },
                { status: 409 }
            );
        }
        
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Retrieve users (with optional filtering)
export async function GET(request) {
    try {
        await connection();
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Get users with pagination
        const users = await model
            .find(query)
            .select('-password') // Exclude password field
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();
        
        // Get total count for pagination
        const totalUsers = await model.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);
        
        return Response.json(
            {
                success: true,
                data: users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Get users error:', error);
        return Response.json(
            { success: false, error: "Failed to retrieve users" },
            { status: 500 }
        );
    }
}

// PATCH - Update user information
export async function PATCH(request) {
    try {
        await connection();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        
        if (!userId) {
            return Response.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }
        
        const updateData = await request.json();
        const { username, email, password, currentPassword } = updateData;
        
        // Find the user
        const user = await model.findById(userId);
        if (!user) {
            return Response.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }
        
        // Prepare update object
        const updates = {};
        
        // Update username if provided
        if (username) {
            if (username.trim().length < 3) {
                return Response.json(
                    { success: false, error: "Username must be at least 3 characters long" },
                    { status: 400 }
                );
            }
            
            // Check if username already exists (excluding current user)
            const existingUsername = await model.findOne({
                username: username.toLowerCase(),
                _id: { $ne: userId }
            }).lean();
            
            if (existingUsername) {
                return Response.json(
                    { success: false, error: "Username already exists" },
                    { status: 409 }
                );
            }
            
            updates.username = username.trim().toLowerCase();
        }
        
        // Update email if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return Response.json(
                    { success: false, error: "Please provide a valid email address" },
                    { status: 400 }
                );
            }
            
            // Check if email already exists (excluding current user)
            const existingEmail = await model.findOne({
                email: email.toLowerCase(),
                _id: { $ne: userId }
            }).lean();
            
            if (existingEmail) {
                return Response.json(
                    { success: false, error: "Email already exists" },
                    { status: 409 }
                );
            }
            
            updates.email = email.trim().toLowerCase();
        }
        
        // Update password if provided
        if (password) {
            if (!currentPassword) {
                return Response.json(
                    { success: false, error: "Current password is required to update password" },
                    { status: 400 }
                );
            }
            
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return Response.json(
                    { success: false, error: "Current password is incorrect" },
                    { status: 400 }
                );
            }
            
            if (password.length < 6) {
                return Response.json(
                    { success: false, error: "New password must be at least 6 characters long" },
                    { status: 400 }
                );
            }
            
            // Hash new password
            const saltRounds = 12;
            updates.password = await bcrypt.hash(password, saltRounds);
        }
        
        // Check if there are any updates
        if (Object.keys(updates).length === 0) {
            return Response.json(
                { success: false, error: "No valid fields to update" },
                { status: 400 }
            );
        }
        
        // Add updated timestamp
        updates.updatedAt = new Date();
        
        // Update user
        const updatedUser = await model.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        
        return Response.json(
            {
                success: true,
                message: "User updated successfully",
                data: updatedUser
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Update user error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return Response.json(
                { success: false, error: `User with this ${field} already exists` },
                { status: 409 }
            );
        }
        
        return Response.json(
            { success: false, error: "Failed to update user" },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(request) {
    try {
        await connection();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        
        if (!userId) {
            return Response.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }
        
        // Check if user exists
        const user = await model.findById(userId).lean();
        if (!user) {
            return Response.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }
        
        // Optional: Add authorization check here
        // For example, check if the requesting user has permission to delete this user
        
        // Delete the user
        await model.findByIdAndDelete(userId);
        
        return Response.json(
            {
                success: true,
                message: "User deleted successfully",
                data: {
                    deletedUserId: userId,
                    deletedUser: {
                        username: user.username,
                        email: user.email
                    }
                }
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Delete user error:', error);
        return Response.json(
            { success: false, error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
