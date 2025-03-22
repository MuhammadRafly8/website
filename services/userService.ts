import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  updateUserRole: async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/users/role`, { userId, newRole });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
};