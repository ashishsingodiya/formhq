# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app


# Installs all workspace deps and builds the api bundle.
# Also produces an isolated prod-only deploy at /prod/api for the runtime image.
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/api build
RUN pnpm --filter @repo/api deploy --prod /prod/api


# Reuses the fully-installed builder so drizzle-kit + migrations are available.
FROM builder AS migrator
WORKDIR /app/packages/database
CMD ["pnpm", "exec", "drizzle-kit", "migrate"]


FROM node:20-alpine AS runner
ENV NODE_ENV=prod
ENV PORT=8000
WORKDIR /app
COPY --from=builder /prod/api/package.json ./package.json
COPY --from=builder /prod/api/node_modules ./node_modules
COPY --from=builder /prod/api/dist ./dist
EXPOSE 8000
CMD ["node", "dist/index.js"]
