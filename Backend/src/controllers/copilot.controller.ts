import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { gemini, generateEmbedding } from '../lib/gemini'
import qdrant, { SCHEMES_COLLECTION } from '../lib/qdrant'
import prisma from '../lib/prisma'
import { EligibilityEvaluator, RuleAST } from '../services/eligibility'

export const handleChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid
    const { message, profileId, sessionId } = req.body

    if (!message) return res.status(400).json({ success: false, message: 'Message is required' })

    // 1. Get embedding for user query
    const embedding = await generateEmbedding(message)
    
    // 2. Query Qdrant for relevant schemes
    let contextData = ""
    if (embedding.length > 0) {
      const searchResults = await qdrant.search(SCHEMES_COLLECTION, {
        vector: embedding,
        limit: 3
      })

      const schemeIds = searchResults.map(r => r.id as string)
      if (schemeIds.length > 0) {
        const schemes = await prisma.scheme.findMany({
          where: { qdrantId: { in: schemeIds } }
        })
        contextData = schemes.map(s => `Scheme: ${s.title}\nDescription: ${s.description}\nBenefits: ${JSON.stringify(s.benefits)}`).join("\n\n")
      }
    }

    // 3. Load user profile if provided for personalized eligibility context
    let profileContext = ""
    if (profileId && userId) {
      const profile = await prisma.profile.findFirst({ where: { id: profileId, userId } })
      if (profile) {
        profileContext = `User Profile: Age ${profile.age}, State ${profile.state}, Income ${profile.income}, Student: ${profile.isStudent}.`
      }
    }

    // 4. Construct prompt for Gemini 2.5 Flash
    const systemInstruction = `
      You are BenefitAI India Copilot. You help Indian citizens discover government schemes.
      Answer the user's question based ONLY on the provided context. Do not invent schemes.
      If the user provides a profile, tell them if they might be eligible based on the scheme details.
      
      CONTEXT SCHEMES:
      ${contextData}

      ${profileContext}
    `

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction
      }
    })

    const reply = response.text || "I'm sorry, I couldn't process that request."

    // 5. Save chat history if session provided
    if (sessionId && userId) {
      // Validate session belongs to user
      const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } })
      if (session) {
        await prisma.chatMessage.createMany({
          data: [
            { sessionId, role: 'user', content: message },
            { sessionId, role: 'assistant', content: reply }
          ]
        })
      }
    }

    res.status(200).json({ success: true, reply })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ success: false, message: 'AI Service Error' })
  }
}
