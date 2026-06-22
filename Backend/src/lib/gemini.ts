import { GoogleGenAI } from '@google/genai'

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY'
})

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await gemini.models.embedContent({
      model: 'text-embedding-004',
      contents: text
    })
    return response.embeddings?.[0]?.values || []
  } catch (error) {
    console.error('Embedding error:', error)
    return []
  }
}
