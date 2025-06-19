import { useState, useEffect } from 'react';
import { Book, CreateBookRequest } from '../types';
import { booksApi } from '../services/api';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksApi.getAll();
      setBooks(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar livros');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksApi.getAvailable();
      setBooks(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar livros disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (data: CreateBookRequest) => {
    try {
      setError(null);
      const response = await booksApi.create(data);
      setBooks(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar livro';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateBook = async (id: string, data: Partial<CreateBookRequest>) => {
    try {
      setError(null);
      const response = await booksApi.update(id, data);
      setBooks(prev => prev.map(book => book.id === id ? response.data : book));
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar livro';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      setError(null);
      await booksApi.delete(id);
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao deletar livro';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    fetchAvailableBooks,
    createBook,
    updateBook,
    deleteBook,
  };
};
