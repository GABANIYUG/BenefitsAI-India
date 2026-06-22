import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { EligibilityEvaluator, RuleAST } from '../services/eligibility'

export const getSchemes = async (req: Request, res: Response) => {
  try {
    const schemes = await prisma.scheme.findMany({
      where: { isActive: true },
      include: { category: true }
    })
    res.status(200).json({ success: true, data: schemes })
  } catch (error) {
    console.error('Error fetching schemes:', error)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const getSchemeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const scheme = await prisma.scheme.findUnique({
      where: { id },
      include: { category: true, documents: true }
    })
    
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' })

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

    const profile = await prisma.profile.findFirst({ where: { id: profileId, userId } })
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' })

    const allSchemes = await prisma.scheme.findMany({
      where: { isActive: true },
      include: { category: true }
    })

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
