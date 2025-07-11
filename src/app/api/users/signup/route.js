import bcrypt from 'bcrypt';
import connection from "../../../../database/connection";
import model from "../../../../model/schemma";

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
