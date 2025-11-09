const mongoose = require('mongoose')

const superadminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, {timestamps: true})

const Superadmin = mongoose.model("Superadmin", superadminSchema)

module.exports = Superadmin