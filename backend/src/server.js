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

app.use('/auth', authRoutes)
app.use('/banks', bankRoutes)
app.use('/admin', adminRoutes)
app.use('/requests', requestRoutes)

mongoose.connect(MONGO_URL).then(() => {
	app.listen(PORT, () => {})
})


