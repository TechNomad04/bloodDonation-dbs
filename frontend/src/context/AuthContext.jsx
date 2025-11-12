import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (e) {
        // Invalid JSON, clear storage
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    // Also store token (should be set elsewhere)
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('Token not found in localStorage after login')
    }

    // Navigate based on role
    switch (userData.role) {
      case 'superadmin':
        navigate('/superadmin')
        break
      case 'admin':
        navigate('/admin')
        break
      case 'donor':
        navigate('/donor')
        break
      default:
        navigate('/patient')
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    navigate('/')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext