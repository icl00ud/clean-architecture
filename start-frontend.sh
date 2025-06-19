#!/bin/bash

echo "🎨 Iniciando o Frontend da Biblioteca"
echo "===================================="

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js 18 ou superior."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar npm
if ! command_exists npm; then
    echo "❌ npm não está instalado. Por favor, instale npm."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Entrar no diretório do frontend
cd frontend

echo "📦 Instalando dependências do frontend..."
npm install

echo "🔧 Iniciando o servidor de desenvolvimento..."
echo "   URL: http://localhost:3000"
echo "   Para parar o servidor, pressione Ctrl+C"
echo ""

# Executar o servidor de desenvolvimento
npm run dev
