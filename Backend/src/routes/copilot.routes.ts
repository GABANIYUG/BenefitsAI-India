import { Router } from 'express'
import { handleChat } from '../controllers/copilot.controller'
import { optionalAuth } from '../middlewares/auth.middleware'

const router = Router()

// Optional auth so users can chat anonymously, but profile context requires auth
router.post('/chat', optionalAuth, handleChat)

export default router
