import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {connection} from "../../../../database/connection"
import model from "../../../../model/schemma"

connection()

export async function POST(request) {
    try {
        const { email, password } = await request.json()
        
        if (!email || !password) {
            return Response.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }
        
        const user = await model.findOne({ email })
        
        if (!user) {
            return Response.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password)
        
        if (!isPasswordValid) {
            return Response.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }
        
        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        )
        
        return Response.json(
            { 
                message: "Login successful",
                token: token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            },
            { status: 200 }
        )
        
    } catch (error) {
        console.error('Signin error:', error)
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
