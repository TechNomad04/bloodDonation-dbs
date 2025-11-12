import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import '../styles/auth-modern.css'

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
      if (!formData.name.trim()) return 'Name is required'
      if (formData.name.length < 3) return 'Name must be at least 3 characters long'
      if (!VALID_ROLES.includes(formData.role)) return 'Invalid role selected'
      if (!VALID_BLOOD_GROUPS.includes(formData.bloodGroup)) return 'Invalid blood group selected'
    }

    if (!formData.email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email address'

    if (!formData.password) return 'Password is required'
    if (formData.password.length < 6) return 'Password must be at least 6 characters long'
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

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

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        role: data.role,
        name: data.name,
        bank: data.bank,
        bloodGroup: data.bloodGroup
      }))

      login({
        role: data.role,
        name: data.name,
        bank: data.bank,
        bloodGroup: data.bloodGroup
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-brand-content">
            <div className="auth-brand-icon">🩸</div>
            <h1>Blood Donation<br/>Management System</h1>
            <p>Save lives through organized blood donation</p>
          </div>
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Easy Blood Requests</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Secure & Reliable</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Real-time Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-wrapper">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{isSignup ? 'Join our blood donation network' : 'Login to your account'}</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg className="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {isSignup && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="role">Role</label>
                      <select value={formData.role} name="role" onChange={handleChange} id="role" required>
                        {VALID_ROLES.map(r => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="bloodGroup">Blood Group</label>
                      <select value={formData.bloodGroup} name="bloodGroup" onChange={handleChange} id="bloodGroup" required>
                        {VALID_BLOOD_GROUPS.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>{isSignup ? 'Creating account...' : 'Logging in...'}</span>
                  </>
                ) : (
                  <span>{isSignup ? 'Create Account' : 'Login'}</span>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-toggle">
              <p>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className="auth-toggle-btn"
                  onClick={() => {
                    setIsSignup(!isSignup)
                    setError('')
                    setFormData({
                      email: '',
                      password: '',
                      name: '',
                      role: VALID_ROLES[0],
                      bloodGroup: VALID_BLOOD_GROUPS[0]
                    })
                  }}
                >
                  {isSignup ? 'Login' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
