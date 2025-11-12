import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../realtime'

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
	// Auto-refresh every 5s
	useEffect(() => {
		const id = setInterval(() => { load() }, 5000)
		return () => clearInterval(id)
	}, [])
	// Realtime updates
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
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
		await api.delete('/admin/users/' + id)
		load()
	}
	const approve = async id => {
		await api.post('/requests/' + id + '/approve')
		load()
	}
	const reject = async id => {
		await api.post('/requests/' + id + '/reject')
		load()
	}
	const kpis = useMemo(() => {
		const inv = groups.reduce((acc, g) => acc + (myBank.inventory?.[g] ?? 0), 0)
		const donors = users.filter(u => u.role === 'donor').length
		const patients = users.filter(u => u.role === 'patient').length
		const pend = pending.length
		return { inv, donors, patients, pend }
	}, [myBank, users, pending])
	return (
		<div>
			<div className="card row" style={{ justifyContent: 'space-between' }}>
				<h1>Bank Admin</h1>
				<button className="secondary" onClick={logout}>Logout</button>
			</div>
			<div className="card row" style={{ gap: 8 }}>
				<button className={activeTab === 'dashboard' ? '' : 'secondary'} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
				<button className={activeTab === 'users' ? '' : 'secondary'} onClick={() => setActiveTab('users')}>Users</button>
				<button className={activeTab === 'requests' ? '' : 'secondary'} onClick={() => setActiveTab('requests')}>Requests</button>
			</div>
			{activeTab === 'dashboard' && (
			<div className="card">
				<h2>My Bank</h2>
				<div>{myBank.name} — {myBank.address}</div>
				<div className="row" style={{ marginTop: 8, gap: 16 }}>
					<div className="card" style={{ flex: 1 }}>
						<h3>KPIs</h3>
						<table>
							<thead><tr><th>Metric</th><th>Count</th></tr></thead>
							<tbody>
								<tr><td>Available Units</td><td>{kpis.inv}</td></tr>
								<tr><td>Donors</td><td>{kpis.donors}</td></tr>
								<tr><td>Patients</td><td>{kpis.patients}</td></tr>
								<tr><td>Pending Requests</td><td>{kpis.pend}</td></tr>
							</tbody>
						</table>
					</div>
					<div className="card" style={{ flex: 2 }}>
						<h3>Inventory</h3>
						<table>
							<thead><tr>{groups.map(g => <th key={g}>{g}</th>)}</tr></thead>
							<tbody><tr>{groups.map(g => <td key={g}>{myBank.inventory?.[g] ?? 0}</td>)}</tr></tbody>
						</table>
					</div>
				</div>
			</div>
			)}
			{activeTab === 'users' && (
			<div className="card">
				<h2>Add Donor/Patient</h2>
				{error && <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#ffcccc', color: '#cc0000', borderRadius: '4px' }}>{error}</div>}
				{success && <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#ccffcc', color: '#00cc00', borderRadius: '4px' }}>{success}</div>}
				<div className="row">
					<input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
					<input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
					<input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
					<select value={role} onChange={e => setRole(e.target.value)}>
						<option value="donor">Donor</option>
						<option value="patient">Patient</option>
					</select>
					<select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
						{groups.map(g => <option key={g} value={g}>{g}</option>)}
					</select>
					<button onClick={addUser}>Add</button>
				</div>
			</div>
			)}
			{activeTab === 'users' && (
			<div className="card">
				<h2>Users</h2>
				<div className="row" style={{ marginBottom: 8 }}>
					<input placeholder="Search users..." value={userQuery} onChange={e => setUserQuery(e.target.value)} />
				</div>
				<table>
					<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Group</th><th>Active</th><th>Created By</th><th>Actions</th></tr></thead>
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
							<tr key={u._id} style={{ backgroundColor: u.createdBy ? '#f0f8ff' : 'transparent' }}>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
								<td>{u.bloodGroup}</td>
								<td>{String(u.active)}</td>
								<td style={{ fontSize: '0.9em', color: u.createdBy ? '#0066cc' : '#999' }}>
									{u.createdBy ? (
										<span title={`Added by: ${u.createdBy.name}`}>
											🏥 Bank Admin
										</span>
									) : (
										<span title="Self-registered">
											👤 Self-registered
										</span>
									)}
								</td>
								<td className="actions">
									<button className="secondary" onClick={() => delUser(u._id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			)}
			{activeTab === 'requests' && (
			<div className="card">
				<h2>Pending Requests</h2>
				<div className="row" style={{ marginBottom: 8 }}>
					<input placeholder="Search requests..." value={reqQuery} onChange={e => setReqQuery(e.target.value)} />
				</div>
				<table>
					<thead><tr><th>Type</th><th>Group</th><th>Actions</th></tr></thead>
					<tbody>
						{pending
							.filter(r => {
								if (!reqQuery.trim()) return true
								const q = reqQuery.toLowerCase()
								return r.type.toLowerCase().includes(q) || r.bloodGroup.toLowerCase().includes(q)
							})
							.map(r => (
							<tr key={r._id}>
								<td>{r.type}</td>
								<td>{r.bloodGroup}</td>
								<td className="actions">
									<button onClick={() => approve(r._id)}>Approve</button>
									<button className="secondary" onClick={() => reject(r._id)}>Reject</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			)}
		</div>
	)
}


