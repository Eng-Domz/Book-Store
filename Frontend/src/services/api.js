import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Books API
export const booksAPI = {
  search: (params) => api.get('/books/search', { params }),
  getByISBN: (isbn) => api.get(`/books/${isbn}`),
  getAll: () => api.get('/books'),
  add: (data) => api.post('/books', data),
  update: (isbn, data) => api.put(`/books/${isbn}`, data),
};

// Cart API
export const cartAPI = {
  add: (data) => api.post('/cart', data),
  view: () => api.get('/cart'),
  remove: (isbn) => api.delete(`/cart/${isbn}`),
  updateQuantity: (isbn, quantity) => api.put(`/cart/${isbn}`, { quantity }),
};

// Orders API
export const ordersAPI = {
  checkout: (data) => api.post('/orders/checkout', data),
  getPastOrders: () => api.get('/orders/my-orders'),
  getAllBookOrders: () => api.get('/orders/book-orders'),
  confirmOrder: (orderId) => api.put(`/orders/book-orders/${orderId}/confirm`),
  createManualOrder: (data) => api.post('/orders/book-orders/manual', data),
  getBooksForOrdering: () => api.get('/orders/books-for-ordering'),
  getSalesLastMonth: () => api.get('/orders/reports/sales/last-month'),
  getSalesByDate: (date) => api.get('/orders/reports/sales/by-date', { params: { date } }),
  getTopCustomers: () => api.get('/orders/reports/top-customers'),
  getTopBooks: () => api.get('/orders/reports/top-books'),
  getBookOrderCount: (isbn) => api.get(`/orders/reports/book-orders/${isbn}`),
};

export default api;

