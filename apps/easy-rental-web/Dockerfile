# Easy Rental — single Next.js app (standalone output)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/easy-rental-web/package.json ./apps/easy-rental-web/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/shared-services/package.json ./packages/shared-services/
RUN npm ci --workspace=@pwa-easy-rental/easy-rental-web

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV API_URL=http://easyrental-api:8081
RUN npm run build --workspace=@pwa-easy-rental/easy-rental-web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV API_URL=http://easyrental-api:8081
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/easy-rental-web/public ./apps/easy-rental-web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/easy-rental-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/easy-rental-web/.next/static ./apps/easy-rental-web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/easy-rental-web/server.js"]
