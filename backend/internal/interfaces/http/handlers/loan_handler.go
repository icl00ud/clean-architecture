package handlers

import (
	"library-management/internal/usecases"

	"github.com/gofiber/fiber/v2"
)

// LoanHandler gerencia as requisições HTTP para empréstimos
type LoanHandler struct {
	loanService *usecases.LoanService
}

// NewLoanHandler cria uma nova instância do LoanHandler
func NewLoanHandler(loanService *usecases.LoanService) *LoanHandler {
	return &LoanHandler{loanService: loanService}
}

// CreateLoanRequest representa a estrutura da requisição para criar um empréstimo
type CreateLoanRequest struct {
	BookID       string `json:"book_id"`
	UserID       string `json:"user_id"`
	DaysToReturn int    `json:"days_to_return"`
}

// CreateLoan cria um novo empréstimo
func (h *LoanHandler) CreateLoan(c *fiber.Ctx) error {
	var req CreateLoanRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	loan, err := h.loanService.CreateLoan(req.BookID, req.UserID, req.DaysToReturn)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(loan)
}

// ReturnLoan marca um empréstimo como devolvido
func (h *LoanHandler) ReturnLoan(c *fiber.Ctx) error {
	id := c.Params("id")
	loan, err := h.loanService.ReturnLoan(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(loan)
}

// GetAllLoans retorna todos os empréstimos
func (h *LoanHandler) GetAllLoans(c *fiber.Ctx) error {
	loans, err := h.loanService.GetAllLoans()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erro interno do servidor",
		})
	}

	return c.JSON(loans)
}

// GetActiveLoans retorna todos os empréstimos ativos
func (h *LoanHandler) GetActiveLoans(c *fiber.Ctx) error {
	loans, err := h.loanService.GetActiveLoans()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erro interno do servidor",
		})
	}

	return c.JSON(loans)
}

// GetOverdueLoans retorna todos os empréstimos em atraso
func (h *LoanHandler) GetOverdueLoans(c *fiber.Ctx) error {
	loans, err := h.loanService.GetOverdueLoans()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erro interno do servidor",
		})
	}

	return c.JSON(loans)
}

// GetLoansByUser retorna todos os empréstimos de um usuário
func (h *LoanHandler) GetLoansByUser(c *fiber.Ctx) error {
	userID := c.Params("userId")
	loans, err := h.loanService.GetLoansByUser(userID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(loans)
}

// GetLoansByBook retorna todos os empréstimos de um livro
func (h *LoanHandler) GetLoansByBook(c *fiber.Ctx) error {
	bookID := c.Params("bookId")
	loans, err := h.loanService.GetLoansByBook(bookID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(loans)
}
