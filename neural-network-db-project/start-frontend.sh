#!/bin/bash
echo "Starting Frontend Application..."
cd frontend

# Проверяем установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Запускаем React приложение
echo "Starting React app on http://localhost:3000"
npm start
