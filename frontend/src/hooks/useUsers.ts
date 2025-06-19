import { useState, useEffect } from 'react';
import { User, CreateUserRequest } from '../types';
import { usersApi } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getAll();
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserRequest) => {
    try {
      setError(null);
      const response = await usersApi.create(data);
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (id: string, data: Partial<CreateUserRequest>) => {
    try {
      setError(null);
      const response = await usersApi.update(id, data);
      setUsers(prev => prev.map(user => user.id === id ? response.data : user));
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setError(null);
      await usersApi.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao deletar usuário';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
