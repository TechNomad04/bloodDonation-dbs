import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../realtime'

export default function SuperAdmin() {
	const { user, logout } = useAuth()
	const [banks, setBanks] = useState([])
	const [open, setOpen] = useState({})
	const [details, setDetails] = useState({})
	const [users, setUsers] = useState([])
	const [stats, setStats] = useState({ totalBanks: 0, totalAdmins: 0, totalDonors: 0, totalPatients: 0, inventory: {}, donorsByGroup: {} })
	const [activeTab, setActiveTab] = useState('overview') // overview | banks | users | requests
	const [bankQuery, setBankQuery] = useState('')
	const [userQuery, setUserQuery] = useState('')
	const [requests, setRequests] = useState([])
	const [reqFilters, setReqFilters] = useState({ status: 'pending', type: '', bankId: '', group: '', q: '' })
	const [lowStockThreshold, setLowStockThreshold] = useState(2)
	const [slaHours, setSlaHours] = useState(24)
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [adminEmail, setAdminEmail] = useState('')
	const [adminPassword, setAdminPassword] = useState('')
	const load = async () => {
		const { data } = await api.get('/banks')
		setBanks(data)
	}
	const loadUsers = async () => {
		const { data } = await api.get('/superadmin/users')
		setUsers(data)
	}
	const loadRequests = async () => {
		const params = new URLSearchParams()
		if (reqFilters.status) params.append('status', reqFilters.status)
		if (reqFilters.type) params.append('type', reqFilters.type)
		if (reqFilters.bankId) params.append('bankId', reqFilters.bankId)
		if (reqFilters.group) params.append('group', reqFilters.group)
		const { data } = await api.get('/superadmin/requests' + (params.toString() ? `?${params.toString()}` : ''))
		setRequests(data)
	}
	useEffect(() => { load(); loadUsers(); loadRequests() }, [])
	// Auto-refresh banks and users every 10s
	useEffect(() => {
		const id = setInterval(() => {
			load()
			loadUsers()
		}, 10000)
		return () => clearInterval(id)
	}, [])
	// Realtime updates
	useEffect(() => {
		const s = getSocket()
		const onBanks = () => load()
		const onUsers = () => loadUsers()
		const onBankDetails = ({ bankId }) => { if (open[bankId]) loadDetails(bankId) }
		const onRequests = () => loadRequests()
		s.on('banks:changed', onBanks)
		s.on('superadmin:users:changed', onUsers)
		s.on('bank:details:changed', onBankDetails)
		s.on('requests:changed', onRequests)
		return () => {
			s.off('banks:changed', onBanks)
			s.off('superadmin:users:changed', onUsers)
			s.off('bank:details:changed', onBankDetails)
			s.off('requests:changed', onRequests)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])
	useEffect(() => {
		// Recompute overview stats whenever banks or users change
		const totalBanks = banks.length
		const totalAdmins = users.filter(u => u.role === 'admin').length
		const totalDonors = users.filter(u => u.role === 'donor').length
		const totalPatients = users.filter(u => u.role === 'patient').length
		const groups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
		const inventory = groups.reduce((acc, g) => ({ ...acc, [g]: 0 }), {})
		const donorsByGroup = groups.reduce((acc, g) => ({ ...acc, [g]: 0 }), {})
		for (const b of banks) {
			for (const g of Object.keys(inventory)) {
				inventory[g] += (b.inventory?.[g] ?? 0)
			}
		}
		for (const u of users) {
			if (u.role === 'donor' && u.bloodGroup && donorsByGroup[u.bloodGroup] !== undefined) {
				donorsByGroup[u.bloodGroup] += 1
			}
		}
		setStats({ totalBanks, totalAdmins, totalDonors, totalPatients, inventory, donorsByGroup })
	}, [banks, users])

	// Auto-refresh details for open banks every 5s
	useEffect(() => {
		const intervalId = setInterval(() => {
			const openIds = Object.keys(open).filter(k => open[k])
			openIds.forEach(id => { loadDetails(id) })
		}, 5000)
		return () => clearInterval(intervalId)
	}, [open])
	const add = async () => {
		if (!name || !address || !adminEmail || !adminPassword) return
		await api.post('/banks', { name, address, adminEmail, adminPassword })
		setName('')
		setAddress('')
		setAdminEmail('')
		setAdminPassword('')
		load()
		loadUsers()
	}
	const del = async id => {
		await api.delete('/banks/' + id)
		load()
		loadUsers()
	}
	const loadDetails = async (id) => {
		try {
			const { data } = await api.get(`/superadmin/banks/${id}/details`)
			setDetails(prev => ({ ...prev, [id]: data }))
		} catch (e) {
			console.error('Failed to load bank details', e)
		}
	}
	const toggle = async (id) => {
		const next = !open[id]
		setOpen(prev => ({ ...prev, [id]: next }))
		if (next) await loadDetails(id)
	}
	return (
		<div>
			<div className="card row" style={{ justifyContent: 'space-between' }}>
				<h1>Super Admin</h1>
				<button className="secondary" onClick={logout}>Logout</button>
			</div>
			<div className="card row" style={{ gap: 8 }}>
				<button className={activeTab === 'overview' ? '' : 'secondary'} onClick={() => setActiveTab('overview')}>Overview</button>
				<button className={activeTab === 'banks' ? '' : 'secondary'} onClick={() => setActiveTab('banks')}>Banks</button>
				<button className={activeTab === 'users' ? '' : 'secondary'} onClick={() => setActiveTab('users')}>All Users</button>
				<button className={activeTab === 'requests' ? '' : 'secondary'} onClick={() => setActiveTab('requests')}>Requests</button>
			</div>
			{activeTab === 'overview' && (
			<div className="card">
				<h2>Overview</h2>
				<div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
					<div style={{ flex: 1 }}>
						<table>
							<thead><tr><th>Metric</th><th>Count</th></tr></thead>
							<tbody>
								<tr><td>Total Banks</td><td>{stats.totalBanks}</td></tr>
								<tr><td>Admins</td><td>{stats.totalAdmins}</td></tr>
								<tr><td>Donors</td><td>{stats.totalDonors}</td></tr>
								<tr><td>Patients</td><td>{stats.totalPatients}</td></tr>
							</tbody>
						</table>
					</div>
					<div style={{ flex: 1 }}>
						<h3>Available Blood (All Banks)</h3>
						<table>
							<thead><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <th key={g}>{g}</th>)}</tr></thead>
							<tbody><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <td key={g}>{stats.inventory[g] ?? 0}</td>)}</tr></tbody>
						</table>
					</div>
					<div style={{ flex: 1 }}>
						<h3>Donors by Blood Group (All Banks)</h3>
						<table>
							<thead><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <th key={g}>{g}</th>)}</tr></thead>
							<tbody><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <td key={g}>{stats.donorsByGroup[g] ?? 0}</td>)}</tr></tbody>
						</table>
					</div>
				</div>
			</div>
			)}
			{activeTab === 'banks' && (
			<div className="card">
				<h2>Add Blood Bank</h2>
				<div className="row">
					<input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
					<input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
					<input placeholder="Admin Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
					<input placeholder="Admin Password" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
					<button onClick={add}>Add</button>
				</div>
			</div>
			)}
			{activeTab === 'banks' && (
			<div className="card">
				<h2>Blood Banks</h2>
				<div className="row" style={{ marginBottom: 8 }}>
					<input placeholder="Search banks..." value={bankQuery} onChange={e => setBankQuery(e.target.value)} />
					<div className="row" style={{ alignItems: 'center', gap: 8 }}>
						<label>Low-stock threshold per group</label>
						<input type="number" min="0" value={lowStockThreshold} onChange={e => setLowStockThreshold(parseInt(e.target.value || '0', 10))} style={{ width: 80 }} />
					</div>
				</div>
				<table>
					<thead><tr><th>Name</th><th>Address</th><th>Inventory</th><th>Admins</th><th>Users</th><th>Pending</th><th>Actions</th></tr></thead>
					<tbody>
						{banks
							.filter(b => {
								if (!bankQuery.trim()) return true
								const q = bankQuery.toLowerCase()
								return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
							})
							.map(b => {
							const d = details[b._id] || {}
							const inv = d.bank?.inventory || b.inventory || {}
							return (
								<React.Fragment key={b._id}>
									<tr>
										<td>{b.name}</td>
										<td>{b.address}</td>
										<td>
											<button className="secondary" onClick={() => toggle(b._id)}>
												{open[b._id] ? 'Hide' : 'View'}
											</button>
											<div style={{ marginTop: 6, fontSize: 12 }}>
												{['A+','A-','B+','B-','AB+','AB-','O+','O-']
													.filter(g => (inv?.[g] ?? 0) <= lowStockThreshold)
													.slice(0, 4)
													.map(g => <span key={g} style={{ color: '#b22222', marginRight: 6 }}>{g}:{inv?.[g] ?? 0}</span>)}
												{(['A+','A-','B+','B-','AB+','AB-','O+','O-'].filter(g => (inv?.[g] ?? 0) <= lowStockThreshold).length === 0) && (
													<span style={{ color: '#2e7d32' }}>All groups healthy</span>
												)}
											</div>
										</td>
										<td>{d.admins?.length ?? 0}</td>
										<td>{d.users?.length ?? 0}</td>
										<td>{d.pending?.length ?? 0}</td>
										<td className="actions">
											<button className="secondary" onClick={() => del(b._id)}>Delete</button>
										</td>
									</tr>
									{open[b._id] && (
										<tr>
											<td colSpan="7">
												<div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
													<div style={{ flex: 1 }}>
														<h3>Inventory</h3>
														<button className="secondary" onClick={() => loadDetails(b._id)} style={{ marginBottom: 8 }}>Refresh</button>
														<table>
															<thead><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <th key={g}>{g}</th>)}</tr></thead>
															<tbody><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <td key={g}>{inv?.[g] ?? 0}</td>)}</tr></tbody>
														</table>
													</div>
													<div style={{ flex: 1 }}>
														<h3>Admins</h3>
														<table>
															<thead><tr><th>Name</th><th>Email</th></tr></thead>
															<tbody>
																{d.admins?.length
																	? d.admins.map(a => (
																		<tr key={a._id}><td>{a.name}</td><td>{a.email}</td></tr>
																	))
																	: <tr><td colSpan="2">—</td></tr>}
															</tbody>
														</table>
													</div>
												</div>
												<div className="row" style={{ alignItems: 'flex-start', gap: 16, marginTop: 16 }}>
													<div style={{ flex: 1 }}>
														<h3>Users (Donors/Patients)</h3>
														<table>
															<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Group</th><th>Active</th></tr></thead>
															<tbody>
																{d.users?.length
																	? d.users.map(u => (
																		<tr key={u._id}>
																			<td>{u.name}</td>
																			<td>{u.email}</td>
																			<td>{u.role}</td>
																			<td>{u.bloodGroup}</td>
																			<td>{String(u.active)}</td>
																		</tr>
																	))
																	: <tr><td colSpan="5">—</td></tr>}
															</tbody>
														</table>
													</div>
													<div style={{ flex: 1 }}>
														<h3>Pending Requests</h3>
														<table>
															<thead><tr><th>Type</th><th>Group</th><th>Requested By</th><th>Created</th></tr></thead>
															<tbody>
																{d.pending?.length
																	? d.pending.map(r => {
																		const rb = r.requestedBy
																		const rbText = typeof rb === 'object' && rb ? `${rb.name} (${rb.email})` : String(rb)
																		return (
																			<tr key={r._id}>
																				<td>{r.type}</td>
																				<td>{r.bloodGroup}</td>
																				<td>{rbText}</td>
																				<td>{new Date(r.createdAt).toLocaleString()}</td>
																			</tr>
																		)
																	})
																	: <tr><td colSpan="4">—</td></tr>}
															</tbody>
														</table>
														<div style={{ marginTop: 16 }}>
															<h3>Donors by Blood Group (This Bank)</h3>
															<table>
																<thead><tr>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <th key={g}>{g}</th>)}</tr></thead>
																<tbody>
																	<tr>
																		{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => {
																			const donorCount = (d.users || []).filter(u => u.role === 'donor' && u.bloodGroup === g).length
																			return <td key={g}>{donorCount}</td>
																		})}
																	</tr>
																</tbody>
															</table>
														</div>
													</div>
												</div>
											</td>
										</tr>
									)}
								</React.Fragment>
							)
						})}
					</tbody>
				</table>
			</div>
			)}
			{activeTab === 'users' && (
			<div className="card" style={{ marginTop: 16 }}>
				<h2>All Users</h2>
				<div className="row" style={{ marginBottom: 8 }}>
					<input placeholder="Search users..." value={userQuery} onChange={e => setUserQuery(e.target.value)} />
				</div>
				<table>
					<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Group</th><th>Active</th><th>Bank</th><th>Address</th></tr></thead>
					<tbody>
						{users
							.filter(u => {
								if (!userQuery.trim()) return true
								const q = userQuery.toLowerCase()
								return (
									(u.name || '').toLowerCase().includes(q) ||
									(u.email || '').toLowerCase().includes(q) ||
									(u.role || '').toLowerCase().includes(q) ||
									(u.bank?.name || '').toLowerCase().includes(q)
								)
							})
							.map(u => (
							<tr key={u._id}>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
								<td>{u.bloodGroup || '-'}</td>
								<td>{String(u.active)}</td>
								<td>{u.bank?.name || '-'}</td>
								<td>{u.bank?.address || '-'}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			)}
			{activeTab === 'requests' && (
			<div className="card" style={{ marginTop: 16 }}>
				<h2>Requests</h2>
				<div className="row" style={{ gap: 8, marginBottom: 8 }}>
					<select value={reqFilters.status} onChange={e => setReqFilters({ ...reqFilters, status: e.target.value })}>
						<option value="">All Status</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
					</select>
					<select value={reqFilters.type} onChange={e => setReqFilters({ ...reqFilters, type: e.target.value })}>
						<option value="">All Types</option>
						<option value="donation">Donation</option>
						<option value="receive">Receive</option>
					</select>
					<select value={reqFilters.group} onChange={e => setReqFilters({ ...reqFilters, group: e.target.value })}>
						<option value="">All Groups</option>
						{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
					</select>
					<select value={reqFilters.bankId} onChange={e => setReqFilters({ ...reqFilters, bankId: e.target.value })}>
						<option value="">All Banks</option>
						{banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
					</select>
					<div className="row" style={{ alignItems: 'center', gap: 8 }}>
						<label>SLA (hrs)</label>
						<input type="number" min="1" value={slaHours} onChange={e => setSlaHours(parseInt(e.target.value || '1', 10))} style={{ width: 80 }} />
					</div>
					<button onClick={loadRequests}>Apply</button>
				</div>
				<table>
					<thead><tr><th>Type</th><th>Group</th><th>Status</th><th>Bank</th><th>Requested By</th><th>Created</th></tr></thead>
					<tbody>
						{requests.map(r => {
							const who = typeof r.requestedBy === 'object' && r.requestedBy ? `${r.requestedBy.name} (${r.requestedBy.email})` : String(r.requestedBy)
							const ageHrs = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 3600000)
							const overdue = r.status === 'pending' && ageHrs >= slaHours
							return (
								<tr key={r._id} style={overdue ? { background: '#fff3f3' } : undefined}>
									<td>{r.type}</td>
									<td>{r.bloodGroup}</td>
									<td>{r.status}</td>
									<td>{r.bank?.name}</td>
									<td>{who}</td>
									<td>{new Date(r.createdAt).toLocaleString()} {overdue && <span style={{ color: '#b22222', marginLeft: 6 }}>(Over SLA)</span>}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
			)}
		</div>
	)
}


