import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { JWT_SECRET } from '../config.js'
const router = express.Router()

router.post('/signup', async (req, res) => {
	const { name, email, password, role, bloodGroup } = req.body
	if (!['donor', 'patient'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
	const exists = await User.findOne({ email })
	if (exists) return res.status(400).json({ message: 'Email in use' })
	const passwordHash = await bcrypt.hash(password, 10)
	const created = await User.create({ name, email, passwordHash, role, bloodGroup, active: true })
	const token = jwt.sign({ id: created._id }, JWT_SECRET, { expiresIn: '7d' })
	res.status(201).json({ token, role: created.role, name: created.name, bank: created.bank, bloodGroup: created.bloodGroup })
})

router.post('/login', async (req, res) => {
	const { email, password } = req.body
	const user = await User.findOne({ email })
	if (!user) return res.status(400).json({ message: 'Invalid credentials' })
	const ok = await bcrypt.compare(password, user.passwordHash)
	if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
	const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
	res.json({ token, role: user.role, name: user.name, bank: user.bank, bloodGroup: user.bloodGroup })
})

export default router


