const mongoose = require('mongoose')

const bankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    addressline1: {
        type: String,
        required: true
    },
    addressline2: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
}, {timestamps: true})

const Bank = mongoose.model("Bank", bankSchema)

module.exports = Bank