import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { MONGO_URL, SEED_SUPERADMIN_EMAIL, SEED_SUPERADMIN_PASSWORD } from './config.js'
import User from './models/User.js'
import BloodBank from './models/BloodBank.js'

const run = async () => {
	await mongoose.connect(MONGO_URL)
	const exists = await User.findOne({ email: SEED_SUPERADMIN_EMAIL })
	if (!exists) {
		const passwordHash = await bcrypt.hash(SEED_SUPERADMIN_PASSWORD, 10)
		await User.create({ name: 'Super Admin', email: SEED_SUPERADMIN_EMAIL, passwordHash, role: 'superadmin' })
	}
	const bank = await BloodBank.findOne()
	if (!bank) {
		const b = await BloodBank.create({ name: 'Central Blood Bank', address: 'Main Street' })
		const adminExists = await User.findOne({ email: 'admin@central.com' })
		if (!adminExists) {
			const ph = await bcrypt.hash('admin123', 10)
			await User.create({ name: 'Central Admin', email: 'admin@central.com', passwordHash: ph, role: 'admin', bank: b._id })
		}
	}
	await mongoose.disconnect()
}
run()


