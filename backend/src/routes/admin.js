import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { auth, requireRole } from '../middleware/auth.js'
const router = express.Router()

router.post('/users', auth, requireRole('admin'), async (req, res) => {
	const { name, email, password, role, bloodGroup } = req.body
	if (!['donor', 'patient'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
	const passwordHash = await bcrypt.hash(password, 10)
	const created = await User.create({ name, email, passwordHash, role, bloodGroup, bank: req.user.bank })
	res.status(201).json({ id: created._id })
})

router.get('/users', auth, requireRole('admin'), async (req, res) => {
	const list = await User.find({ bank: req.user.bank, role: { $in: ['donor', 'patient'] } }).select('-passwordHash')
	res.json(list)
})

router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
	const u = await User.findById(req.params.id)
	if (!u || String(u.bank) !== String(req.user.bank)) return res.status(404).json({ message: 'Not found' })
	await User.findByIdAndDelete(req.params.id)
	res.json({ ok: true })
})

export default router


