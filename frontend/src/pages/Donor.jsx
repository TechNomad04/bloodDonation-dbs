import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const groups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function Donor() {
	const { user, logout } = useAuth()
	const [banks, setBanks] = useState([])
	const [bankId, setBankId] = useState('')
	const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'A+')
	const [message, setMessage] = useState('')
	useEffect(() => { api.get('/banks').then(r => setBanks(r.data)) }, [])
	// Auto-refresh banks every 10s to keep list fresh
	useEffect(() => {
		const id = setInterval(() => {
			api.get('/banks').then(r => setBanks(r.data))
		}, 10000)
		return () => clearInterval(id)
	}, [])
	const submit = async () => {
		setMessage('')
		if (!bankId) return
		try {
			await api.post('/requests/donate', { bankId, bloodGroup })
			setMessage('Request submitted')
		} catch {
			setMessage('Failed')
		}
	}
	return (
		<div>
			<div className="card row" style={{ justifyContent: 'space-between' }}>
				<h1>Donor</h1>
				<button className="secondary" onClick={logout}>Logout</button>
			</div>
			<div className="card">
				<h2>Request To Donate</h2>
				<div className="row">
					<select value={bankId} onChange={e => setBankId(e.target.value)}>
						<option value="">Select Bank</option>
						{banks.map(b => <option key={b._id} value={b._id}>{b.name} — {b.address}</option>)}
					</select>
					<select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
						{groups.map(g => <option key={g} value={g}>{g}</option>)}
					</select>
					<button onClick={submit}>Submit</button>
				</div>
				{message && <div style={{ marginTop: 8 }}>{message}</div>}
			</div>
		</div>
	)
}


