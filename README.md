# Sistema de Gerenciamento de Biblioteca Particular

Este é um sistema completo de gerenciamento de empréstimos de biblioteca particular, construído seguindo os princípios de Clean Architecture, com backend em Go + Fiber e frontend em React + TypeScript.

## 🐳 Executando com Docker

1. **Execute com Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 🚀 Funcionalidades

### 📚 Gerenciamento de Livros
- Cadastro de livros com título, autor, ano de publicação e ISBN (opcional)
- Listagem, edição e exclusão de livros
- Status de disponibilidade automático

### 👥 Gerenciamento de Usuários
- Cadastro de usuários com nome, e-mail e telefone (opcional)
- Listagem, edição e exclusão de usuários
- Validação de e-mail único

### 📋 Gerenciamento de Empréstimos
- Registro de empréstimos com data de retirada e devolução prevista
- Marcação de devolução de livros
- Alerta automático para empréstimos atrasados
- Associação automática entre livros e usuários

### 📊 Relatórios
- Listagem de todos os empréstimos ativos
- Listagem de empréstimos atrasados
- Histórico de empréstimos por usuário
- Histórico de empréstimos por livro
- Exportação de relatórios em CSV

## 🏗️ Arquitetura

### Backend (Go + Fiber)
Estrutura baseada em Clean Architecture:

```
backend/
├── cmd/
│   └── main.go              # Ponto de entrada da aplicação
├── internal/
│   ├── domain/              # Camada de domínio
│   │   ├── entities.go      # Entidades de negócio
│   │   └── repositories.go  # Interfaces dos repositórios
│   ├── usecases/            # Casos de uso / Regras de negócio
│   │   ├── book_service.go
│   │   ├── user_service.go
│   │   └── loan_service.go
│   ├── interfaces/          # Camada de interface
│   │   └── http/
│   │       ├── handlers/    # Controladores HTTP
│   │       └── routes/      # Configuração de rotas
│   └── infrastructure/      # Camada de infraestrutura
│       └── database/        # Implementação dos repositórios
├── go.mod
└── go.sum
```

### Frontend (React + TypeScript)
Estrutura modular com hooks personalizados:

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── common/          # Componentes reutilizáveis
│   │   └── tabs/            # Componentes das abas
│   ├── hooks/               # Hooks personalizados
│   ├── services/            # Comunicação com API
│   ├── types/               # Tipos TypeScript
│   └── main.tsx             # Ponto de entrada
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔌 API Endpoints

### Livros
- `GET /api/books` - Listar todos os livros
- `GET /api/books/available` - Listar livros disponíveis
- `GET /api/books/:id` - Obter livro por ID
- `POST /api/books` - Criar novo livro
- `PUT /api/books/:id` - Atualizar livro
- `DELETE /api/books/:id` - Deletar livro

### Usuários
- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Empréstimos
- `GET /api/loans` - Listar todos os empréstimos
- `GET /api/loans/active` - Listar empréstimos ativos
- `GET /api/loans/overdue` - Listar empréstimos atrasados
- `GET /api/loans/user/:userId` - Empréstimos por usuário
- `GET /api/loans/book/:bookId` - Empréstimos por livro
- `POST /api/loans` - Criar novo empréstimo
- `PUT /api/loans/:id/return` - Marcar devolução

## 🎨 Interface do Usuário

A interface é dividida em abas:

1. **Livros**: Formulário para cadastro/edição e tabela para listagem
2. **Usuários**: Formulário para cadastro/edição e tabela para listagem
3. **Empréstimos**: Formulário para registrar empréstimos/devoluções e tabela para listagem
4. **Relatórios**: Botões para gerar relatórios específicos com opção de exportação