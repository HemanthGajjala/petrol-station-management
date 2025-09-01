# Multi-stage build for full-stack deployment
FROM node:20-slim AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./

# Delete any existing node_modules and package-lock to start fresh
RUN rm -rf node_modules package-lock.json

# Install dependencies with production flag and legacy peer deps for Linux build
RUN npm install --legacy-peer-deps --include=dev

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
COPY main.py ./

# Copy built frontend to backend static folder
COPY --from=frontend-build /app/frontend/dist ./backend/static/

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose port
EXPOSE $PORT

# Start command
CMD ["python", "main.py"]
