import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from "../../../../database/connection";
import model from "../../../../model/schemma";

export async function POST(request) {
    try {
        await connection();
        
        const { email, password } = await request.json();
        
        // Validate required fields
        if (!email || !password) {
            return Response.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            );
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { success: false, error: "Please provide a valid email address" },
                { status: 400 }
            );
        }
        
        // Find user by email (case-insensitive)
        const user = await model.findOne({ 
            email: email.toLowerCase().trim() 
        }).lean();
        
        if (!user) {
            return Response.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return Response.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }
        
        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET environment variable is not defined');
            return Response.json(
                { success: false, error: "Server configuration error" },
                { status: 500 }
            );
        }
        
        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role || 'user', // Default role if not specified
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        return Response.json(
            { 
                success: true,
                message: "Login successful",
                data: {
                    token: token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role || 'user'
                    }
                }
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle JWT errors specifically
        if (error.name === 'JsonWebTokenError') {
            return Response.json(
                { success: false, error: "Token generation failed" },
                { status: 500 }
            );
        }
        
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
