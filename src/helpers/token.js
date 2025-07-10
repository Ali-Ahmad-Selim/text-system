import jwt from 'jsonwebtoken'

export function verifyToken(request) {
    try {
        const authHeader = request.headers.get('authorization')
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'No token provided', status: 401 }
        }
        
        const token = authHeader.substring(7) // Remove 'Bearer ' prefix
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        return { user: decoded }
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { error: 'Token expired', status: 401 }
        } else if (error.name === 'JsonWebTokenError') {
            return { error: 'Invalid token', status: 401 }
        } else {
            return { error: 'Token verification failed', status: 401 }
        }
    }
}
