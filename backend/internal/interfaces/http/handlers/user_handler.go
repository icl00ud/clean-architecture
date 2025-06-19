package handlers

import (
	"library-management/internal/usecases"

	"github.com/gofiber/fiber/v2"
)

// UserHandler gerencia as requisições HTTP para usuários
type UserHandler struct {
	userService *usecases.UserService
}

// NewUserHandler cria uma nova instância do UserHandler
func NewUserHandler(userService *usecases.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// CreateUserRequest representa a estrutura da requisição para criar um usuário
type CreateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// UpdateUserRequest representa a estrutura da requisição para atualizar um usuário
type UpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// CreateUser cria um novo usuário
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	user, err := h.userService.CreateUser(req.Name, req.Email, req.Phone)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(user)
}

// GetAllUsers retorna todos os usuários
func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Erro interno do servidor",
		})
	}

	return c.JSON(users)
}

// GetUserByID retorna um usuário pelo ID
func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	id := c.Params("id")
	user, err := h.userService.GetUserByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	return c.JSON(user)
}

// UpdateUser atualiza um usuário existente
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	user, err := h.userService.UpdateUser(id, req.Name, req.Email, req.Phone)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(user)
}

// DeleteUser remove um usuário
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.userService.DeleteUser(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(204).Send(nil)
}
