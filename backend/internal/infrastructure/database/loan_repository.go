package database

import (
	"database/sql"
	"library-management/internal/domain"
	"time"

	"github.com/google/uuid"
)

// LoanRepository implementa domain.LoanRepository usando SQLite
type LoanRepository struct {
	db *sql.DB
}

// NewLoanRepository cria uma nova instância do LoanRepository
func NewLoanRepository(db *sql.DB) *LoanRepository {
	return &LoanRepository{db: db}
}

// Create insere um novo empréstimo no banco
func (r *LoanRepository) Create(loan *domain.Loan) error {
	loan.ID = uuid.New()
	query := `
		INSERT INTO loans (id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query, loan.ID.String(), loan.BookID.String(), loan.UserID.String(),
		loan.LoanDate, loan.DueDate, loan.ReturnDate, loan.IsReturned, loan.IsOverdue,
		loan.CreatedAt, loan.UpdatedAt)
	return err
}

// GetByID busca um empréstimo pelo ID
func (r *LoanRepository) GetByID(id string) (*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans WHERE id = ?
	`
	row := r.db.QueryRow(query, id)

	loan := &domain.Loan{}
	var idStr, bookIDStr, userIDStr string
	var returnDate sql.NullTime
	err := row.Scan(&idStr, &bookIDStr, &userIDStr, &loan.LoanDate, &loan.DueDate,
		&returnDate, &loan.IsReturned, &loan.IsOverdue, &loan.CreatedAt, &loan.UpdatedAt)
	if err != nil {
		return nil, err
	}

	loan.ID, _ = uuid.Parse(idStr)
	loan.BookID, _ = uuid.Parse(bookIDStr)
	loan.UserID, _ = uuid.Parse(userIDStr)

	if returnDate.Valid {
		loan.ReturnDate = &returnDate.Time
	}

	return loan, nil
}

// GetAll retorna todos os empréstimos
func (r *LoanRepository) GetAll() ([]*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans ORDER BY loan_date DESC
	`
	return r.queryLoans(query)
}

// Update atualiza um empréstimo existente
func (r *LoanRepository) Update(loan *domain.Loan) error {
	query := `
		UPDATE loans 
		SET book_id = ?, user_id = ?, loan_date = ?, due_date = ?, return_date = ?, 
		    is_returned = ?, is_overdue = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := r.db.Exec(query, loan.BookID.String(), loan.UserID.String(),
		loan.LoanDate, loan.DueDate, loan.ReturnDate, loan.IsReturned, loan.IsOverdue,
		loan.UpdatedAt, loan.ID.String())
	return err
}

// Delete remove um empréstimo
func (r *LoanRepository) Delete(id string) error {
	query := `DELETE FROM loans WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// GetActiveLoans retorna todos os empréstimos ativos
func (r *LoanRepository) GetActiveLoans() ([]*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans WHERE is_returned = false ORDER BY loan_date DESC
	`
	return r.queryLoans(query)
}

// GetOverdueLoans retorna todos os empréstimos em atraso
func (r *LoanRepository) GetOverdueLoans() ([]*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans WHERE is_returned = false AND due_date < ? ORDER BY due_date
	`
	rows, err := r.db.Query(query, time.Now())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanLoans(rows)
}

// GetLoansByUser retorna todos os empréstimos de um usuário
func (r *LoanRepository) GetLoansByUser(userID string) ([]*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans WHERE user_id = ? ORDER BY loan_date DESC
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanLoans(rows)
}

// GetLoansByBook retorna todos os empréstimos de um livro
func (r *LoanRepository) GetLoansByBook(bookID string) ([]*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans WHERE book_id = ? ORDER BY loan_date DESC
	`
	rows, err := r.db.Query(query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanLoans(rows)
}

// GetActiveLoanByBook retorna o empréstimo ativo de um livro específico
func (r *LoanRepository) GetActiveLoanByBook(bookID string) (*domain.Loan, error) {
	query := `
		SELECT id, book_id, user_id, loan_date, due_date, return_date, is_returned, is_overdue, created_at, updated_at
		FROM loans WHERE book_id = ? AND is_returned = false LIMIT 1
	`
	row := r.db.QueryRow(query, bookID)

	loan := &domain.Loan{}
	var idStr, bookIDStr, userIDStr string
	var returnDate sql.NullTime
	err := row.Scan(&idStr, &bookIDStr, &userIDStr, &loan.LoanDate, &loan.DueDate,
		&returnDate, &loan.IsReturned, &loan.IsOverdue, &loan.CreatedAt, &loan.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	loan.ID, _ = uuid.Parse(idStr)
	loan.BookID, _ = uuid.Parse(bookIDStr)
	loan.UserID, _ = uuid.Parse(userIDStr)

	if returnDate.Valid {
		loan.ReturnDate = &returnDate.Time
	}

	return loan, nil
}

// queryLoans executa uma query e retorna os empréstimos
func (r *LoanRepository) queryLoans(query string, args ...interface{}) ([]*domain.Loan, error) {
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanLoans(rows)
}

// scanLoans escaneia as linhas e constrói os empréstimos
func (r *LoanRepository) scanLoans(rows *sql.Rows) ([]*domain.Loan, error) {
	var loans []*domain.Loan
	for rows.Next() {
		loan := &domain.Loan{}
		var idStr, bookIDStr, userIDStr string
		var returnDate sql.NullTime
		err := rows.Scan(&idStr, &bookIDStr, &userIDStr, &loan.LoanDate, &loan.DueDate,
			&returnDate, &loan.IsReturned, &loan.IsOverdue, &loan.CreatedAt, &loan.UpdatedAt)
		if err != nil {
			return nil, err
		}

		loan.ID, _ = uuid.Parse(idStr)
		loan.BookID, _ = uuid.Parse(bookIDStr)
		loan.UserID, _ = uuid.Parse(userIDStr)

		if returnDate.Valid {
			loan.ReturnDate = &returnDate.Time
		}

		loans = append(loans, loan)
	}

	return loans, nil
}
