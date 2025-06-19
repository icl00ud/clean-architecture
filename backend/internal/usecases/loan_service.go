package usecases

import (
	"errors"
	"library-management/internal/domain"
	"time"
)

// LoanService implementa os casos de uso para empréstimos
type LoanService struct {
	loanRepo domain.LoanRepository
	bookRepo domain.BookRepository
	userRepo domain.UserRepository
}

// NewLoanService cria uma nova instância do LoanService
func NewLoanService(loanRepo domain.LoanRepository, bookRepo domain.BookRepository, userRepo domain.UserRepository) *LoanService {
	return &LoanService{
		loanRepo: loanRepo,
		bookRepo: bookRepo,
		userRepo: userRepo,
	}
}

// CreateLoan cria um novo empréstimo
func (s *LoanService) CreateLoan(bookID, userID string, daysToReturn int) (*domain.Loan, error) {
	// Verificar se o livro existe
	book, err := s.bookRepo.GetByID(bookID)
	if err != nil {
		return nil, errors.New("livro não encontrado")
	}

	// Verificar se o usuário existe
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("usuário não encontrado")
	}

	// Verificar se o livro está disponível
	if !book.IsAvailable {
		return nil, errors.New("livro não está disponível")
	}

	// Verificar se já existe um empréstimo ativo para este livro
	activeLoan, _ := s.loanRepo.GetActiveLoanByBook(bookID)
	if activeLoan != nil {
		return nil, errors.New("livro já está emprestado")
	}

	// Definir dias padrão se não especificado
	if daysToReturn <= 0 {
		daysToReturn = 14 // 14 dias padrão
	}

	now := time.Now()
	loan := &domain.Loan{
		BookID:     book.ID,
		UserID:     user.ID,
		LoanDate:   now,
		DueDate:    now.AddDate(0, 0, daysToReturn),
		IsReturned: false,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	err = s.loanRepo.Create(loan)
	if err != nil {
		return nil, err
	}

	// Atualizar disponibilidade do livro
	book.IsAvailable = false
	book.UpdatedAt = time.Now()
	s.bookRepo.Update(book)

	// Carregar dados relacionados
	loan.Book = book
	loan.User = user

	return loan, nil
}

// ReturnLoan marca um empréstimo como devolvido
func (s *LoanService) ReturnLoan(loanID string) (*domain.Loan, error) {
	loan, err := s.loanRepo.GetByID(loanID)
	if err != nil {
		return nil, errors.New("empréstimo não encontrado")
	}

	if loan.IsReturned {
		return nil, errors.New("livro já foi devolvido")
	}

	now := time.Now()
	loan.ReturnDate = &now
	loan.IsReturned = true
	loan.UpdatedAt = now

	err = s.loanRepo.Update(loan)
	if err != nil {
		return nil, err
	}

	// Atualizar disponibilidade do livro
	book, err := s.bookRepo.GetByID(loan.BookID.String())
	if err == nil {
		book.IsAvailable = true
		book.UpdatedAt = time.Now()
		s.bookRepo.Update(book)
	}

	return loan, nil
}

// GetAllLoans retorna todos os empréstimos
func (s *LoanService) GetAllLoans() ([]*domain.Loan, error) {
	loans, err := s.loanRepo.GetAll()
	if err != nil {
		return nil, err
	}

	// Carregar dados relacionados e atualizar status de atraso
	for _, loan := range loans {
		s.loadLoanRelations(loan)
		s.updateOverdueStatus(loan)
	}

	return loans, nil
}

// GetActiveLoans retorna todos os empréstimos ativos
func (s *LoanService) GetActiveLoans() ([]*domain.Loan, error) {
	loans, err := s.loanRepo.GetActiveLoans()
	if err != nil {
		return nil, err
	}

	for _, loan := range loans {
		s.loadLoanRelations(loan)
		s.updateOverdueStatus(loan)
	}

	return loans, nil
}

// GetOverdueLoans retorna todos os empréstimos em atraso
func (s *LoanService) GetOverdueLoans() ([]*domain.Loan, error) {
	loans, err := s.loanRepo.GetOverdueLoans()
	if err != nil {
		return nil, err
	}

	for _, loan := range loans {
		s.loadLoanRelations(loan)
		s.updateOverdueStatus(loan)
	}

	return loans, nil
}

// GetLoansByUser retorna todos os empréstimos de um usuário
func (s *LoanService) GetLoansByUser(userID string) ([]*domain.Loan, error) {
	loans, err := s.loanRepo.GetLoansByUser(userID)
	if err != nil {
		return nil, err
	}

	for _, loan := range loans {
		s.loadLoanRelations(loan)
		s.updateOverdueStatus(loan)
	}

	return loans, nil
}

// GetLoansByBook retorna todos os empréstimos de um livro
func (s *LoanService) GetLoansByBook(bookID string) ([]*domain.Loan, error) {
	loans, err := s.loanRepo.GetLoansByBook(bookID)
	if err != nil {
		return nil, err
	}

	for _, loan := range loans {
		s.loadLoanRelations(loan)
		s.updateOverdueStatus(loan)
	}

	return loans, nil
}

// loadLoanRelations carrega os dados relacionados do empréstimo
func (s *LoanService) loadLoanRelations(loan *domain.Loan) {
	if book, err := s.bookRepo.GetByID(loan.BookID.String()); err == nil {
		loan.Book = book
	}
	if user, err := s.userRepo.GetByID(loan.UserID.String()); err == nil {
		loan.User = user
	}
}

// updateOverdueStatus atualiza o status de atraso do empréstimo
func (s *LoanService) updateOverdueStatus(loan *domain.Loan) {
	if !loan.IsReturned && time.Now().After(loan.DueDate) {
		if !loan.IsOverdue {
			loan.IsOverdue = true
			loan.UpdatedAt = time.Now()
			s.loanRepo.Update(loan)
		}
	}
}
