import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
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
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const userId = req.user.uid

    const { data: profiles, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('userId', userId)

    if (error) throw error
    
    res.status(200).json({ success: true, data: profiles })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const createProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const userId = req.user.uid

    const validatedData = profileSchema.parse(req.body)

    // Ensure User exists in DB
    const { error: upsertError } = await supabase
      .from('User')
      .upsert({ id: userId, email: req.user.email })

    if (upsertError) throw upsertError

    const { data: newProfile, error } = await supabase
      .from('Profile')
      .insert({
        ...validatedData,
        userId
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, data: newProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation Error', errors: error.issues })
    }
    console.error('Error creating profile:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    if (!req.user || !req.user.uid) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const userId = req.user.uid

    // Ensure they own the profile
    const { data: existing, error: findError } = await supabase
      .from('Profile')
      .select('id')
      .eq('id', id)
      .eq('userId', userId)
      .single()

    if (findError || !existing) return res.status(404).json({ success: false, message: 'Profile not found' })

    const validatedData = profileSchema.parse(req.body)

    const { data: updatedProfile, error: updateError } = await supabase
      .from('Profile')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    res.status(200).json({ success: true, data: updatedProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation Error', errors: error.issues })
    }
    console.error('Error updating profile:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}
