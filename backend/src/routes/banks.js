import express from 'express'
import bcrypt from 'bcryptjs'
import BloodBank from '../models/BloodBank.js'
import User from '../models/User.js'
import { auth, requireRole } from '../middleware/auth.js'
const router = express.Router()

router.get('/', auth, async (req, res) => {
	const banks = await BloodBank.find().sort({ name: 1 })
	res.json(banks)
})

router.post('/', auth, requireRole('superadmin'), async (req, res) => {
	const { name, address, adminEmail, adminPassword, adminName } = req.body
	if (!adminEmail || !adminPassword) return res.status(400).json({ message: 'Admin credentials required' })
	const existingUser = await User.findOne({ email: adminEmail })
	if (existingUser) return res.status(400).json({ message: 'Admin email already in use' })
	const created = await BloodBank.create({ name, address })
	const passwordHash = await bcrypt.hash(adminPassword, 10)
	await User.create({
		name: adminName || `${name} Admin`,
		email: adminEmail,
		passwordHash,
		role: 'admin',
		bank: created._id
	})
	res.status(201).json(created)
})

router.delete('/:id', auth, requireRole('superadmin'), async (req, res) => {
	await BloodBank.findByIdAndDelete(req.params.id)
	res.json({ ok: true })
})

export default router


