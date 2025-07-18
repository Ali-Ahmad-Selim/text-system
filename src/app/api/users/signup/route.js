import bcrypt from 'bcrypt';
import connection from "../../../../database/connection";
import model from "../../../../model/schemma";

// POST - Create new user (signup)
export async function POST(request) {
    try {
        await connection();
        
        const { username, email, password, role } = await request.json();
        
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
        
        // Check if user already exists (only check email)
        const existingUser = await model.findOne({
            email: email.toLowerCase()
        }).lean();
        
        if (existingUser) {
            return Response.json(
                { success: false, error: "User with this email already exists" },
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
            password: hashedPassword,
            role: 'user' // Default role is 'user'
        };
        
        // Set role to admin if provided and it's admin, otherwise keep default 'user'
        if (role && role.toLowerCase() === 'admin') {
            userData.role = 'admin';
        }
        
        const newUser = await model.create(userData);
        
        return Response.json(
            { 
                success: true,
                message: "User created successfully",
                data: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            },
            { status: 201 }
        );
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle duplicate key error (only for email now)
        if (error.code === 11000) {
            return Response.json(
                { success: false, error: "User with this email already exists" },
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
