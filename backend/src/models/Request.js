import mongoose from 'mongoose'
const schema = new mongoose.Schema({
	type: { type: String, enum: ['donation', 'receive'], required: true },
	bank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
	requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
	status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true })
export default mongoose.model('Request', schema)


