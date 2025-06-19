package domain

// BookRepository define os métodos para persistência de livros
type BookRepository interface {
	Create(book *Book) error
	GetByID(id string) (*Book, error)
	GetAll() ([]*Book, error)
	Update(book *Book) error
	Delete(id string) error
	GetAvailable() ([]*Book, error)
}

// UserRepository define os métodos para persistência de usuários
type UserRepository interface {
	Create(user *User) error
	GetByID(id string) (*User, error)
	GetAll() ([]*User, error)
	Update(user *User) error
	Delete(id string) error
	GetByEmail(email string) (*User, error)
}

// LoanRepository define os métodos para persistência de empréstimos
type LoanRepository interface {
	Create(loan *Loan) error
	GetByID(id string) (*Loan, error)
	GetAll() ([]*Loan, error)
	Update(loan *Loan) error
	Delete(id string) error
	GetActiveLoans() ([]*Loan, error)
	GetOverdueLoans() ([]*Loan, error)
	GetLoansByUser(userID string) ([]*Loan, error)
	GetLoansByBook(bookID string) ([]*Loan, error)
	GetActiveLoanByBook(bookID string) (*Loan, error)
}
