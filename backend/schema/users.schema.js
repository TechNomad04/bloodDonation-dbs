const mongoose = require('mongoose')

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    usertype: {
        type: String,
        enum: ['Donor', 'Patient'],
        required: true
    }
})

const User = mongoose.model("User", user)
module.exports = User