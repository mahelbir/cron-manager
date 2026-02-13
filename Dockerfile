# Build client
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build server
FROM node:24-alpine
RUN apk add --no-cache python3 make g++ git
RUN git config --global url."https://".insteadOf "ssh://git@" && \
    git config --global url."https://".insteadOf "git@"
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client-build /app/client/dist /app/client/dist
RUN mkdir -p src/storage/app/sessions src/storage/cache
EXPOSE 4043
CMD ["node", "server.js"]
