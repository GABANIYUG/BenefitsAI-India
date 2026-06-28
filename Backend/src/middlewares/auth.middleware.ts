import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
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
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('Supabase token verification error:', error)
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' })
    }

    req.user = {
      uid: user.id,
      email: user.email,
    }
    next()
  } catch (error) {
    console.error('Unexpected token verification error:', error)
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
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) {
        req.user = {
          uid: user.id,
          email: user.email,
        }
      }
    } catch (error) {
      // Ignore error for optional auth
    }
  }
  next()
}
