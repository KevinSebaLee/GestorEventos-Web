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

api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('With method:', config.method);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
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
  update: (id, eventData) => {
    console.log('API sending update with eventData:', eventData);

    const processedData = {
      ...eventData,
      enabled_for_enrollment: eventData.enabled_for_enrollment === true || 
      eventData.enabled_for_enrollment === 1 ? 1 : 0
    };
    return api.put(`/event/${id}`, processedData);
  },  delete: (id) => api.delete(`/event/${id}`),
  getAllEnrollments: (id) => api.get(`/event/${id}/enrollments`), 
  enroll: (id, enrollmentData = {}) => {
    const normalizedData = {
      description: enrollmentData.description || 'Inscripción al evento desde la aplicación',
      attended: typeof enrollmentData.attended === 'boolean' 
        ? (enrollmentData.attended ? 1 : 0)
        : (Number(enrollmentData.attended) || 0),
      observations: enrollmentData.observations || 'Sin observaciones',
      rating: Number(enrollmentData.rating) || 5
    };
    
    console.log('Normalized enrollment data:', normalizedData);
    return api.post(`/event/${id}/enrollment`, normalizedData);
  },
  
  unenroll: (id) => api.delete(`/event/${id}/enrollment`),
};

export const eventLocationsAPI = {
  getAll: () => api.get('/event-location'),
  getById: (id) => api.get(`/event-location/${id}`),
  create: (locationData) => api.post('/event-location', locationData),
};

export const eventCategoriesAPI = {
  getAll: () => api.get('/event-category'),
  getById: (id) => api.get(`/event-category/${id}`),
};

export default api;
