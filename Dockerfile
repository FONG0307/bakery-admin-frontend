# -------- BUILD STAGE --------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng cache
COPY package*.json ./

RUN npm install

# Copy toàn bộ source
COPY . .

# Build Next.js (production)
RUN npm run build


# -------- RUN STAGE --------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Chỉ copy những thứ cần thiết
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]
