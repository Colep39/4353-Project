# --- 1. Build Stage ---
FROM node:18-alpine AS build

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your source code
COPY . .

# --- 2. Run Stage ---
FROM node:18-alpine

WORKDIR /app

# Copy only what we need from the build stage
COPY --from=build /app .

EXPOSE 5050

CMD ["npm", "start"]
