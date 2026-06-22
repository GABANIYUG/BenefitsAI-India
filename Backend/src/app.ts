import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app: Express = express()

// Global Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import profileRoutes from './routes/profile.routes'
import schemeRoutes from './routes/scheme.routes'
import copilotRoutes from './routes/copilot.routes'

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/v1/profiles', profileRoutes)
app.use('/api/v1/schemes', schemeRoutes)
app.use('/api/v1/copilot', copilotRoutes)

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

export default app
