const {signup} = require('../controllers/authentication.controllers')
const express = require('express')
const router = express.Router()

router.post('/signup', signup)

module.exports = router