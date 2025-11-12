import express from 'express'
import BloodBank from '../models/BloodBank.js'
import Request from '../models/Request.js'
import User from '../models/User.js'
import { auth, requireRole } from '../middleware/auth.js'
const router = express.Router()

router.post('/donate', auth, requireRole('donor'), async (req, res) => {
	const { bankId, bloodGroup } = req.body
	const bank = await BloodBank.findById(bankId)
	if (!bank) return res.status(404).json({ message: 'Bank not found' })
	const r = await Request.create({ type: 'donation', bank: bankId, requestedBy: req.user.id, bloodGroup })
	res.status(201).json(r)
	try { req.app.get('io').emit('requests:changed', { bankId: String(bankId) }) } catch {}
})

router.post('/receive', auth, requireRole('patient'), async (req, res) => {
	const { bankId, bloodGroup } = req.body
	const bank = await BloodBank.findById(bankId)
	if (!bank) return res.status(404).json({ message: 'Bank not found' })
	if ((bank.inventory[bloodGroup] || 0) <= 0) return res.status(400).json({ message: 'Not available' })
	const r = await Request.create({ type: 'receive', bank: bankId, requestedBy: req.user.id, bloodGroup })
	res.status(201).json(r)
})

router.get('/pending', auth, requireRole('admin'), async (req, res) => {
	const list = await Request.find({ status: 'pending' }).populate('bank')
	const filtered = list.filter(r => String(r.bank._id) === String(req.user.bank))
	res.json(filtered)
})

router.post('/:id/approve', auth, requireRole('admin'), async (req, res) => {
	const r = await Request.findById(req.params.id).populate('bank')
	if (!r || String(r.bank._id) !== String(req.user.bank)) return res.status(404).json({ message: 'Not found' })
	if (r.type === 'donation') {
		r.bank.inventory[r.bloodGroup] = (r.bank.inventory[r.bloodGroup] || 0) + 1
		await r.bank.save()
		await User.findByIdAndUpdate(r.requestedBy, { active: false })
	} else {
		if ((r.bank.inventory[r.bloodGroup] || 0) <= 0) return res.status(400).json({ message: 'Not available' })
		r.bank.inventory[r.bloodGroup] = (r.bank.inventory[r.bloodGroup] || 0) - 1
		await r.bank.save()
		await User.findByIdAndUpdate(r.requestedBy, { active: false })
	}
	r.status = 'approved'
	await r.save()
	res.json({ ok: true })
	try { req.app.get('io').emit('requests:changed', { bankId: String(r.bank._id) }) } catch {}
	try { req.app.get('io').emit('banks:changed') } catch {}
	try { req.app.get('io').emit('bank:details:changed', { bankId: String(r.bank._id) }) } catch {}
})

router.post('/:id/reject', auth, requireRole('admin'), async (req, res) => {
	const r = await Request.findById(req.params.id).populate('bank')
	if (!r || String(r.bank._id) !== String(req.user.bank)) return res.status(404).json({ message: 'Not found' })
	r.status = 'rejected'
	await r.save()
	res.json({ ok: true })
	try { req.app.get('io').emit('requests:changed', { bankId: String(r.bank._id) }) } catch {}
})

// Get user's own requests and donations
router.get('/my-history', auth, async (req, res) => {
	try {
		const myRequests = await Request.find({ requestedBy: req.user.id })
			.populate('bank', 'name address phone')
			.sort({ createdAt: -1 })
		
		// Separate donations and receives
		const donations = myRequests.filter(r => r.type === 'donation')
		const receives = myRequests.filter(r => r.type === 'receive')
		
		res.json({
			donations: donations.map(d => ({
				id: d._id,
				bloodGroup: d.bloodGroup,
				status: d.status,
				bank: d.bank,
				date: d.createdAt
			})),
			receives: receives.map(r => ({
				id: r._id,
				bloodGroup: r.bloodGroup,
				status: r.status,
				bank: r.bank,
				date: r.createdAt
			}))
		})
	} catch (err) {
		console.error('Error fetching user history:', err)
		res.status(500).json({ message: 'Could not fetch history' })
	}
})

// Get user's donation history (donors only)
router.get('/donations', auth, requireRole('donor'), async (req, res) => {
	try {
		const donations = await Request.find({ 
			requestedBy: req.user.id, 
			type: 'donation',
			status: 'approved'
		})
			.populate('bank', 'name address')
			.sort({ createdAt: -1 })
		
		res.json({
			totalDonations: donations.length,
			donations: donations.map(d => ({
				id: d._id,
				bloodGroup: d.bloodGroup,
				bank: d.bank,
				date: d.createdAt,
				lastDonated: d.updatedAt
			}))
		})
	} catch (err) {
		console.error('Error fetching donations:', err)
		res.status(500).json({ message: 'Could not fetch donations' })
	}
})

// Get user's blood requests (patients only)
router.get('/blood-requests', auth, requireRole('patient'), async (req, res) => {
	try {
		const requests = await Request.find({ 
			requestedBy: req.user.id, 
			type: 'receive'
		})
			.populate('bank', 'name address phone')
			.sort({ createdAt: -1 })
		
		res.json({
			totalRequests: requests.length,
			pending: requests.filter(r => r.status === 'pending').length,
			approved: requests.filter(r => r.status === 'approved').length,
			rejected: requests.filter(r => r.status === 'rejected').length,
			requests: requests.map(r => ({
				id: r._id,
				bloodGroup: r.bloodGroup,
				status: r.status,
				bank: r.bank,
				requestDate: r.createdAt,
				updatedDate: r.updatedAt
			}))
		})
	} catch (err) {
		console.error('Error fetching blood requests:', err)
		res.status(500).json({ message: 'Could not fetch requests' })
	}
})

export default router


