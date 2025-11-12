import mongoose from 'mongoose'
const schema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true, lowercase: true, index: true },
	passwordHash: { type: String, required: true },
	role: { type: String, enum: ['superadmin', 'admin', 'donor', 'patient'], required: true },
	bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
	bank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
	active: { type: Boolean, default: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, description: 'Admin who created this user; null if self-registered' }
}, { timestamps: true })
export default mongoose.model('User', schema)


