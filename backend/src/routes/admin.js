import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { auth, requireRole } from '../middleware/auth.js'
const router = express.Router()

router.post('/users', auth, requireRole('admin'), async (req, res) => {
	try {
		const { name, email, password, role, bloodGroup } = req.body

		// Basic required fields validation
		const errors = []
		if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push('Name is required and must be at least 2 characters')
		if (!email || typeof email !== 'string') errors.push('Email is required')
		if (!password || typeof password !== 'string') errors.push('Password is required')
		if (!role || typeof role !== 'string') errors.push('Role is required')
		if (!bloodGroup || typeof bloodGroup !== 'string') errors.push('Blood group is required')

		if (errors.length > 0) return res.status(400).json({ message: errors.join('. ') })

		// Validate role allowed to be created by admin
		const allowedRoles = ['donor', 'patient']
		if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role. Admins can only create donor or patient users.' })

		// Email format check
		const emailValue = email.toLowerCase().trim()
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(emailValue)) return res.status(400).json({ message: 'Please provide a valid email address' })

		// Password strength check (min 6, at least one letter and one number)
		if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' })
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/
		if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must contain at least one letter and one number' })

		// Check duplicate email globally to avoid double registration
		const existing = await User.findOne({ email: emailValue })
		if (existing) return res.status(400).json({ message: 'This email is already registered' })

		// Hash password and create user
		const passwordHash = await bcrypt.hash(password, 10)
		let created
		try {
			created = await User.create({
				name: name.trim(),
				email: emailValue,
				passwordHash,
				role,
				bloodGroup,
				bank: req.user.bank,
				active: true,
				createdBy: req.user.id  // Track which admin created this user
			})
		} catch (e) {
			// Handle duplicate key race
			if (e?.code === 11000) return res.status(400).json({ message: 'This email is already registered' })
			console.error('Error creating user by admin:', e)
			return res.status(500).json({ message: 'Could not create user. Please try again.' })
		}

		res.status(201).json({ id: created._id })

		// Emit notifications (best-effort)
		try { req.app.get('io').emit('admin:users:changed', { bankId: String(req.user.bank) }) } catch (e) {}
		try { req.app.get('io').emit('superadmin:users:changed') } catch (e) {}
	} catch (err) {
		console.error('Unexpected error in admin create user route:', err)
		res.status(500).json({ message: 'Server error' })
	}
})

router.get('/users', auth, requireRole('admin'), async (req, res) => {
	const list = await User.find({ bank: req.user.bank, role: { $in: ['donor', 'patient'] } })
		.select('-passwordHash')
		.populate('createdBy', 'name email')  // Populate admin name/email who created the user
	res.json(list)
})

router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
	const u = await User.findById(req.params.id)
	if (!u || String(u.bank) !== String(req.user.bank)) return res.status(404).json({ message: 'Not found' })
	await User.findByIdAndDelete(req.params.id)
	res.json({ ok: true })
	try { req.app.get('io').emit('admin:users:changed', { bankId: String(req.user.bank) }) } catch {}
	try { req.app.get('io').emit('superadmin:users:changed') } catch {}
})

export default router


