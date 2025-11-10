const express = require('express')
const router = express.Router()
const {addbank, fetchbanks, removebank} = require('../controllers/bank.controllers')

router.post('/addbank', addbank)
router.get('/fetchbanks', fetchbanks)
router.delete('/deletebank', removebank)

module.exports = router