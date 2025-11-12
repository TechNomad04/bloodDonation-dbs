import express from 'express'
import { auth, requireRole } from '../middleware/auth.js'
import BloodBank from '../models/BloodBank.js'
import User from '../models/User.js'
import Request from '../models/Request.js'

const router = express.Router()

// List all banks with inventory summary
router.get('/banks', auth, requireRole('superadmin'), async (req, res) => {
	const banks = await BloodBank.find().sort({ name: 1 })
	res.json(banks)
})

// Per bank: admins, users (donor/patient) and pending requests
router.get('/banks/:id/details', auth, requireRole('superadmin'), async (req, res) => {
	try {
		const bank = await BloodBank.findById(req.params.id)
		if (!bank) return res.status(404).json({ message: 'Bank not found' })
		const admins = await User.find({ bank: bank._id, role: 'admin' }).select('-passwordHash')
		const users = await User.find({ bank: bank._id, role: { $in: ['donor', 'patient'] } }).select('-passwordHash')
		const pending = await Request.find({ bank: bank._id, status: 'pending' })
			.sort({ createdAt: -1 })
			.populate('requestedBy', 'name email role')
			.lean()
		res.json({ bank, admins, users, pending })
	} catch (e) {
		console.error('superadmin details error', e)
		res.status(500).json({ message: 'Failed to load bank details' })
	}
})

// Cumulative: list all users with bank info (for superadmin dashboard)
router.get('/users', auth, requireRole('superadmin'), async (req, res) => {
	try {
		const users = await User.find().select('-passwordHash').populate('bank', 'name address')
		res.json(users)
	} catch (e) {
		console.error('superadmin users error', e)
		res.status(500).json({ message: 'Failed to load users' })
	}
})

// Cumulative: list requests with filters
router.get('/requests', auth, requireRole('superadmin'), async (req, res) => {
	try {
		const { status, type, bankId, group } = req.query
		const filter = {}
		if (status) filter.status = status
		if (type) filter.type = type
		if (bankId) filter.bank = bankId
		if (group) filter.bloodGroup = group
		const list = await Request.find(filter)
			.sort({ createdAt: -1 })
			.populate('bank', 'name address')
			.populate('requestedBy', 'name email role')
			.lean()
		res.json(list)
	} catch (e) {
		console.error('superadmin requests error', e)
		res.status(500).json({ message: 'Failed to load requests' })
	}
})

export default router


