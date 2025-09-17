# -------- Base (install deps) --------
FROM node:22-alpine AS deps
WORKDIR /app

# Install only what we need to build/run
COPY package*.json ./
# Use npm ci when package-lock.json exists, fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# -------- Runtime image --------
FROM node:22-alpine
WORKDIR /app

# Copy dependency tree
COPY --from=deps /app/node_modules ./node_modules

# Copy app source
COPY src ./src
COPY public ./public
COPY data ./data
COPY src/docs ./src/docs
COPY package*.json ./

# Set environment
ENV NODE_ENV=production
# Set a default JWT secret
ENV JWT_SECRET=change_me_in_prod

# The server listens on 3000
EXPOSE 3000

# Start the app
CMD ["node", "src/server.js"]
