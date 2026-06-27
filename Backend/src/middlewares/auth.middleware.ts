import { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase'

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  }
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' })
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    // MOCK AUTHENTICATION for testing
    // Will be replaced with Supabase later
    if (token === 'mock-token') {
      req.user = {
        uid: 'mock-user-id-123',
        email: 'test@example.com',
        role: 'user',
      }
      return next()
    }

    const decodedToken = await auth.verifyIdToken(token)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role, // Custom claims if set
    }
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' })
  }
}

// Optional Auth (populates user if token exists, but doesn't block if missing)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1]
    try {
      const decodedToken = await auth.verifyIdToken(token)
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
      }
    } catch (error) {
      // Ignore error for optional auth
    }
  }
  next()
}
