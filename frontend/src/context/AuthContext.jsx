import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing session
    const role = localStorage.getItem('role')
    const name = localStorage.getItem('name')
    const bank = localStorage.getItem('bank')
    const bloodGroup = localStorage.getItem('bloodGroup')
    
    if (role) {
      setUser({ role, name, bank, bloodGroup })
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('role', userData.role)
    localStorage.setItem('name', userData.name || '')
    localStorage.setItem('bank', userData.bank || '')
    localStorage.setItem('bloodGroup', userData.bloodGroup || '')

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