import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { PORT, MONGO_URL } from './config.js'
import authRoutes from './routes/auth.js'
import bankRoutes from './routes/banks.js'
import adminRoutes from './routes/admin.js'
import requestRoutes from './routes/requests.js'
import superadminRoutes from './routes/superadmin.js'

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] }
})
app.set('io', io)
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
app.use('/superadmin', superadminRoutes)

io.on('connection', (socket) => {
  console.log('🟢 Realtime client connected', socket.id)
  socket.on('disconnect', () => console.log('🔴 Realtime client disconnected', socket.id))
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})


