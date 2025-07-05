import {connection} from "../../../../database/connection"
import model from "../../../../model/schemma"

connection()

export async function POST(request) {
    try {
        const { username, email, password } = await request.json()
        
        if (!username || !email || !password) {
            return Response.json(
                { error: "Username, email, and password are required" },
                { status: 400 }
            )
        }
        
        const existingUser = await model.findOne({ 
            $or: [{ email }, { username }] 
        })
        
        if (existingUser) {
            return Response.json(
                { error: "User already exists" },
                { status: 409 }
            )
        }
        
        const newUser = new model({
            username,
            email,
            password
        })
        
        await newUser.save()
        
        return Response.json(
            { 
                message: "User created successfully",
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            },
            { status: 201 }
        )
        
    } catch (error) {
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
