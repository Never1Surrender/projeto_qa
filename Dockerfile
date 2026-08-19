# =========================================
# Estágio "backend"
# =========================================
FROM oven/bun:1-alpine AS backend

WORKDIR /app

# Copia só os arquivos de dependência primeiro (cache do Docker).
# Caminho com prefixo backend/ porque o contexto de build é a raiz do projeto
COPY backend/package.json backend/bun.lockb* ./
RUN bun install

# Copia o resto do código do backend
COPY backend/ .

EXPOSE 3001
CMD ["bun", "run", "src/server.js"]

# =========================================
# Estágio "frontend"
# =========================================
FROM oven/bun:1-alpine AS frontend

WORKDIR /app

# Caminho com prefixo frontend/ pelo mesmo motivo do estágio acima
COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install

COPY frontend/ .

EXPOSE 5173
CMD ["bun", "run", "dev"]
