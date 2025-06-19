package handlers

import (
	"library-management/internal/usecases"

	"github.com/gofiber/fiber/v2"
)

// BookHandler gerencia as requisições HTTP para livros
type BookHandler struct {
	bookService *usecases.BookService
}

// NewBookHandler cria uma nova instância do BookHandler
func NewBookHandler(bookService *usecases.BookService) *BookHandler {
	return &BookHandler{bookService: bookService}
}

// CreateBookRequest representa a estrutura da requisição para criar um livro
type CreateBookRequest struct {
	Title         string `json:"title"`
	Author        string `json:"author"`
	YearPublished int    `json:"year_published"`
	ISBN          string `json:"isbn"`
}

// UpdateBookRequest representa a estrutura da requisição para atualizar um livro
type UpdateBookRequest struct {
	Title         string `json:"title"`
	Author        string `json:"author"`
	YearPublished int    `json:"year_published"`
	ISBN          string `json:"isbn"`
}

// CreateBook cria um novo livro
func (h *BookHandler) CreateBook(c *fiber.Ctx) error {
	var req CreateBookRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	book, err := h.bookService.CreateBook(req.Title, req.Author, req.YearPublished, req.ISBN)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(book)
}

// GetAllBooks retorna todos os livros
func (h *BookHandler) GetAllBooks(c *fiber.Ctx) error {
	books, err := h.bookService.GetAllBooks()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erro interno do servidor",
		})
	}

	return c.JSON(books)
}

// GetBookByID retorna um livro pelo ID
func (h *BookHandler) GetBookByID(c *fiber.Ctx) error {
	id := c.Params("id")
	book, err := h.bookService.GetBookByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Livro não encontrado",
		})
	}

	return c.JSON(book)
}

// UpdateBook atualiza um livro existente
func (h *BookHandler) UpdateBook(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateBookRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	book, err := h.bookService.UpdateBook(id, req.Title, req.Author, req.YearPublished, req.ISBN)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(book)
}

// DeleteBook remove um livro
func (h *BookHandler) DeleteBook(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.bookService.DeleteBook(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(204).Send(nil)
}

// GetAvailableBooks retorna todos os livros disponíveis
func (h *BookHandler) GetAvailableBooks(c *fiber.Ctx) error {
	books, err := h.bookService.GetAvailableBooks()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erro interno do servidor",
		})
	}

	return c.JSON(books)
}
