import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { EligibilityEvaluator, RuleAST } from '../services/eligibility'
import { gemini } from '../lib/gemini'

const translatedSchemesCache: Record<string, any[]> = {}

const translateSchemes = async (schemes: any[], lang: string) => {
  if (!schemes || schemes.length === 0 || lang === 'EN') return schemes;
  const cacheKey = lang.toUpperCase();
  if (translatedSchemesCache[cacheKey]) {
    return translatedSchemesCache[cacheKey];
  }

  const langMap: Record<string, string> = {
    'HI': 'Hindi',
    'GU': 'Gujarati',
  }
  const targetLanguage = langMap[cacheKey];
  if (!targetLanguage) return schemes;

  const prompt = `Translate the following JSON array of government schemes into ${targetLanguage}. Keep the exact JSON array structure and keys ("id", "title", "department", "description", "qdrantId"). Only translate the string values for "title", "department", and "description". Do not add any markdown, return only the raw JSON array.
  JSON: ${JSON.stringify(schemes)}`;

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    
    let text = response.text || "[]";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const translated = JSON.parse(text);
    translatedSchemesCache[cacheKey] = translated;
    return translated;
  } catch (error) {
    console.error("Translation error", error);
    return schemes;
  }
}

export const getSchemes = async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || 'EN';
    const { data: schemes, error } = await supabase
      .from('schemes')
      .select('*')

    if (error) throw error

    const finalSchemes = await translateSchemes(schemes || [], lang);

    res.status(200).json({ success: true, data: finalSchemes })
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

    const lang = (req.query.lang as string) || 'EN';
    const translatedSchemes = await translateSchemes(allSchemes || [], lang);

    const eligibleSchemes = translatedSchemes.map((scheme: any) => {
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
