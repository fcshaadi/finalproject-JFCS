import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Items endpoints (for users)
export const itemsAPI = {
  create: async (itemData) => {
    const formData = new FormData();
    formData.append('title', itemData.title);
    if (itemData.content) {
      formData.append('content', itemData.content);
    }
    if (itemData.file) {
      formData.append('file', itemData.file);
    }

    const response = await api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/items');
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/items/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  release: async (id) => {
    const response = await api.patch(`/items/${id}/release`);
    return response.data;
  },
};

// Beneficiary endpoints
export const beneficiaryAPI = {
  getItems: async () => {
    const response = await api.get('/beneficiary/items');
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/beneficiaries/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await api.patch('/beneficiaries/me', data);
    return response.data;
  },

  unlinkMyProfile: async () => {
    const response = await api.delete('/beneficiaries/me');
    return response.data;
  },
};

export default api;

