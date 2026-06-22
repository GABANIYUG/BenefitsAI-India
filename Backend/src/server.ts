import app from './app'
import dotenv from 'dotenv'
import { initializeQdrant } from './lib/qdrant'
import prisma from './lib/prisma'

dotenv.config()

const PORT = process.env.PORT || 8000

const startServer = async () => {
  try {
    // Check DB Connection
    await prisma.$connect()
    console.log('PostgreSQL database connected')

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
