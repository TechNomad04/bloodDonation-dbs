const {signup, login} = require('../controllers/auth.controllers')
const express = require('express')
const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)

module.exports = router