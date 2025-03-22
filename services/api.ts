import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Configure axios
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  register: async (userData: { username: string; email: string; password: string }) => {
    try {
      console.log('Sending registration request to:', `${API_URL}/api/auth/register`);
      console.log('With data:', { username: userData.username, email: userData.email });
      
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error in service:', error);
      throw error;
    }
  },
  
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
    return response.data;
  },
  
  logout: async () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    return { success: true };
  },
  
  getCurrentUser: async () => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return null;
    }
    
    // Set authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      return {
        ...response.data,
        token
      };
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  }
};

// Matrix service
export const matrixService = {
  getAllMatrices: async () => {
    const response = await axios.get(`${API_URL}/api/matrix`);
    return response.data;
  },
  
  getMatrixById: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/matrix/${id}`);
    return response.data;
  },
  
  createMatrix: async (matrixData: unknown) => {
    const response = await axios.post(`${API_URL}/api/matrix`, matrixData);
    return response.data;
  },
  
  updateMatrix: async (id: string, matrixData: unknown) => {
    const response = await axios.put(`${API_URL}/api/matrix/${id}`, matrixData);
    return response.data;
  },
  
  deleteMatrix: async (id: string) => {
    const response = await axios.delete(`${API_URL}/api/matrix/${id}`);
    return response.data;
  },
  
  verifyMatrixAccess: async (id: string, keyword: string) => {
    const response = await axios.post(`${API_URL}/api/matrix/${id}/verify`, { keyword });
    return response.data;
  }
};