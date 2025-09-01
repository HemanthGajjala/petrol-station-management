# FINAL FIX - Explicit copy commands to ensure lib directory exists
FROM node:20-slim AS frontend-build

# Build frontend
WORKDIR /app/frontend

# Copy package files first
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend files EXPLICITLY to ensure lib directory is included
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/components.json ./
COPY frontend/eslint.config.js ./
COPY frontend/jsconfig.json ./

# Verify lib directory is now present
RUN echo "=== VERIFICATION AFTER EXPLICIT COPY ===" && \
    ls -la src/ && \
    echo "=== LIB DIRECTORY ===" && \
    ls -la src/lib/ && \
    echo "=== SUCCESS: lib directory exists! ==="

# Build the project
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
