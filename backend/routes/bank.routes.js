const express = require('express')
const router = express.Router()
const {addbank, fetchbanks} = require('../controllers/bank.controllers')

router.post('/addbank', addbank)
router.get('/fetchbanks', fetchbanks)

module.exports = router