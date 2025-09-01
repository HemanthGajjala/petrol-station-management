# Multi-stage build for full-stack deployment
FROM node:20-slim AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

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
