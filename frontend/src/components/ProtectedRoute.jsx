import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'superadmin':
        return <Navigate to="/superadmin" replace />
      case 'admin':
        return <Navigate to="/admin" replace />
      case 'donor':
        return <Navigate to="/donor" replace />
      default:
        return <Navigate to="/patient" replace />
    }
  }

  return children
}