const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
}, {timestamps: true})

const donorschema = new mongoose.Schema({
    bloodgroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    }
})

const patientSchema = new mongoose.Schema({
    bloodgroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    }
})

const User = mongoose.model("User", userschema)
const Donor = User.discriminator("Donor", donorschema)
const Patient = User.discriminator("Patient", patientSchema)
module.exports = {
    User,
    Donor,
    Patient
}