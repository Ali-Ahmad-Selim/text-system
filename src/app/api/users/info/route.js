
import { verifyToken } from '../../../../helpers/token'

export async function GET(request) {
    const authResult = verifyToken(request)
    
    if (authResult.error) {
        return Response.json(
            { error: authResult.error },
            { status: authResult.status }
        )
    }
    
    // User is authenticated, proceed with the request
    const user = authResult.user
    
    return Response.json(
        { 
            message: "Access granted to protected route",
            user: user
        },
        { status: 200 }
    )
}
