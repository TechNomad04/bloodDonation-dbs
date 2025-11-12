import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../realtime'
import '../styles/dashboard-modern.css'

const groups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function Admin() {
	const { user, logout } = useAuth()
	const [banks, setBanks] = useState([])
	const [users, setUsers] = useState([])
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('donor')
	const [bloodGroup, setBloodGroup] = useState('A+')
	const [pending, setPending] = useState([])
	const [activeTab, setActiveTab] = useState('dashboard')
	const [userQuery, setUserQuery] = useState('')
	const [reqQuery, setReqQuery] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	
	const myBank = useMemo(() => (banks.find(b => String(b._id) === String(user?.bank)) || {}), [banks, user])
	
	const load = async () => {
		const bs = await api.get('/banks')
		setBanks(bs.data)
		const us = await api.get('/admin/users')
		setUsers(us.data)
		const pr = await api.get('/requests/pending')
		setPending(pr.data)
	}
	
	useEffect(() => { load() }, [])
	
	useEffect(() => {
		const id = setInterval(() => { load() }, 5000)
		return () => clearInterval(id)
	}, [])
	
	useEffect(() => {
		const s = getSocket()
		const onUsersChanged = ({ bankId }) => {
			if (String(bankId) === String(user?.bank)) load()
		}
		const onRequests = ({ bankId }) => {
			if (String(bankId) === String(user?.bank)) load()
		}
		const onBanksChanged = () => load()
		s.on('admin:users:changed', onUsersChanged)
		s.on('requests:changed', onRequests)
		s.on('banks:changed', onBanksChanged)
		return () => {
			s.off('admin:users:changed', onUsersChanged)
			s.off('requests:changed', onRequests)
			s.off('banks:changed', onBanksChanged)
		}
	}, [user?.bank])
	
	const addUser = async () => {
		setError('')
		setSuccess('')
		if (!name || !email || !password) {
			setError('Please fill in all fields')
			return
		}
		try {
			await api.post('/admin/users', { name, email, password, role, bloodGroup })
			setSuccess('User added successfully!')
			setName('')
			setEmail('')
			setPassword('')
			setRole('donor')
			setBloodGroup('A+')
			setTimeout(() => setSuccess(''), 3000)
			load()
		} catch (err) {
			const msg = err.response?.data?.message || err.message || 'Failed to add user'
			setError(msg)
			console.error('Error adding user:', err)
		}
	}
	
	const delUser = async id => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			try {
				await api.delete('/admin/users/' + id)
				setSuccess('User deleted successfully!')
				setTimeout(() => setSuccess(''), 3000)
				load()
			} catch (err) {
				setError(err.response?.data?.message || 'Failed to delete user')
			}
		}
	}
	
	const approve = async id => {
		try {
			await api.post('/requests/' + id + '/approve')
			setSuccess('Request approved!')
			setTimeout(() => setSuccess(''), 3000)
			load()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to approve request')
		}
	}
	
	const reject = async id => {
		try {
			await api.post('/requests/' + id + '/reject')
			setSuccess('Request rejected!')
			setTimeout(() => setSuccess(''), 3000)
			load()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to reject request')
		}
	}
	
	const kpis = useMemo(() => {
		const inv = groups.reduce((acc, g) => acc + (myBank.inventory?.[g] ?? 0), 0)
		const donors = users.filter(u => u.role === 'donor').length
		const patients = users.filter(u => u.role === 'patient').length
		const pend = pending.length
		return { inv, donors, patients, pend }
	}, [myBank, users, pending])
	
	return (
		<div className="dashboard-container">
			{/* Header */}
			<header className="dashboard-header">
				<div className="container">
					<div className="header-content">
						<div className="header-brand">
							<span className="brand-icon">🏥</span>
							<div>
								<h1>Bank Admin Dashboard</h1>
								<p className="header-subtitle">{myBank.name}</p>
							</div>
						</div>
						<div className="header-user">
							<div className="user-info">
								<div>
									<p className="user-name">{user?.name}</p>
									<p className="user-role">{user?.role}</p>
								</div>
								<button className="logout-btn" onClick={logout}>Logout</button>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="main-content">
				<div className="container">
					{/* Alert Messages */}
					{error && (
						<div className="alert alert-error">
							<svg className="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
							{error}
						</div>
					)}
					{success && (
						<div className="alert alert-success">
							<svg className="alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							{success}
						</div>
					)}

					{/* Tabs */}
					<div className="tabs-wrapper">
						<div className="tabs">
							<button
								className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
								onClick={() => setActiveTab('dashboard')}
							>
								📊 Dashboard
							</button>
							<button
								className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
								onClick={() => setActiveTab('users')}
							>
								👥 Users
							</button>
							<button
								className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
								onClick={() => setActiveTab('requests')}
							>
								📋 Requests
							</button>
						</div>
					</div>

					{/* Dashboard Tab */}
					{activeTab === 'dashboard' && (
						<div>
							<div className="bank-info-card card">
								<h2>My Blood Bank</h2>
								<div className="bank-details">
									<div className="detail">
										<span className="detail-label">Name</span>
										<span className="detail-value">{myBank.name}</span>
									</div>
									<div className="detail">
										<span className="detail-label">Address</span>
										<span className="detail-value">{myBank.address}</span>
									</div>
								</div>
							</div>

							{/* KPIs */}
							<div className="kpis-grid">
								<div className="kpi-card">
									<div className="kpi-icon" style={{background: 'rgba(244, 63, 94, 0.1)'}}>
										<span>🩸</span>
									</div>
									<div className="kpi-content">
										<p className="kpi-label">Available Units</p>
										<p className="kpi-value">{kpis.inv}</p>
									</div>
								</div>
								<div className="kpi-card">
									<div className="kpi-icon" style={{background: 'rgba(59, 130, 246, 0.1)'}}>
										<span>💪</span>
									</div>
									<div className="kpi-content">
										<p className="kpi-label">Donors</p>
										<p className="kpi-value">{kpis.donors}</p>
									</div>
								</div>
								<div className="kpi-card">
									<div className="kpi-icon" style={{background: 'rgba(16, 185, 129, 0.1)'}}>
										<span>🏥</span>
									</div>
									<div className="kpi-content">
										<p className="kpi-label">Patients</p>
										<p className="kpi-value">{kpis.patients}</p>
									</div>
								</div>
								<div className="kpi-card">
									<div className="kpi-icon" style={{background: 'rgba(245, 158, 11, 0.1)'}}>
										<span>⏳</span>
									</div>
									<div className="kpi-content">
										<p className="kpi-label">Pending Requests</p>
										<p className="kpi-value">{kpis.pend}</p>
									</div>
								</div>
							</div>

							{/* Inventory */}
							<div className="card">
								<h3>Blood Inventory</h3>
								<div className="inventory-grid">
									{groups.map(g => (
										<div key={g} className="inventory-item">
											<div className="inventory-label">{g}</div>
											<div className="inventory-value">{myBank.inventory?.[g] ?? 0}</div>
											<div className="inventory-unit">units</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Users Tab */}
					{activeTab === 'users' && (
						<div>
							{/* Add User Form */}
							<div className="card form-card">
								<h3>Add New Donor/Patient</h3>
								<div className="form-grid">
									<input
										placeholder="Name"
										value={name}
										onChange={e => setName(e.target.value)}
										className="form-input"
									/>
									<input
										placeholder="Email"
										type="email"
										value={email}
										onChange={e => setEmail(e.target.value)}
										className="form-input"
									/>
									<input
										placeholder="Password"
										type="password"
										value={password}
										onChange={e => setPassword(e.target.value)}
										className="form-input"
									/>
									<select
										value={role}
										onChange={e => setRole(e.target.value)}
										className="form-input"
									>
										<option value="donor">Donor</option>
										<option value="patient">Patient</option>
									</select>
									<select
										value={bloodGroup}
										onChange={e => setBloodGroup(e.target.value)}
										className="form-input"
									>
										{groups.map(g => <option key={g} value={g}>{g}</option>)}
									</select>
									<button onClick={addUser} className="form-submit-btn">Add User</button>
								</div>
							</div>

							{/* Users List */}
							<div className="card">
								<h3>Users Management</h3>
								<div className="search-box">
									<input
										placeholder="🔍 Search users..."
										value={userQuery}
										onChange={e => setUserQuery(e.target.value)}
										className="search-input"
									/>
								</div>
								<div className="table-wrapper">
									<table>
										<thead>
											<tr>
												<th>Name</th>
												<th>Email</th>
												<th>Role</th>
												<th>Blood Group</th>
												<th>Source</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{users
												.filter(u => {
													if (!userQuery.trim()) return true
													const q = userQuery.toLowerCase()
													return (u.name || '').toLowerCase().includes(q) ||
														(u.email || '').toLowerCase().includes(q) ||
														(u.role || '').toLowerCase().includes(q)
												})
												.map(u => (
												<tr key={u._id} className={u.createdBy ? 'added-by-bank' : ''}>
													<td className="cell-name">
														<div className="cell-content">
															<span className="cell-avatar">{u.name?.[0]?.toUpperCase()}</span>
															<span>{u.name}</span>
														</div>
													</td>
													<td>{u.email}</td>
													<td>
														<span className={`badge badge-${u.role === 'donor' ? 'info' : 'success'}`}>
															{u.role}
														</span>
													</td>
													<td>{u.bloodGroup}</td>
													<td>
														{u.createdBy ? (
															<span className="source-badge bank-added" title={`Added by: ${u.createdBy.name}`}>
																🏥 Bank Admin
															</span>
														) : (
															<span className="source-badge self-registered" title="Self-registered">
																👤 Self-registered
															</span>
														)}
													</td>
													<td>
														<button className="action-btn danger" onClick={() => delUser(u._id)}>Delete</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* Requests Tab */}
					{activeTab === 'requests' && (
						<div className="card">
							<h3>Pending Requests</h3>
							<div className="search-box">
								<input
									placeholder="🔍 Search requests..."
									value={reqQuery}
									onChange={e => setReqQuery(e.target.value)}
									className="search-input"
								/>
							</div>
							{pending.length === 0 ? (
								<div className="empty-state">
									<span className="empty-icon">📭</span>
									<p>No pending requests</p>
								</div>
							) : (
								<div className="table-wrapper">
									<table>
										<thead>
											<tr>
												<th>Type</th>
												<th>Blood Group</th>
												<th>Quantity</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{pending
												.filter(r => {
													if (!reqQuery.trim()) return true
													const q = reqQuery.toLowerCase()
													return r.type.toLowerCase().includes(q) || r.bloodGroup.toLowerCase().includes(q)
												})
												.map(r => (
												<tr key={r._id}>
													<td>
														<span className={`badge ${r.type === 'donation' ? 'badge-primary' : 'badge-warning'}`}>
															{r.type}
														</span>
													</td>
													<td>{r.bloodGroup}</td>
													<td>{r.quantity} ml</td>
													<td>
														<span className="badge badge-warning">{r.status}</span>
													</td>
													<td>
														<div className="action-buttons">
															<button className="action-btn success" onClick={() => approve(r._id)}>Approve</button>
															<button className="action-btn danger" onClick={() => reject(r._id)}>Reject</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
