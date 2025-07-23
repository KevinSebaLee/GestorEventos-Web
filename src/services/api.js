import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('=== API ERROR ===');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Full error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/user/login', credentials),
  register: (userData) => api.post('/user/register', userData),
  logout: () => api.post('/user/logout'),
};

export const eventsAPI = {
  getAll: () => api.get('/event'),
  getAvailable: () => api.get('/event').then(res => {
    const now = new Date();
    const events = Array.isArray(res.data) ? res.data : [res.data];
    const availableEvents = events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate > now;
    });
    return { ...res, data: availableEvents };
  }),
  getById: (id) => api.get(`/event/${id}`),
  create: (eventData) => api.post('/event', eventData),
  update: (id, eventData) => api.put(`/event/${id}`, eventData),
  delete: (id) => api.delete(`/event/${id}`),
  getAllEnrollments: (id) => api.get(`/event/${id}/enrollments`), 
  enroll: (id, enrollmentData = {}) => api.post(`/event/${id}/enrollment`, {
    description: enrollmentData.description || 'Inscripción al evento desde la aplicación',
    attended: enrollmentData.attended !== undefined ? enrollmentData.attended : true,
    observations: enrollmentData.observations || 'Sin observaciones adicionales',
    rating: enrollmentData.rating !== null ? enrollmentData.rating : 1
  }),
  unenroll: (id) => api.delete(`/event/${id}/enrollment`),
  getEnrollments: (id) => api.get(`/event/${id}/enrollment`).catch(error => {
    console.warn('Enrollment status endpoint failed, will try alternative:', error.response?.status);
    if (error.response?.status === 404) {
      return api.get(`/event/${id}/enrollments`).catch(altError => {
        console.warn('Alternative enrollments endpoint also failed:', altError.response?.status);
        return { data: { enrolled: false } };
      });
    }
    throw error;
  }),
};

export const eventLocationsAPI = {
  getAll: () => api.get('/event-location'),
  getById: (id) => api.get(`/event-location/${id}`),
};

export const eventCategoriesAPI = {
  getAll: () => api.get('/event-category'),
  getById: (id) => api.get(`/event-category/${id}`),
};

export default api;
