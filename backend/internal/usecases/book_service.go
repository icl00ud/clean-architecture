package usecases

import (
	"errors"
	"library-management/internal/domain"
	"time"
)

// BookService implementa os casos de uso para livros
type BookService struct {
	bookRepo domain.BookRepository
	loanRepo domain.LoanRepository
}

// NewBookService cria uma nova instância do BookService
func NewBookService(bookRepo domain.BookRepository, loanRepo domain.LoanRepository) *BookService {
	return &BookService{
		bookRepo: bookRepo,
		loanRepo: loanRepo,
	}
}

// CreateBook cria um novo livro
func (s *BookService) CreateBook(title, author string, yearPublished int, isbn string) (*domain.Book, error) {
	if title == "" {
		return nil, errors.New("título é obrigatório")
	}
	if author == "" {
		return nil, errors.New("autor é obrigatório")
	}

	book := &domain.Book{
		Title:         title,
		Author:        author,
		YearPublished: yearPublished,
		ISBN:          isbn,
		IsAvailable:   true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	err := s.bookRepo.Create(book)
	if err != nil {
		return nil, err
	}

	return book, nil
}

// GetAllBooks retorna todos os livros
func (s *BookService) GetAllBooks() ([]*domain.Book, error) {
	return s.bookRepo.GetAll()
}

// GetBookByID retorna um livro pelo ID
func (s *BookService) GetBookByID(id string) (*domain.Book, error) {
	return s.bookRepo.GetByID(id)
}

// UpdateBook atualiza um livro existente
func (s *BookService) UpdateBook(id, title, author string, yearPublished int, isbn string) (*domain.Book, error) {
	book, err := s.bookRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if title != "" {
		book.Title = title
	}
	if author != "" {
		book.Author = author
	}
	if yearPublished > 0 {
		book.YearPublished = yearPublished
	}
	book.ISBN = isbn
	book.UpdatedAt = time.Now()

	err = s.bookRepo.Update(book)
	if err != nil {
		return nil, err
	}

	return book, nil
}

// DeleteBook remove um livro
func (s *BookService) DeleteBook(id string) error {
	// Verificar se o livro está emprestado
	activeLoan, err := s.loanRepo.GetActiveLoanByBook(id)
	if err != nil {
		return err
	}
	if activeLoan != nil {
		return errors.New("não é possível deletar um livro que está emprestado")
	}

	return s.bookRepo.Delete(id)
}

// GetAvailableBooks retorna todos os livros disponíveis
func (s *BookService) GetAvailableBooks() ([]*domain.Book, error) {
	return s.bookRepo.GetAvailable()
}
