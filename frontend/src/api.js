import axios from 'axios'
const api = axios.create({ baseURL: 'http://localhost:5000' })
api.interceptors.request.use(c => {
	const token = localStorage.getItem('token')
	if (token) c.headers.Authorization = `Bearer ${token}`
	return c
})
api.interceptors.response.use(
	response => response,
	error => {
		// Always reject so the calling code can handle it
		return Promise.reject(error)
	}
)
export default api


