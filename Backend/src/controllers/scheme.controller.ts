import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { EligibilityEvaluator, RuleAST } from '../services/eligibility'

export const getSchemes = async (req: Request, res: Response) => {
  try {
    const { data: schemes, error } = await supabase
      .from('Scheme')
      .select('*, category:categoryId(*)')
      .eq('isActive', true)

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
    
    // We query the scheme and join category and documents.
    // Ensure that SchemeDocument foreign key points to Scheme table id.
    const { data: scheme, error } = await supabase
      .from('Scheme')
      .select('*, category:categoryId(*), documents:SchemeDocument(*)')
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
      .from('Scheme')
      .select('*, category:categoryId(*)')
      .eq('isActive', true)

    if (schemesError || !allSchemes) throw schemesError

    const evaluator = new EligibilityEvaluator(profile)
    const eligibleSchemes = allSchemes.map(scheme => {
      const evaluation = evaluator.evaluate(scheme.eligibilityRules as unknown as RuleAST)
      return {
        scheme,
        evaluation
      }
    }).filter(s => s.evaluation.isEligible)

    res.status(200).json({ success: true, data: eligibleSchemes })
  } catch (error) {
    console.error('Error computing eligible schemes:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}
