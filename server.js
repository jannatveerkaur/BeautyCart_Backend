import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import authRoutes from './routes/auth.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Health check endpoint
app.get('/api/health', (_request, response) => {
  response.status(200).json({ success: true, message: 'BeautyCart API is running' })
})

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/auth', authRoutes)

// 404 handler
app.use((_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(port, () => {
  console.log(`BeautyCart API listening on port ${port}`)
})
