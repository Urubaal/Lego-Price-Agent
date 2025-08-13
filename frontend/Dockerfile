FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Default command for development (can be overridden in docker-compose)
CMD ["npm", "run", "dev"] 