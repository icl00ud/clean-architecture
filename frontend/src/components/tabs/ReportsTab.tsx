import React, { useState } from 'react';
import { useLoans } from '../../hooks/useLoans';
import { useBooks } from '../../hooks/useBooks';
import { useUsers } from '../../hooks/useUsers';
import { Alert, LoadingSpinner } from '../common/Modal';
import { Card, StatusBadge } from '../common/UI';
import { Loan } from '../../types';

const ReportsTab: React.FC = () => {
  const { 
    loans, 
    loading: loansLoading, 
    error: loansError, 
    fetchActiveLoans, 
    fetchOverdueLoans, 
    fetchLoansByUser,
    fetchLoansByBook 
  } = useLoans();
  const { books } = useBooks();
  const { users } = useUsers();

  const [activeReport, setActiveReport] = useState<'active' | 'overdue' | 'user' | 'book' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [loading, setLoading] = useState(false);

  const generateActiveLoansReport = async () => {
    setLoading(true);
    setActiveReport('active');
    try {
      await fetchActiveLoans();
    } finally {
      setLoading(false);
    }
  };

  const generateOverdueLoansReport = async () => {
    setLoading(true);
    setActiveReport('overdue');
    try {
      await fetchOverdueLoans();
    } finally {
      setLoading(false);
    }
  };

  const generateUserReport = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setActiveReport('user');
    try {
      await fetchLoansByUser(selectedUserId);
    } finally {
      setLoading(false);
    }
  };

  const generateBookReport = async () => {
    if (!selectedBookId) return;
    setLoading(true);
    setActiveReport('book');
    try {
      await fetchLoansByBook(selectedBookId);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = loans.map(loan => ({
      'Livro': loan.book?.title || 'N/A',
      'Autor': loan.book?.author || 'N/A',
      'Usuário': loan.user?.name || 'N/A',
      'Email': loan.user?.email || 'N/A',
      'Data do Empréstimo': new Date(loan.loan_date).toLocaleDateString('pt-BR'),
      'Data de Devolução Prevista': new Date(loan.due_date).toLocaleDateString('pt-BR'),
      'Data Devolvido': loan.return_date ? new Date(loan.return_date).toLocaleDateString('pt-BR') : 'Não devolvido',
      'Status': loan.is_returned ? 'Devolvido' : (loan.is_overdue ? 'Atrasado' : 'Ativo')
    }));

    const csvContent = [
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      let filename = 'relatorio_emprestimos';
      switch (activeReport) {
        case 'active':
          filename = 'relatorio_emprestimos_ativos';
          break;
        case 'overdue':
          filename = 'relatorio_emprestimos_atrasados';
          break;
        case 'user':
          const user = users.find(u => u.id === selectedUserId);
          filename = `relatorio_emprestimos_${user?.name?.replace(/\s+/g, '_') || 'usuario'}`;
          break;
        case 'book':
          const book = books.find(b => b.id === selectedBookId);
          filename = `relatorio_emprestimos_${book?.title?.replace(/\s+/g, '_') || 'livro'}`;
          break;
      }
      
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getLoanStatus = (loan: Loan): 'active' | 'overdue' | 'returned' => {
    if (loan.is_returned) return 'returned';
    if (loan.is_overdue || new Date() > new Date(loan.due_date)) return 'overdue';
    return 'active';
  };

  const getReportTitle = () => {
    switch (activeReport) {
      case 'active':
        return 'Relatório de Empréstimos Ativos';
      case 'overdue':
        return 'Relatório de Empréstimos Atrasados';
      case 'user':
        const user = users.find(u => u.id === selectedUserId);
        return `Histórico de Empréstimos - ${user?.name}`;
      case 'book':
        const book = books.find(b => b.id === selectedBookId);
        return `Histórico de Empréstimos - ${book?.title}`;
      default:
        return 'Relatório';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Relatórios do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Relatórios Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Relatórios Rápidos</h3>
            
            <div className="space-y-3">
              <button
                onClick={generateActiveLoansReport}
                className="w-full btn-primary text-left"
                disabled={loading}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Empréstimos Ativos</div>
                    <div className="text-sm opacity-75">Todos os empréstimos que ainda não foram devolvidos</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </button>

              <button
                onClick={generateOverdueLoansReport}
                className="w-full btn-warning text-left"
                disabled={loading}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Empréstimos Atrasados</div>
                    <div className="text-sm opacity-75">Empréstimos que passaram da data de devolução</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Relatórios por Usuário */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Histórico por Usuário</h3>
            
            <div className="space-y-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field"
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
              
              <button
                onClick={generateUserReport}
                className="w-full btn-secondary"
                disabled={!selectedUserId || loading}
              >
                Gerar Relatório do Usuário
              </button>
            </div>
          </div>

          {/* Relatórios por Livro */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Histórico por Livro</h3>
            
            <div className="space-y-3">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="input-field"
              >
                <option value="">Selecione um livro</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </option>
                ))}
              </select>
              
              <button
                onClick={generateBookReport}
                className="w-full btn-secondary"
                disabled={!selectedBookId || loading}
              >
                Gerar Relatório do Livro
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Resultados do Relatório */}
      {(activeReport && !loading) && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{getReportTitle()}</h3>
            {loans.length > 0 && (
              <button onClick={exportReport} className="btn-success">
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            )}
          </div>

          {loansLoading || loading ? (
            <LoadingSpinner />
          ) : loansError ? (
            <Alert type="error" message={loansError} />
          ) : loans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum empréstimo encontrado para os critérios selecionados.
            </div>
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
                        {loan.return_date ? formatDate(loan.return_date) : '-'}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={getLoanStatus(loan)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ReportsTab;
