export interface Book {
  id: string;
  title: string;
  author: string;
  year_published: number;
  isbn?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  book_id: string;
  user_id: string;
  book?: Book;
  user?: User;
  loan_date: string;
  due_date: string;
  return_date?: string;
  is_returned: boolean;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  year_published: number;
  isbn?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateLoanRequest {
  book_id: string;
  user_id: string;
  days_to_return: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export type LoanStatus = 'active' | 'overdue' | 'returned';
