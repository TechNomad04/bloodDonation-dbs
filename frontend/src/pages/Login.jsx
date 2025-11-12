import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import FormInput from '../components/FormInput'
import '../styles/auth.css'

// Eye icon components for password visibility
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
  </svg>
)

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708"/>
  </svg>
)

// Valid blood groups matching backend schema
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const VALID_ROLES = ['donor', 'patient', 'admin', 'super-admin']

export default function Login() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: VALID_ROLES[0],
    bloodGroup: VALID_BLOOD_GROUPS[0]
  })
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (isSignup) {
      // Name validation
      if (!formData.name.trim()) return 'Name is required'
      if (formData.name.length < 3) return 'Name must be at least 3 characters long'
      
      // Role validation
      if (!VALID_ROLES.includes(formData.role)) {
        return 'Invalid role selected'
      }

      // Blood group validation
      if (!VALID_BLOOD_GROUPS.includes(formData.bloodGroup)) {
        return 'Invalid blood group selected'
      }
    }

    // Email validation
    if (!formData.email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email address'

    // Password validation
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 6) return 'Password must be at least 6 characters long'
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const endpoint = `/auth/${isSignup ? 'signup' : 'login'}`
      const payload = isSignup 
        ? formData 
        : { email: formData.email, password: formData.password }

      const { data } = await api.post(endpoint, payload)

      // Store auth data
      localStorage.setItem('token', data.token)
      
      // Login using context
      login({
        role: data.role,
        name: data.name,
        bank: data.bank,
        bloodGroup: data.bloodGroup
      })
    } catch (err) {
      console.error('Auth error:', err)
      const errorMessage = err.response?.data?.message || 
        (err.code === 'ECONNABORTED' 
          ? 'Connection timeout. Please try again.' 
          : 'Authentication failed. Please try again.')
      setError(errorMessage)
      
      // Clear password on error
      setFormData(prev => ({
        ...prev,
        password: ''
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <FormInput
              label="Full Name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                className="form-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {isSignup && (
            <>
              <div className="form-group">
                <label>I am a</label>
                <select
                  className="form-input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="donor">Blood Donor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <select
                  className="form-input"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  {VALID_BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="submit" disabled={isLoading}>
              <div className="button-content">
                {isLoading && <div className="loading-spinner" />}
                <span>{isLoading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Login')}</span>
              </div>
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  role: 'donor',
                  bloodGroup: 'A+'
                })
              }}
              disabled={isLoading}
            >
              <span>{isSignup ? 'Already have an account?' : 'Create new account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}