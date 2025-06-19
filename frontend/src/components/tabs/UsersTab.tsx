import React, { useState } from 'react';
import { User, CreateUserRequest } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import { Modal, Alert, LoadingSpinner, ConfirmDialog } from '../common/Modal';
import { Card } from '../common/UI';
import UserForm from './UserForm';

const UsersTab: React.FC = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; user: User | null }>({
    show: false,
    user: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreate = async (data: CreateUserRequest) => {
    try {
      await createUser(data);
      setShowCreateModal(false);
      setAlert({ type: 'success', message: 'Usuário criado com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleUpdate = async (data: CreateUserRequest) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, data);
      setEditingUser(null);
      setAlert({ type: 'success', message: 'Usuário atualizado com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.user) return;
    try {
      await deleteUser(deleteConfirm.user.id);
      setDeleteConfirm({ show: false, user: null });
      setAlert({ type: 'success', message: 'Usuário removido com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const openDeleteConfirm = (user: User) => {
    setDeleteConfirm({ show: true, user });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Usuário
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
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell font-medium">{user.name}</td>
                    <td className="table-cell">{user.email}</td>
                    <td className="table-cell">{user.phone || '-'}</td>
                    <td className="table-cell">{formatDate(user.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(user)}
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
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Usuário"
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Usuário"
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            onSubmit={handleUpdate}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, user: null })}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário "${deleteConfirm.user?.name}"?`}
        type="danger"
        confirmText="Excluir"
      />
    </div>
  );
};

export default UsersTab;
