package database

import (
	"database/sql"
	"library-management/internal/domain"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

// BookRepository implementa domain.BookRepository usando SQLite
type BookRepository struct {
	db *sql.DB
}

// NewBookRepository cria uma nova instância do BookRepository
func NewBookRepository(db *sql.DB) *BookRepository {
	return &BookRepository{db: db}
}

// Create insere um novo livro no banco
func (r *BookRepository) Create(book *domain.Book) error {
	book.ID = uuid.New()
	query := `
		INSERT INTO books (id, title, author, year_published, isbn, is_available, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query, book.ID.String(), book.Title, book.Author, book.YearPublished,
		book.ISBN, book.IsAvailable, book.CreatedAt, book.UpdatedAt)
	return err
}

// GetByID busca um livro pelo ID
func (r *BookRepository) GetByID(id string) (*domain.Book, error) {
	query := `
		SELECT id, title, author, year_published, isbn, is_available, created_at, updated_at
		FROM books WHERE id = ?
	`
	row := r.db.QueryRow(query, id)

	book := &domain.Book{}
	var idStr string
	err := row.Scan(&idStr, &book.Title, &book.Author, &book.YearPublished,
		&book.ISBN, &book.IsAvailable, &book.CreatedAt, &book.UpdatedAt)
	if err != nil {
		return nil, err
	}

	book.ID, err = uuid.Parse(idStr)
	if err != nil {
		return nil, err
	}

	return book, nil
}

// GetAll retorna todos os livros
func (r *BookRepository) GetAll() ([]*domain.Book, error) {
	query := `
		SELECT id, title, author, year_published, isbn, is_available, created_at, updated_at
		FROM books ORDER BY title
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*domain.Book
	for rows.Next() {
		book := &domain.Book{}
		var idStr string
		err := rows.Scan(&idStr, &book.Title, &book.Author, &book.YearPublished,
			&book.ISBN, &book.IsAvailable, &book.CreatedAt, &book.UpdatedAt)
		if err != nil {
			return nil, err
		}

		book.ID, err = uuid.Parse(idStr)
		if err != nil {
			return nil, err
		}

		books = append(books, book)
	}

	return books, nil
}

// Update atualiza um livro existente
func (r *BookRepository) Update(book *domain.Book) error {
	query := `
		UPDATE books 
		SET title = ?, author = ?, year_published = ?, isbn = ?, is_available = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := r.db.Exec(query, book.Title, book.Author, book.YearPublished,
		book.ISBN, book.IsAvailable, book.UpdatedAt, book.ID.String())
	return err
}

// Delete remove um livro
func (r *BookRepository) Delete(id string) error {
	query := `DELETE FROM books WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// GetAvailable retorna todos os livros disponíveis
func (r *BookRepository) GetAvailable() ([]*domain.Book, error) {
	query := `
		SELECT id, title, author, year_published, isbn, is_available, created_at, updated_at
		FROM books WHERE is_available = true ORDER BY title
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*domain.Book
	for rows.Next() {
		book := &domain.Book{}
		var idStr string
		err := rows.Scan(&idStr, &book.Title, &book.Author, &book.YearPublished,
			&book.ISBN, &book.IsAvailable, &book.CreatedAt, &book.UpdatedAt)
		if err != nil {
			return nil, err
		}

		book.ID, err = uuid.Parse(idStr)
		if err != nil {
			return nil, err
		}

		books = append(books, book)
	}

	return books, nil
}
