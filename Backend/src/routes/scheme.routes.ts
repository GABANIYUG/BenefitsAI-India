import { Router } from 'express'
import { getSchemes, getSchemeById, getEligibleSchemes } from '../controllers/scheme.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

// Public routes
router.get('/', getSchemes)
router.get('/:id', getSchemeById)

// Protected routes
router.get('/match/eligible', requireAuth, getEligibleSchemes)

export default router
