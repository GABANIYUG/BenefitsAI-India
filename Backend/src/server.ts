import app from './app'
import dotenv from 'dotenv'
import { initializeQdrant } from './lib/qdrant'


dotenv.config()

const PORT = process.env.PORT || 8000

const startServer = async () => {
  try {
// Removed Prisma connect

    // Initialize Vector DB
    await initializeQdrant()
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
