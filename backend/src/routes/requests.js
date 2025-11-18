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
	const list = await Request.find({ status: 'pending', bank: req.user.bank }).populate('bank')
	const filtered = list.filter(r => r.bank)
	res.json(filtered)
})

router.post('/:id/approve', auth, requireRole('admin'), async (req, res) => {
	const r = await Request.findById(req.params.id).populate('bank')
	if (!r || !r.bank || String(r.bank._id) !== String(req.user.bank)) return res.status(404).json({ message: 'Not found' })
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
	if (!r || !r.bank || String(r.bank._id) !== String(req.user.bank)) return res.status(404).json({ message: 'Not found' })
	r.status = 'rejected'
	await r.save()
	res.json({ ok: true })
	try { req.app.get('io').emit('requests:changed', { bankId: String(r.bank._id) }) } catch {}
})

export default router


