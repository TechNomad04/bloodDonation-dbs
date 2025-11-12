import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import '../styles/dashboard-modern.css'

export default function Patient() {
	const { user, logout } = useAuth()
	const [banks, setBanks] = useState([])
	const [requests, setRequests] = useState([])
	const [selectedBank, setSelectedBank] = useState('')
	const [selectedBlood, setSelectedBlood] = useState('A+')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [stats, setStats] = useState({ totalRequests: 0, pending: 0, approved: 0, rejected: 0 })

	const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

	const loadData = async () => {
		try {
			const [banksRes, requestsRes] = await Promise.all([
				api.get('/banks'),
				api.get('/requests/blood-requests')
			])
			setBanks(banksRes.data)
			setRequests(requestsRes.data.requests || [])
			setStats(requestsRes.data)
		} catch (err) {
			console.error('Error loading data:', err)
			setError('Failed to load data')
		}
	}

	useEffect(() => {
		loadData()
	}, [])

	const handleRequest = async (e) => {
		e.preventDefault()
		if (!selectedBank) {
			setError('Please select a bank')
			return
		}

		setLoading(true)
		setError('')
		setSuccess('')

		try {
			await api.post('/requests/receive', {
				bankId: selectedBank,
				bloodGroup: selectedBlood
			})
			setSuccess('✅ Blood request submitted successfully!')
			setSelectedBank('')
			setSelectedBlood('A+')
			setTimeout(() => loadData(), 1000)
		} catch (err) {
			const msg = err.response?.data?.message || 'Failed to submit request'
			setError('❌ ' + msg)
		} finally {
			setLoading(false)
		}
	}

	const getStatusColor = (status) => {
		switch(status) {
			case 'approved': return '#10b981'
			case 'pending': return '#f59e0b'
			case 'rejected': return '#ef4444'
			default: return '#6b7280'
		}
	}

	const getStatusIcon = (status) => {
		switch(status) {
			case 'approved': return '✅'
			case 'pending': return '⏳'
			case 'rejected': return '❌'
			default: return '❓'
		}
	}

	return (
		<div className="dashboard-container">
			{/* Header */}
			<div className="dashboard-header">
				<div className="header-content">
					<div className="header-brand">
						<div className="brand-icon">🏥</div>
						<div>
							<h1>Blood Request</h1>
							<p className="header-subtitle">Get the blood you need when you need it</p>
						</div>
					</div>
					<div className="header-user">
						<div className="user-info">
							<p className="user-name">{user?.name || 'Patient'}</p>
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
								📋
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Total Requests</p>
								<p className="kpi-value">{stats.totalRequests}</p>
							</div>
						</div>
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
								✅
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Approved</p>
								<p className="kpi-value">{stats.approved}</p>
							</div>
						</div>
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
								⏳
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Pending</p>
								<p className="kpi-value">{stats.pending}</p>
							</div>
						</div>
						<div className="kpi-card">
							<div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
								❌
							</div>
							<div className="kpi-content">
								<p className="kpi-label">Rejected</p>
								<p className="kpi-value">{stats.rejected}</p>
							</div>
						</div>
					</div>

					{/* Request Form */}
					<div className="card form-card">
						<h2>🩸 Request Blood</h2>
						<form onSubmit={handleRequest} className="form-grid">
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
								{loading ? '⏳ Submitting...' : '📤 Submit Request'}
							</button>
						</form>
					</div>

					{/* Request History */}
					<div className="card">
						<h2>📜 Request History</h2>
						{requests.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">🩺</div>
								<p>No requests yet. Submit your first blood request above!</p>
							</div>
						) : (
							<div className="table-wrapper">
								<table>
									<thead>
										<tr>
											<th>Blood Group</th>
											<th>Bank</th>
											<th>Status</th>
											<th>Request Date</th>
											<th>Updated</th>
										</tr>
									</thead>
									<tbody>
										{requests.map(request => (
											<tr key={request.id}>
												<td className="cell-content">
													<span className="badge badge-primary">{request.bloodGroup}</span>
												</td>
												<td className="cell-name">{request.bank?.name || 'N/A'}</td>
												<td>
													<span 
														className="badge"
														style={{ 
															backgroundColor: getStatusColor(request.status) + '20',
															color: getStatusColor(request.status)
														}}
													>
														{getStatusIcon(request.status)} {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
													</span>
												</td>
												<td>{new Date(request.requestDate).toLocaleDateString()}</td>
												<td>{new Date(request.updatedDate).toLocaleDateString()}</td>
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
