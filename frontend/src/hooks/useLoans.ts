import { useState, useEffect } from 'react';
import { Loan, CreateLoanRequest } from '../types';
import { loansApi } from '../services/api';

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loansApi.getAll();
      setLoans(response.data || []); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar empréstimos');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loansApi.getActive();
      setLoans(response.data || []); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar empréstimos ativos');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loansApi.getOverdue();
      setLoans(response.data || []); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar empréstimos em atraso');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoansByUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loansApi.getByUser(userId);
      setLoans(response.data || []); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar empréstimos do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoansByBook = async (bookId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loansApi.getByBook(bookId);
      setLoans(response.data || []); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar empréstimos do livro');
    } finally {
      setLoading(false);
    }
  };

  const createLoan = async (data: CreateLoanRequest) => {
    try {
      setError(null);
      const response = await loansApi.create(data);
      setLoans(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar empréstimo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const returnLoan = async (id: string) => {
    try {
      setError(null);
      const response = await loansApi.returnLoan(id);
      setLoans(prev => prev.map(loan => loan.id === id ? response.data : loan));
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao devolver livro';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return {
    loans,
    loading,
    error,
    fetchLoans,
    fetchActiveLoans,
    fetchOverdueLoans,
    fetchLoansByUser,
    fetchLoansByBook,
    createLoan,
    returnLoan,
  };
};
