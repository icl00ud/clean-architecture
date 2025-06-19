package main

import (
	"library-management/internal/infrastructure/database"
	"library-management/internal/interfaces/http/handlers"
	"library-management/internal/interfaces/http/routes"
	"library-management/internal/usecases"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Obter caminho do banco de dados da variável de ambiente ou usar padrão
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "library.db"
	}

	// Inicializar banco de dados
	db, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatal("Erro ao inicializar banco de dados:", err)
	}
	defer db.Close()

	// Inicializar repositórios
	bookRepo := database.NewBookRepository(db)
	userRepo := database.NewUserRepository(db)
	loanRepo := database.NewLoanRepository(db)

	// Inicializar serviços
	bookService := usecases.NewBookService(bookRepo, loanRepo)
	userService := usecases.NewUserService(userRepo, loanRepo)
	loanService := usecases.NewLoanService(loanRepo, bookRepo, userRepo)

	// Inicializar handlers
	bookHandler := handlers.NewBookHandler(bookService)
	userHandler := handlers.NewUserHandler(userService)
	loanHandler := handlers.NewLoanHandler(loanService)

	// Inicializar Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Configurar rotas
	routes.SetupRoutes(app, bookHandler, userHandler, loanHandler)

	// Iniciar servidor
	log.Println("Servidor iniciado na porta 8080")
	log.Fatal(app.Listen(":8080"))
}
