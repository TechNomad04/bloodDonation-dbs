import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import SuperAdmin from './pages/SuperAdmin'
import Admin from './pages/Admin'
import Donor from './pages/Donor'
import Patient from './pages/Patient'

export default function App() {
  return (
    <AuthProvider>
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <Donor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Patient />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}


