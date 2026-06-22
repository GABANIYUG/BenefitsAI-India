import { QdrantClient } from '@qdrant/js-client-rest'

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
})

export const SCHEMES_COLLECTION = 'schemes'

export const initializeQdrant = async () => {
  try {
    const collections = await qdrant.getCollections()
    const exists = collections.collections.some(c => c.name === SCHEMES_COLLECTION)
    
    if (!exists) {
      await qdrant.createCollection(SCHEMES_COLLECTION, {
        vectors: {
          size: 768, // Gemini text-embedding-004 embedding size
          distance: 'Cosine'
        }
      })
      console.log(`Created Qdrant collection: ${SCHEMES_COLLECTION}`)
    }
  } catch (error) {
    console.error('Qdrant initialization failed:', error)
  }
}

export default qdrant
