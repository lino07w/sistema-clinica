FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Instalar sólo dependencias de producción (capa cacheable)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# No ejecutar como root
USER node

EXPOSE 3000
CMD ["node", "server.js"]
