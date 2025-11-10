import axios from 'axios'
const api = axios.create({ baseURL: 'http://localhost:5000' })
api.interceptors.request.use(c => {
	const token = localStorage.getItem('token')
	if (token) c.headers.Authorization = `Bearer ${token}`
	return c
})
export default api


