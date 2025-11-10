import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

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
	const addUser = async () => {
		if (!name || !email || !password) return
		await api.post('/admin/users', { name, email, password, role, bloodGroup })
		setName(''); setEmail(''); setPassword('')
		load()
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
	return (
		<div>
			<div className="card row" style={{ justifyContent: 'space-between' }}>
				<h1>Bank Admin</h1>
				<button className="secondary" onClick={logout}>Logout</button>
			</div>
			<div className="card">
				<h2>My Bank</h2>
				<div>{myBank.name} — {myBank.address}</div>
				<div style={{ marginTop: 8 }}>
					<table>
						<thead><tr>{groups.map(g => <th key={g}>{g}</th>)}</tr></thead>
						<tbody><tr>{groups.map(g => <td key={g}>{myBank.inventory?.[g] ?? 0}</td>)}</tr></tbody>
					</table>
				</div>
			</div>
			<div className="card">
				<h2>Add Donor/Patient</h2>
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
			<div className="card">
				<h2>Users</h2>
				<table>
					<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Group</th><th>Active</th><th>Actions</th></tr></thead>
					<tbody>
						{users.map(u => (
							<tr key={u._id}>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
								<td>{u.bloodGroup}</td>
								<td>{String(u.active)}</td>
								<td className="actions">
									<button className="secondary" onClick={() => delUser(u._id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="card">
				<h2>Pending Requests</h2>
				<table>
					<thead><tr><th>Type</th><th>Group</th><th>Actions</th></tr></thead>
					<tbody>
						{pending.map(r => (
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
		</div>
	)
}


