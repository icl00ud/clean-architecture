import axios from 'axios';
import { Book, User, Loan, CreateBookRequest, CreateUserRequest, CreateLoanRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const booksApi = {
  getAll: () => api.get<Book[]>('/books'),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  getAvailable: () => api.get<Book[]>('/books/available'),
  create: (data: CreateBookRequest) => api.post<Book>('/books', data),
  update: (id: string, data: Partial<CreateBookRequest>) => api.put<Book>(`/books/${id}`, data),
  delete: (id: string) => api.delete(`/books/${id}`),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserRequest) => api.post<User>('/users', data),
  update: (id: string, data: Partial<CreateUserRequest>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const loansApi = {
  getAll: () => api.get<Loan[]>('/loans'),
  getActive: () => api.get<Loan[]>('/loans/active'),
  getOverdue: () => api.get<Loan[]>('/loans/overdue'),
  getByUser: (userId: string) => api.get<Loan[]>(`/loans/user/${userId}`),
  getByBook: (bookId: string) => api.get<Loan[]>(`/loans/book/${bookId}`),
  create: (data: CreateLoanRequest) => api.post<Loan>('/loans', data),
  returnLoan: (id: string) => api.put<Loan>(`/loans/${id}/return`),
};

export default api;
