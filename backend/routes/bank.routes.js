const express = require('express')
const router = express.Router()
const {addbank} = require('../controllers/bank.controllers')

router.post('/addbank', addbank)

module.exports = router