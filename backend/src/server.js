import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { PORT, MONGO_URL } from './config.js'
import authRoutes from './routes/auth.js'
import bankRoutes from './routes/banks.js'
import adminRoutes from './routes/admin.js'
import requestRoutes from './routes/requests.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// MongoDB Connection with proper logging
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully')
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
  })

// Log all MongoDB operations in development
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true)
}

app.use('/auth', authRoutes)
app.use('/banks', bankRoutes)
app.use('/admin', adminRoutes)
app.use('/requests', requestRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})


