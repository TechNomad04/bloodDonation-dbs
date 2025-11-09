const {signup, login, adlogin, superadlog, superadadd} = require('../controllers/auth.controllers')
const express = require('express')
const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/adlogin', adlogin)
router.post('/superadlog', superadlog)
router.post('/superadd', superadadd)

module.exports = router