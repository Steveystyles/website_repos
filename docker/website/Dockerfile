# =========================
# Base image
# =========================
FROM node:20-slim

# =========================
# System dependencies (REQUIRED for slim)
# =========================
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

# =========================
# App directory (CRITICAL)
# =========================
WORKDIR /app

# =========================
# Install dependencies
# =========================
COPY website_data/package*.json ./

RUN npm install

# =========================
# Copy application code
# =========================
COPY website_data ./

# =========================
# Prisma (generate inside container)
# =========================
RUN npx --no-install prisma generate

# =========================
# Build Next.js (production)
# =========================
ENV NEXTAUTH_SECRET=build-time-placeholder
RUN npm run build

# =========================
# Expose Next.js port
# =========================
EXPOSE 3000

# =========================
# Start app
# =========================
CMD ["npm", "run", "start"]
