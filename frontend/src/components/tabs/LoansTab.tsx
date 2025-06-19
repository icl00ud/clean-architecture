import React, { useState, useEffect } from 'react';
import { Loan, CreateLoanRequest, Book, User } from '../../types';
import { useLoans } from '../../hooks/useLoans';
import { useBooks } from '../../hooks/useBooks';
import { useUsers } from '../../hooks/useUsers';
import { Modal, Alert, LoadingSpinner, ConfirmDialog } from '../common/Modal';
import { Card, StatusBadge } from '../common/UI';
import LoanForm from './LoanForm';

const LoansTab: React.FC = () => {
  const { loans, loading, error, fetchActiveLoans, fetchOverdueLoans, fetchLoans, createLoan, returnLoan } = useLoans();
  const { books } = useBooks();
  const { users } = useUsers();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [returnConfirm, setReturnConfirm] = useState<{ show: boolean; loan: Loan | null }>({
    show: false,
    loan: null,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    switch (filter) {
      case 'active':
        fetchActiveLoans();
        break;
      case 'overdue':
        fetchOverdueLoans();
        break;
      default:
        fetchLoans();
    }
  }, [filter]);

  const handleCreate = async (data: CreateLoanRequest) => {
    try {
      await createLoan(data);
      setShowCreateModal(false);
      setAlert({ type: 'success', message: 'Empréstimo criado com sucesso!' });
      // Atualizar lista baseado no filtro atual
      switch (filter) {
        case 'active':
          fetchActiveLoans();
          break;
        case 'overdue':
          fetchOverdueLoans();
          break;
        default:
          fetchLoans();
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleReturn = async () => {
    if (!returnConfirm.loan) return;
    try {
      await returnLoan(returnConfirm.loan.id);
      setReturnConfirm({ show: false, loan: null });
      setAlert({ type: 'success', message: 'Livro devolvido com sucesso!' });
      // Atualizar lista baseado no filtro atual
      switch (filter) {
        case 'active':
          fetchActiveLoans();
          break;
        case 'overdue':
          fetchOverdueLoans();
          break;
        default:
          fetchLoans();
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const openReturnConfirm = (loan: Loan) => {
    setReturnConfirm({ show: true, loan });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getLoanStatus = (loan: Loan): 'active' | 'overdue' | 'returned' => {
    if (loan.is_returned) return 'returned';
    if (loan.is_overdue || new Date() > new Date(loan.due_date)) return 'overdue';
    return 'active';
  };

  const getAvailableBooks = () => {
    return books.filter(book => book.is_available);
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
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Empréstimos</h2>
          <div className="flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'overdue')}
              className="input-field w-auto"
            >
              <option value="all">Todos os Empréstimos</option>
              <option value="active">Ativos</option>
              <option value="overdue">Em Atraso</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              disabled={getAvailableBooks().length === 0 || users.length === 0}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Empréstimo
            </button>
          </div>
        </div>

        {getAvailableBooks().length === 0 && (
          <Alert type="warning" message="Não há livros disponíveis para empréstimo." />
        )}

        {users.length === 0 && (
          <Alert type="warning" message="Cadastre usuários antes de criar empréstimos." />
        )}

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Livro</th>
                  <th>Usuário</th>
                  <th>Data do Empréstimo</th>
                  <th>Data de Devolução</th>
                  <th>Data Devolvido</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{loan.book?.title || 'Livro não encontrado'}</div>
                        <div className="text-sm text-gray-500">{loan.book?.author}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{loan.user?.name || 'Usuário não encontrado'}</div>
                        <div className="text-sm text-gray-500">{loan.user?.email}</div>
                      </div>
                    </td>
                    <td className="table-cell">{formatDate(loan.loan_date)}</td>
                    <td className="table-cell">{formatDate(loan.due_date)}</td>
                    <td className="table-cell">
                      {loan.return_date ? formatDateTime(loan.return_date) : '-'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={getLoanStatus(loan)} />
                    </td>
                    <td className="table-cell">
                      {!loan.is_returned && (
                        <button
                          onClick={() => openReturnConfirm(loan)}
                          className="btn-success text-sm"
                        >
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {loans.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {filter === 'all' && 'Nenhum empréstimo cadastrado. Clique em "Novo Empréstimo" para começar.'}
                {filter === 'active' && 'Nenhum empréstimo ativo no momento.'}
                {filter === 'overdue' && 'Nenhum empréstimo em atraso.'}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Empréstimo"
      >
        <LoanForm
          availableBooks={getAvailableBooks()}
          users={users}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Diálogo de Confirmação de Devolução */}
      <ConfirmDialog
        isOpen={returnConfirm.show}
        onClose={() => setReturnConfirm({ show: false, loan: null })}
        onConfirm={handleReturn}
        title="Confirmar Devolução"
        message={`Confirmar a devolução do livro "${returnConfirm.loan?.book?.title}"?`}
        type="info"
        confirmText="Devolver"
      />
    </div>
  );
};

export default LoansTab;
