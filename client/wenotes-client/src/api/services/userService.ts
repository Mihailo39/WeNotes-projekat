import axiosClient from '../axiosClient';
import type { User } from '../../types/auth';

export interface UpdateUserData {
  username?: string;
  newPassword?: string;
  currentPassword?: string;
}

export const userService = {
  // Dohvati trenutnog korisnika
  async getCurrentUser(): Promise<User> {
    const response = await axiosClient.get('/user/users/me');
    return response.data.data.user;
  },

  // Ažuriraj korisnika
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await axiosClient.patch(`/user/users/${id}`, data);
    return response.data.data;
  },

  // Obriši korisnika
  async deleteUser(id: number, currentPassword: string): Promise<void> {
    await axiosClient.delete(`/user/users/${id}`, {
      data: { currentPassword }
    });
  }
};
