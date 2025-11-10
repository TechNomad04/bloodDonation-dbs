import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { JWT_SECRET } from '../config.js'
const router = express.Router()

router.post('/signup', async (req, res) => {
    try {
        console.log('📝 Received signup request with body:', { ...req.body, password: '***' })
        const { name, email, password, role, bloodGroup } = req.body

        // Validate required fields and data types
        const validationErrors = []
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            validationErrors.push('Name is required and must be a valid string')
        }
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            validationErrors.push('Email is required and must be a valid string')
        }
        if (!password || typeof password !== 'string' || password.trim().length === 0) {
            validationErrors.push('Password is required and must be a valid string')
        }
        if (!role || typeof role !== 'string') {
            validationErrors.push('Role is required and must be a valid string')
        }
        if (!bloodGroup || typeof bloodGroup !== 'string') {
            validationErrors.push('Blood group is required and must be a valid string')
        }

        if (validationErrors.length > 0) {
            console.log('❌ Signup validation failed:', validationErrors)
            return res.status(400).json({ message: validationErrors.join('. ') })
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
        if (!emailRegex.test(email)) {
            console.log('❌ Signup failed: Invalid email format:', email)
            return res.status(400).json({ message: 'Please enter a valid email address' })
        }

        // Validate role
        const validRoles = ['donor', 'patient']
        if (!validRoles.includes(role)) {
            console.log('❌ Signup failed: Invalid role:', role)
            return res.status(400).json({ message: 'Role must be either donor or patient' })
        }

        // Validate blood group
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if (!validBloodGroups.includes(bloodGroup)) {
            console.log('❌ Signup failed: Invalid blood group:', bloodGroup)
            return res.status(400).json({ message: 'Invalid blood group selected' })
        }

        // Check if email exists
        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists) {
            console.log('❌ Signup failed: Email already exists:', email)
            return res.status(400).json({ message: 'This email is already registered' })
        }

        // Password validation
        if (password.length < 6) {
            console.log('❌ Signup failed: Password too short')
            return res.status(400).json({ message: 'Password must be at least 6 characters long' })
        }

        // Additional password strength validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
        if (!passwordRegex.test(password)) {
            console.log('❌ Signup failed: Password not strong enough')
            return res.status(400).json({ 
                message: 'Password must contain at least one letter and one number'
            })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)
        
        // Create user with sanitized data
        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            role,
            bloodGroup,
            active: true
        }
        
        console.log('🔄 Attempting to create user:', { ...userData, passwordHash: '***' })
        
        const created = await User.create(userData)
        console.log('✅ User created successfully:', { 
            id: created._id, 
            email: created.email, 
            role: created.role 
        })

        // Generate token
        const token = jwt.sign(
            { id: created._id }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        )

        // Send success response
        res.status(201).json({ 
            token, 
            role: created.role, 
            name: created.name, 
            bank: created.bank, 
            bloodGroup: created.bloodGroup,
            message: 'Account created successfully' 
        })
    } catch (error) {
        console.error('❌ Signup error:', error)
        res.status(500).json({ message: 'Could not create account. Please try again.' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        console.log('🔐 Login attempt:', { email })

        // Validate required fields
        if (!email || !password) {
            console.log('❌ Login failed: Missing credentials')
            return res.status(400).json({ message: 'Email and password are required' })
        }

        // Find user
        const user = await User.findOne({ email })
        if (!user) {
            console.log('❌ Login failed: User not found')
            return res.status(401).json({ message: 'No account found with this email' })
        }

        // Verify password
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) {
            console.log('❌ Login failed: Incorrect password')
            return res.status(401).json({ message: 'Incorrect password' })
        }

        console.log('✅ Login successful:', { id: user._id, email: user.email, role: user.role })
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
        res.json({ 
            token, 
            role: user.role, 
            name: user.name, 
            bank: user.bank, 
            bloodGroup: user.bloodGroup 
        })
    } catch (error) {
        console.error('❌ Login error:', error)
        res.status(500).json({ message: 'Login failed. Please try again.' })
    }
})

export default router


