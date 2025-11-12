import { useNavigate } from 'react-router-dom'

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate()

  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>Blood Donation Management</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}