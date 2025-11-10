import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear local storage and redirect to login
          localStorage.clear()
          window.location.href = '/'
          break
        case 403:
          // Forbidden
          console.error('Access denied:', data.message)
          break
        case 404:
          // Not found
          console.error('Resource not found:', data.message)
          break
        case 500:
          // Server error
          console.error('Server error:', data.message)
          break
        default:
          console.error('Request failed:', data.message)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request)
    } else {
      // Error in request configuration
      console.error('Request error:', error.message)
    }
    return Promise.reject(error)
  }
)

// API endpoints
const endpoints = {
  auth: {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data)
  },
  banks: {
    list: () => api.get('/banks'),
    create: (data) => api.post('/banks', data),
    update: (id, data) => api.put(`/banks/${id}`, data),
    delete: (id) => api.delete(`/banks/${id}`)
  },
  requests: {
    create: (data) => api.post('/requests', data),
    list: () => api.get('/requests'),
    update: (id, data) => api.put(`/requests/${id}`, data),
    delete: (id) => api.delete(`/requests/${id}`)
  }
}

export default endpoints