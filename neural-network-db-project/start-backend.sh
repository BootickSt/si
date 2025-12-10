#!/bin/bash
echo "Starting Backend Server..."
cd backend

# Создаем виртуальное окружение если не существует
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Активируем виртуальное окружение
source venv/bin/activate

# Устанавливаем зависимости
echo "Installing dependencies..."
pip install -r requirements.txt

# Запускаем сервер
echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
python main.py
