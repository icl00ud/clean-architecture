import React, { useState, useEffect } from 'react';
import { Book, CreateBookRequest } from '../../types';

interface BookFormProps {
  book?: Book;
  onSubmit: (data: CreateBookRequest) => void;
  onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: '',
    author: '',
    year_published: new Date().getFullYear(),
    isbn: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        year_published: book.year_published,
        isbn: book.isbn || '',
      });
    }
  }, [book]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Autor é obrigatório';
    }

    if (formData.year_published < 1000 || formData.year_published > new Date().getFullYear()) {
      newErrors.year_published = 'Ano deve ser válido';
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

  const handleChange = (field: keyof CreateBookRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label">Título *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`input-field ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Digite o título do livro"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Autor *</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => handleChange('author', e.target.value)}
          className={`input-field ${errors.author ? 'border-red-500' : ''}`}
          placeholder="Digite o nome do autor"
        />
        {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Ano de Publicação</label>
        <input
          type="number"
          value={formData.year_published}
          onChange={(e) => handleChange('year_published', parseInt(e.target.value) || 0)}
          className={`input-field ${errors.year_published ? 'border-red-500' : ''}`}
          placeholder="Ex: 2023"
          min="1000"
          max={new Date().getFullYear()}
        />
        {errors.year_published && <p className="text-red-500 text-sm mt-1">{errors.year_published}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">ISBN (opcional)</label>
        <input
          type="text"
          value={formData.isbn}
          onChange={(e) => handleChange('isbn', e.target.value)}
          className="input-field"
          placeholder="Ex: 978-3-16-148410-0"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {book ? 'Atualizar' : 'Criar'} Livro
        </button>
      </div>
    </form>
  );
};

export default BookForm;
