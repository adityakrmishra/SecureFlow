FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.example .env
ENV NODE_ENV=production
RUN npx prisma generate
RUN npx next build

FROM node:20-alpine AS runner
WORKDIR /opt/prisma-cli
RUN npm init -y && npm install --omit=dev --ignore-scripts dotenv@16.6.1 prisma@7.8.0

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=9002
ENV HOSTNAME=0.0.0.0
ENV NODE_PATH=/opt/prisma-cli/node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
EXPOSE 9002
ENTRYPOINT ["sh", "-c", "node /opt/prisma-cli/node_modules/prisma/build/index.js migrate deploy && node server.js"]
