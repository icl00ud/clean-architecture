import React, { useState } from 'react';
import { Book, CreateBookRequest } from '../../types';
import { useBooks } from '../../hooks/useBooks';
import { Modal, Alert, LoadingSpinner, ConfirmDialog } from '../common/Modal';
import { Card, StatusBadge } from '../common/UI';
import BookForm from './BookForm';

const BooksTab: React.FC = () => {
  const { books, loading, error, createBook, updateBook, deleteBook } = useBooks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; book: Book | null }>({
    show: false,
    book: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreate = async (data: CreateBookRequest) => {
    try {
      await createBook(data);
      setShowCreateModal(false);
      setAlert({ type: 'success', message: 'Livro criado com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleUpdate = async (data: CreateBookRequest) => {
    if (!editingBook) return;
    try {
      await updateBook(editingBook.id, data);
      setEditingBook(null);
      setAlert({ type: 'success', message: 'Livro atualizado com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.book) return;
    try {
      await deleteBook(deleteConfirm.book.id);
      setDeleteConfirm({ show: false, book: null });
      setAlert({ type: 'success', message: 'Livro removido com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const openDeleteConfirm = (book: Book) => {
    setDeleteConfirm({ show: true, book });
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Livros</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Livro
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Ano</th>
                  <th>ISBN</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="table-row">
                    <td className="table-cell font-medium">{book.title}</td>
                    <td className="table-cell">{book.author}</td>
                    <td className="table-cell">{book.year_published || '-'}</td>
                    <td className="table-cell">{book.isbn || '-'}</td>
                    <td className="table-cell">
                      <StatusBadge status={book.is_available ? 'available' : 'unavailable'} />
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingBook(book)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(book)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {books.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum livro cadastrado. Clique em "Novo Livro" para começar.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Livro"
      >
        <BookForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Editar Livro"
      >
        {editingBook && (
          <BookForm
            book={editingBook}
            onSubmit={handleUpdate}
            onCancel={() => setEditingBook(null)}
          />
        )}
      </Modal>

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, book: null })}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o livro "${deleteConfirm.book?.title}"?`}
        type="danger"
        confirmText="Excluir"
      />
    </div>
  );
};

export default BooksTab;
