package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// InitDB inicializa a conexão com o banco de dados e cria as tabelas
func InitDB(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("erro ao conectar com o banco: %v", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("erro ao verificar conexão: %v", err)
	}

	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("erro ao criar tabelas: %v", err)
	}

	return db, nil
}

// createTables cria as tabelas necessárias
func createTables(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS books (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			author TEXT NOT NULL,
			year_published INTEGER,
			isbn TEXT,
			is_available BOOLEAN DEFAULT TRUE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			phone TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS loans (
			id TEXT PRIMARY KEY,
			book_id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			loan_date DATETIME NOT NULL,
			due_date DATETIME NOT NULL,
			return_date DATETIME,
			is_returned BOOLEAN DEFAULT FALSE,
			is_overdue BOOLEAN DEFAULT FALSE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (book_id) REFERENCES books(id),
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("erro ao executar query: %v", err)
		}
	}

	return nil
}
