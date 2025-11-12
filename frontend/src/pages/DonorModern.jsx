import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard-modern.css'

export default function Donor() {
	const { user, logout } = useAuth()
	const [banks, setBanks] = useState([])
	const [donations, setDonations] = useState([])
	const [selectedBank, setSelectedBank] = useState('')
	const [selectedBlood, setSelectedBlood] = useState('A+')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [stats, setStats] = useState({ totalDonations: 0 })

	const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

	const loadData = async () => {
		try {
			const [banksRes, donationsRes] = await Promise.all([
				api.get('/banks'),
				api.get('/requests/donations')
			])
			setBanks(banksRes.data)
			setDonations(donationsRes.data.donations || [])
			setStats(donationsRes.data)
		} catch (err) {
			console.error('Error loading data:', err)
			setError('Failed to load data')
		}
	}

	useEffect(() => {
		loadData()
	}, [])

	const handleDonate = async (e) => {
		e.preventDefault()
		if (!selectedBank) {
			setError('Please select a bank')
			return
		}

		setLoading(true)
		setError('')
		setSuccess('')

		try {
			await api.post('/requests/donate', {
				bankId: selectedBank,
				bloodGroup: selectedBlood
			})
			setSuccess('✅ Donation request submitted successfully!')
			setSelectedBank('')
			setSelectedBlood('A+')
			setTimeout(() => loadData(), 1000)
		} catch (err) {
			const msg = err.response?.data?.message || 'Failed to submit donation'
			setError('❌ ' + msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="dashboard-container">
			{/* Header */}
			<div className="dashboard-header">
				<div className="header-content">
					<div className="header-brand">
						<div className="brand-icon">🩸</div>
						<div>
							<h1>Blood Donation</h1>
							<p className="header-subtitle">Make a difference, save lives</p>
						</div>
					</div>
					<div className="header-user">
						<div className="user-info">
							<p className="user-name">{user?.name || 'Donor'}</p>
							<p className="user-role">Blood Group: {user?.bloodGroup || 'N/A'}</p>
						</div>
						<button className="logout-btn" onClick={logout}>Logout</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="main-content">
				<div className="container">
					{/* Alerts */}
					{error && (
						<div className="alert alert-error">
							<span className="alert-icon">⚠️</span>
							<span>{error}</span>
						</div>
					)}
					{success && (
						<div className="alert alert-success">
							<span className="alert-icon">✓</span>
							<span>{success}</span>
						</div>
					)}

					{/* Stats */}
					<div className="kpis-grid">
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#fef2f2', color: '#e11d48' }}>
								🩸
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Total Donations</p>
								<p className="kpi-value">{stats.totalDonations}</p>
							</div>
						</div>
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
								❤️
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Blood Group</p>
								<p className="kpi-value">{user?.bloodGroup || 'N/A'}</p>
							</div>
						</div>
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
								🏥
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Banks</p>
								<p className="kpi-value">{banks.length}</p>
							</div>
						</div>
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
								✨
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Impact</p>
								<p className="kpi-value">{stats.totalDonations * 1}</p>
							</div>
						</div>
					</div>

					{/* Donation Form */}
					<div className="card form-card">
						<h2>💉 Submit Donation</h2>
						<form onSubmit={handleDonate} className="form-grid">
							<select
								value={selectedBank}
								onChange={(e) => setSelectedBank(e.target.value)}
								className="form-input"
								required
							>
								<option value="">Select Blood Bank</option>
								{banks.map(b => (
									<option key={b._id} value={b._id}>
										{b.name} - {b.address}
									</option>
								))}
							</select>

							<select
								value={selectedBlood}
								onChange={(e) => setSelectedBlood(e.target.value)}
								className="form-input"
							>
								{bloodGroups.map(bg => (
									<option key={bg} value={bg}>{bg}</option>
								))}
							</select>

							<button
								type="submit"
								disabled={loading}
								className="form-submit-btn"
								style={{ gridColumn: 'span 1' }}
							>
								{loading ? '⏳ Submitting...' : '✅ Submit Donation'}
							</button>
						</form>
					</div>

					{/* Donation History */}
					<div className="card">
						<h2>📋 Donation History</h2>
						{donations.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">🩹</div>
								<p>No donations yet. Start by submitting your first donation!</p>
							</div>
						) : (
							<div className="table-wrapper">
								<table>
									<thead>
										<tr>
											<th>Blood Group</th>
											<th>Bank</th>
											<th>Location</th>
											<th>Date</th>
										</tr>
									</thead>
									<tbody>
										{donations.map(donation => (
											<tr key={donation.id}>
												<td className="cell-content">
													<span className="badge badge-primary">{donation.bloodGroup}</span>
												</td>
												<td className="cell-name">{donation.bank?.name || 'N/A'}</td>
												<td>{donation.bank?.address || 'N/A'}</td>
												<td>{new Date(donation.date).toLocaleDateString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
