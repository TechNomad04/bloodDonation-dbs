import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'
import User from '../models/User.js'

export const auth = async (req, res, next) => {
	try {
		const header = req.headers.authorization || ''
		const token = header.startsWith('Bearer ') ? header.slice(7) : null
		if (!token) return res.status(401).json({ message: 'Unauthorized' })
		const payload = jwt.verify(token, JWT_SECRET)
		const user = await User.findById(payload.id)
		if (!user || !user.active) return res.status(401).json({ message: 'Unauthorized' })
		req.user = { id: user._id.toString(), role: user.role, bank: user.bank, bloodGroup: user.bloodGroup }
		next()
	} catch {
		res.status(401).json({ message: 'Unauthorized' })
	}
}

export const requireRole = (...roles) => (req, res, next) => {
	if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
	next()
}


