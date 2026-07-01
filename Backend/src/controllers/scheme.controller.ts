import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { EligibilityEvaluator, RuleAST } from '../services/eligibility'

export const getSchemes = async (req: Request, res: Response) => {
  try {
    const { data: schemes, error } = await supabase
      .from('schemes')
      .select('*')

    if (error) throw error

    res.status(200).json({ success: true, data: schemes })
  } catch (error) {
    console.error('Error fetching schemes:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const getSchemeById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    
    const { data: scheme, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' })
    }

    res.status(200).json({ success: true, data: scheme })
  } catch (error) {
    console.error('Error fetching scheme:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const getEligibleSchemes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid
    const profileId = req.query.profileId as string

    if (!userId || !profileId) {
      return res.status(400).json({ success: false, message: 'Profile ID and Authentication required' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('Profile')
      .select('*')
      .eq('id', profileId)
      .eq('userId', userId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' })
    }

    const { data: allSchemes, error: schemesError } = await supabase
      .from('schemes')
      .select('*')

    if (schemesError || !allSchemes) throw schemesError

    const eligibleSchemes = allSchemes.map(scheme => {
      // Mock evaluation for now since 'schemes' table doesn't have structured eligibilityRules
      return {
        scheme,
        evaluation: { isEligible: true, score: 100 }
      }
    })

    res.status(200).json({ success: true, data: eligibleSchemes })
  } catch (error) {
    console.error('Error computing eligible schemes:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}
