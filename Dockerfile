# Build client
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build server dependencies
FROM node:24-alpine AS server-build
RUN apk add --no-cache python3 make g++
WORKDIR /app/server
COPY server/package*.json server/.npmrc ./
RUN npm install --omit=dev

# Production
FROM node:24-alpine
WORKDIR /app/server
COPY --from=server-build /app/server/node_modules ./node_modules
COPY server/ ./
COPY --from=client-build /app/client/dist /app/client/dist
CMD ["node", "server.js"]
