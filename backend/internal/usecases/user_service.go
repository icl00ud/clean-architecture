package usecases

import (
	"errors"
	"library-management/internal/domain"
	"regexp"
	"time"
)

// UserService implementa os casos de uso para usuários
type UserService struct {
	userRepo domain.UserRepository
	loanRepo domain.LoanRepository
}

// NewUserService cria uma nova instância do UserService
func NewUserService(userRepo domain.UserRepository, loanRepo domain.LoanRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
		loanRepo: loanRepo,
	}
}

// CreateUser cria um novo usuário
func (s *UserService) CreateUser(name, email, phone string) (*domain.User, error) {
	if name == "" {
		return nil, errors.New("nome é obrigatório")
	}
	if email == "" {
		return nil, errors.New("email é obrigatório")
	}

	// Validar formato do email
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	match, _ := regexp.MatchString(emailRegex, email)
	if !match {
		return nil, errors.New("formato de email inválido")
	}

	// Verificar se email já existe
	existingUser, _ := s.userRepo.GetByEmail(email)
	if existingUser != nil {
		return nil, errors.New("email já está em uso")
	}

	user := &domain.User{
		Name:      name,
		Email:     email,
		Phone:     phone,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetAllUsers retorna todos os usuários
func (s *UserService) GetAllUsers() ([]*domain.User, error) {
	return s.userRepo.GetAll()
}

// GetUserByID retorna um usuário pelo ID
func (s *UserService) GetUserByID(id string) (*domain.User, error) {
	return s.userRepo.GetByID(id)
}

// UpdateUser atualiza um usuário existente
func (s *UserService) UpdateUser(id, name, email, phone string) (*domain.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if name != "" {
		user.Name = name
	}
	if email != "" {
		// Validar formato do email
		emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
		match, _ := regexp.MatchString(emailRegex, email)
		if !match {
			return nil, errors.New("formato de email inválido")
		}

		// Verificar se email já existe (diferente do usuário atual)
		existingUser, _ := s.userRepo.GetByEmail(email)
		if existingUser != nil && existingUser.ID != user.ID {
			return nil, errors.New("email já está em uso")
		}
		user.Email = email
	}
	user.Phone = phone
	user.UpdatedAt = time.Now()

	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// DeleteUser remove um usuário
func (s *UserService) DeleteUser(id string) error {
	// Verificar se o usuário tem empréstimos ativos
	activeLoans, err := s.loanRepo.GetLoansByUser(id)
	if err != nil {
		return err
	}

	for _, loan := range activeLoans {
		if !loan.IsReturned {
			return errors.New("não é possível deletar um usuário com empréstimos ativos")
		}
	}

	return s.userRepo.Delete(id)
}
