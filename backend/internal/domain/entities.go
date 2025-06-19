package domain

import (
	"time"

	"github.com/google/uuid"
)

// Book representa um livro na biblioteca
type Book struct {
	ID            uuid.UUID `json:"id"`
	Title         string    `json:"title"`
	Author        string    `json:"author"`
	YearPublished int       `json:"year_published"`
	ISBN          string    `json:"isbn,omitempty"`
	IsAvailable   bool      `json:"is_available"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// User representa um usuário do sistema
type User struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Loan representa um empréstimo
type Loan struct {
	ID         uuid.UUID  `json:"id"`
	BookID     uuid.UUID  `json:"book_id"`
	UserID     uuid.UUID  `json:"user_id"`
	Book       *Book      `json:"book,omitempty"`
	User       *User      `json:"user,omitempty"`
	LoanDate   time.Time  `json:"loan_date"`
	DueDate    time.Time  `json:"due_date"`
	ReturnDate *time.Time `json:"return_date,omitempty"`
	IsReturned bool       `json:"is_returned"`
	IsOverdue  bool       `json:"is_overdue"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// LoanStatus representa o status de um empréstimo
type LoanStatus string

const (
	LoanStatusActive   LoanStatus = "active"
	LoanStatusOverdue  LoanStatus = "overdue"
	LoanStatusReturned LoanStatus = "returned"
)

// GetStatus retorna o status atual do empréstimo
func (l *Loan) GetStatus() LoanStatus {
	if l.IsReturned {
		return LoanStatusReturned
	}
	if time.Now().After(l.DueDate) {
		return LoanStatusOverdue
	}
	return LoanStatusActive
}
