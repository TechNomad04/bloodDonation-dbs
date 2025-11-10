import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import Admin from './pages/Admin.jsx'
import Donor from './pages/Donor.jsx'
import Patient from './pages/Patient.jsx'

export default function App() {
	const [user, setUser] = useState(null)
	const navigate = useNavigate()
	useEffect(() => {
		const role = localStorage.getItem('role')
		const name = localStorage.getItem('name')
		const bank = localStorage.getItem('bank')
		const bloodGroup = localStorage.getItem('bloodGroup')
		if (role) setUser({ role, name, bank, bloodGroup })
	}, [])
	const onLogout = () => {
		localStorage.clear()
		setUser(null)
		navigate('/')
	}
	return (
		<div className="container">
			<Routes>
				<Route path="/" element={<Login onLogin={setUser} />} />
				<Route path="/superadmin" element={<SuperAdmin user={user} onLogout={onLogout} />} />
				<Route path="/admin" element={<Admin user={user} onLogout={onLogout} />} />
				<Route path="/donor" element={<Donor user={user} onLogout={onLogout} />} />
				<Route path="/patient" element={<Patient user={user} onLogout={onLogout} />} />
			</Routes>
		</div>
	)
}


