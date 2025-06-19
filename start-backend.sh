#!/bin/bash

echo "🚀 Iniciando o Sistema de Gerenciamento de Biblioteca"
echo "=================================================="

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Go
if ! command_exists go; then
    echo "❌ Go não está instalado. Por favor, instale Go 1.21 ou superior."
    exit 1
fi

echo "✅ Go encontrado: $(go version)"

# Entrar no diretório do backend
cd backend

echo "📦 Instalando dependências do backend..."
go mod tidy

echo "🔧 Iniciando o servidor backend..."
echo "   URL: http://localhost:8080"
echo "   Para parar o servidor, pressione Ctrl+C"
echo ""

# Executar o servidor
go run cmd/main.go
