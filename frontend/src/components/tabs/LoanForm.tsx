import React, { useState } from 'react';
import { Book, User, CreateLoanRequest } from '../../types';

interface LoanFormProps {
  availableBooks: Book[];
  users: User[];
  onSubmit: (data: CreateLoanRequest) => void;
  onCancel: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ availableBooks, users, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateLoanRequest>({
    book_id: '',
    user_id: '',
    days_to_return: 14, // 14 dias padrão
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.book_id) {
      newErrors.book_id = 'Selecione um livro';
    }

    if (!formData.user_id) {
      newErrors.user_id = 'Selecione um usuário';
    }

    if (formData.days_to_return < 1 || formData.days_to_return > 365) {
      newErrors.days_to_return = 'Dias para devolução deve estar entre 1 e 365';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CreateLoanRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateReturnDate = () => {
    const today = new Date();
    const returnDate = new Date(today);
    returnDate.setDate(today.getDate() + formData.days_to_return);
    return returnDate.toLocaleDateString('pt-BR');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label">Livro *</label>
        <select
          value={formData.book_id}
          onChange={(e) => handleChange('book_id', e.target.value)}
          className={`input-field ${errors.book_id ? 'border-red-500' : ''}`}
        >
          <option value="">Selecione um livro</option>
          {availableBooks.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} - {book.author}
            </option>
          ))}
        </select>
        {errors.book_id && <p className="text-red-500 text-sm mt-1">{errors.book_id}</p>}
        {availableBooks.length === 0 && (
          <p className="text-yellow-600 text-sm mt-1">Nenhum livro disponível para empréstimo</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Usuário *</label>
        <select
          value={formData.user_id}
          onChange={(e) => handleChange('user_id', e.target.value)}
          className={`input-field ${errors.user_id ? 'border-red-500' : ''}`}
        >
          <option value="">Selecione um usuário</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.email}
            </option>
          ))}
        </select>
        {errors.user_id && <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>}
        {users.length === 0 && (
          <p className="text-yellow-600 text-sm mt-1">Nenhum usuário cadastrado</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Dias para Devolução</label>
        <input
          type="number"
          value={formData.days_to_return}
          onChange={(e) => handleChange('days_to_return', parseInt(e.target.value) || 0)}
          className={`input-field ${errors.days_to_return ? 'border-red-500' : ''}`}
          placeholder="14"
          min="1"
          max="365"
        />
        {errors.days_to_return && <p className="text-red-500 text-sm mt-1">{errors.days_to_return}</p>}
        <p className="text-sm text-gray-500 mt-1">
          Data de devolução prevista: {calculateReturnDate()}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Resumo do Empréstimo</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            <strong>Livro:</strong> {formData.book_id ? 
              availableBooks.find(b => b.id === formData.book_id)?.title || 'Não selecionado' : 
              'Não selecionado'
            }
          </div>
          <div>
            <strong>Usuário:</strong> {formData.user_id ? 
              users.find(u => u.id === formData.user_id)?.name || 'Não selecionado' : 
              'Não selecionado'
            }
          </div>
          <div>
            <strong>Data de Empréstimo:</strong> {new Date().toLocaleDateString('pt-BR')}
          </div>
          <div>
            <strong>Data de Devolução:</strong> {calculateReturnDate()}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={availableBooks.length === 0 || users.length === 0}
        >
          Criar Empréstimo
        </button>
      </div>
    </form>
  );
};

export default LoanForm;
