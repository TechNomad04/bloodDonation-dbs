import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import FormInput from '../components/FormInput'
import '../styles/auth.css'

export default function Login() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'donor',
    bloodGroup: 'A+'
  })
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const endpoint = isSignup ? 'auth.signup' : 'auth.login'
      const { data } = await api[endpoint](formData)

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
      setError(err.response?.data?.message || 'Authentication failed. Please try again.')
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
          
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

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
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Login')}
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
              {isSignup ? 'Already have an account?' : 'Create new account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}