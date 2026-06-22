import { Router } from 'express'
import { getProfiles, createProfile, updateProfile } from '../controllers/profile.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

// All profile routes require authentication
router.use(requireAuth)

router.get('/', getProfiles)
router.post('/', createProfile)
router.patch('/:id', updateProfile)

export default router
