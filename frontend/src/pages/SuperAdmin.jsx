import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function SuperAdmin() {
	const { user, logout } = useAuth()
	const [banks, setBanks] = useState([])
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [adminEmail, setAdminEmail] = useState('')
	const [adminPassword, setAdminPassword] = useState('')
	const load = async () => {
		const { data } = await api.get('/banks')
		setBanks(data)
	}
	useEffect(() => { load() }, [])
	const add = async () => {
		if (!name || !address || !adminEmail || !adminPassword) return
		await api.post('/banks', { name, address, adminEmail, adminPassword })
		setName('')
		setAddress('')
		setAdminEmail('')
		setAdminPassword('')
		load()
	}
	const del = async id => {
		await api.delete('/banks/' + id)
		load()
	}
	return (
		<div>
			<div className="card row" style={{ justifyContent: 'space-between' }}>
				<h1>Super Admin</h1>
				<button className="secondary" onClick={logout}>Logout</button>
			</div>
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
			<div className="card">
				<h2>Blood Banks</h2>
				<table>
					<thead><tr><th>Name</th><th>Address</th><th>Actions</th></tr></thead>
					<tbody>
						{banks.map(b => (
							<tr key={b._id}>
								<td>{b.name}</td>
								<td>{b.address}</td>
								<td className="actions">
									<button className="secondary" onClick={() => del(b._id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}


