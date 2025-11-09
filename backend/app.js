const express = require('express')
const { connectdb } = require('./db')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth.routes')
const bankRoutes = require('./routes/bank.routes')

app.use('/auth', authRoutes)
app.use('/bank', bankRoutes)

require('dotenv').config()
connectdb()
app.listen(5000, () => console.log("Server started"))