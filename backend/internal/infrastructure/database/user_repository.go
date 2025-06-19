package database

import (
	"database/sql"
	"library-management/internal/domain"

	"github.com/google/uuid"
)

// UserRepository implementa domain.UserRepository usando SQLite
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository cria uma nova instância do UserRepository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create insere um novo usuário no banco
func (r *UserRepository) Create(user *domain.User) error {
	user.ID = uuid.New()
	query := `
		INSERT INTO users (id, name, email, phone, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query, user.ID.String(), user.Name, user.Email,
		user.Phone, user.CreatedAt, user.UpdatedAt)
	return err
}

// GetByID busca um usuário pelo ID
func (r *UserRepository) GetByID(id string) (*domain.User, error) {
	query := `
		SELECT id, name, email, phone, created_at, updated_at
		FROM users WHERE id = ?
	`
	row := r.db.QueryRow(query, id)

	user := &domain.User{}
	var idStr string
	err := row.Scan(&idStr, &user.Name, &user.Email, &user.Phone,
		&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	user.ID, err = uuid.Parse(idStr)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetAll retorna todos os usuários
func (r *UserRepository) GetAll() ([]*domain.User, error) {
	query := `
		SELECT id, name, email, phone, created_at, updated_at
		FROM users ORDER BY name
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		user := &domain.User{}
		var idStr string
		err := rows.Scan(&idStr, &user.Name, &user.Email, &user.Phone,
			&user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}

		user.ID, err = uuid.Parse(idStr)
		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	return users, nil
}

// Update atualiza um usuário existente
func (r *UserRepository) Update(user *domain.User) error {
	query := `
		UPDATE users 
		SET name = ?, email = ?, phone = ?, updated_at = ?
		WHERE id = ?
	`
	_, err := r.db.Exec(query, user.Name, user.Email, user.Phone,
		user.UpdatedAt, user.ID.String())
	return err
}

// Delete remove um usuário
func (r *UserRepository) Delete(id string) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// GetByEmail busca um usuário pelo email
func (r *UserRepository) GetByEmail(email string) (*domain.User, error) {
	query := `
		SELECT id, name, email, phone, created_at, updated_at
		FROM users WHERE email = ?
	`
	row := r.db.QueryRow(query, email)

	user := &domain.User{}
	var idStr string
	err := row.Scan(&idStr, &user.Name, &user.Email, &user.Phone,
		&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	user.ID, err = uuid.Parse(idStr)
	if err != nil {
		return nil, err
	}

	return user, nil
}
