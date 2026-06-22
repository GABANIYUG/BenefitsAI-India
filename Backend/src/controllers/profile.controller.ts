import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { z } from 'zod'

const profileSchema = z.object({
  relation: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  income: z.number().nonnegative().optional(),
  casteCategory: z.string().optional(),
  occupation: z.string().optional(),
  isStudent: z.boolean().optional(),
  isFarmer: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
  maritalStatus: z.string().optional(),
})

export const getProfiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

    const profiles = await prisma.profile.findMany({
      where: { userId }
    })
    
    res.status(200).json({ success: true, data: profiles })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const createProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

    const validatedData = profileSchema.parse(req.body)

    // Ensure User exists in DB, or create them via a sync if this is the first login
    await prisma.user.upsert({
      where: { id: userId },
      update: { email: req.user.email },
      create: { id: userId, email: req.user.email }
    })

    const newProfile = await prisma.profile.create({
      data: {
        ...validatedData,
        userId
      }
    })

    res.status(201).json({ success: true, data: newProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors })
    }
    console.error('Error creating profile:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

    // Ensure they own the profile
    const existing = await prisma.profile.findFirst({ where: { id, userId } })
    if (!existing) return res.status(404).json({ success: false, message: 'Profile not found' })

    const validatedData = profileSchema.parse(req.body)

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: validatedData
    })

    res.status(200).json({ success: true, data: updatedProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors })
    }
    console.error('Error updating profile:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}
