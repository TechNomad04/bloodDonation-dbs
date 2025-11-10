import mongoose from 'mongoose'
const schema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	address: { type: String, required: true },
	inventory: {
		'A+': { type: Number, default: 0 },
		'A-': { type: Number, default: 0 },
		'B+': { type: Number, default: 0 },
		'B-': { type: Number, default: 0 },
		'AB+': { type: Number, default: 0 },
		'AB-': { type: Number, default: 0 },
		'O+': { type: Number, default: 0 },
		'O-': { type: Number, default: 0 }
	}
}, { timestamps: true })
export default mongoose.model('BloodBank', schema)


