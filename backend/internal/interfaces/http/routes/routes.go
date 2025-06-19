package routes

import (
	"library-management/internal/interfaces/http/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// SetupRoutes configura todas as rotas da aplicação
func SetupRoutes(app *fiber.App, bookHandler *handlers.BookHandler, userHandler *handlers.UserHandler, loanHandler *handlers.LoanHandler) {
	// CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// API prefix
	api := app.Group("/api")

	// Book routes
	books := api.Group("/books")
	books.Post("/", bookHandler.CreateBook)
	books.Get("/", bookHandler.GetAllBooks)
	books.Get("/available", bookHandler.GetAvailableBooks)
	books.Get("/:id", bookHandler.GetBookByID)
	books.Put("/:id", bookHandler.UpdateBook)
	books.Delete("/:id", bookHandler.DeleteBook)

	// User routes
	users := api.Group("/users")
	users.Post("/", userHandler.CreateUser)
	users.Get("/", userHandler.GetAllUsers)
	users.Get("/:id", userHandler.GetUserByID)
	users.Put("/:id", userHandler.UpdateUser)
	users.Delete("/:id", userHandler.DeleteUser)

	// Loan routes
	loans := api.Group("/loans")
	loans.Post("/", loanHandler.CreateLoan)
	loans.Get("/", loanHandler.GetAllLoans)
	loans.Get("/active", loanHandler.GetActiveLoans)
	loans.Get("/overdue", loanHandler.GetOverdueLoans)
	loans.Get("/user/:userId", loanHandler.GetLoansByUser)
	loans.Get("/book/:bookId", loanHandler.GetLoansByBook)
	loans.Put("/:id/return", loanHandler.ReturnLoan)
}
