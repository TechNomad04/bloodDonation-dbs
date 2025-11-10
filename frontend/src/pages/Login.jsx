import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login({ onLogin }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isSignup, setIsSignup] = useState(false)
	const [name, setName] = useState('')
	const [role, setRole] = useState('donor')
	const [bloodGroup, setBloodGroup] = useState('A+')
	const navigate = useNavigate()
	const submit = async e => {
		e.preventDefault()
		setError('')
		try {
			const { data } = isSignup
				? await api.post('/auth/signup', { name, email, password, role, bloodGroup })
				: await api.post('/auth/login', { email, password })
			localStorage.setItem('token', data.token)
			localStorage.setItem('role', data.role)
			localStorage.setItem('name', data.name || '')
			localStorage.setItem('bank', data.bank || '')
			localStorage.setItem('bloodGroup', data.bloodGroup || '')
			onLogin({ role: data.role, name: data.name, bank: data.bank, bloodGroup: data.bloodGroup })
			if (data.role === 'superadmin') navigate('/superadmin')
			else if (data.role === 'admin') navigate('/admin')
			else if (data.role === 'donor') navigate('/donor')
			else navigate('/patient')
		} catch (err) {
			setError('Failed')
		}
	}
	return (
		<div className="card">
			<h1>{isSignup ? 'Sign Up' : 'Login'}</h1>
			<form onSubmit={submit}>
				{isSignup && (
					<div className="row" style={{ marginBottom: 8 }}>
						<input className="col" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
					</div>
				)}
				<div className="row">
					<input className="col" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
				</div>
				<div className="row" style={{ marginTop: 8 }}>
					<input className="col" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
				</div>
				{isSignup && (
					<div className="row" style={{ marginTop: 8 }}>
						<select className="col" value={role} onChange={e => setRole(e.target.value)}>
							<option value="donor">Donor</option>
							<option value="patient">Patient</option>
						</select>
						<select className="col" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
							{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
						</select>
					</div>
				)}
				<div className="row" style={{ marginTop: 12 }}>
					<button type="submit">{isSignup ? 'Create Account' : 'Login'}</button>
					<button className="secondary" type="button" onClick={() => setIsSignup(s => !s)}>{isSignup ? 'Have an account? Login' : 'New user? Sign Up'}</button>
				</div>
				{error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
			</form>
		</div>
	)
}


