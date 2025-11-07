const express = require('express')
const { connectdb } = require('./db')
const app = express()

require('dotenv').config()
connectdb()
app.listen(3000, () => console.log("Server started"))