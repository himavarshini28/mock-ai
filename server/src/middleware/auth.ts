import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
      return
    }

    req.userId = decoded.userId
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}

export default auth