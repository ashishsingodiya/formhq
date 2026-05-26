# tRPC Monorepo

A full-stack monorepo template for rapid development and hackathon projects. Ship fast with modern tooling, type safety, and best practices built in.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: Express + tRPC v11 + OpenAPI generation
- **Frontend**: Next.js 16 (App Router) + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 15 + Drizzle ORM
- **Auth**: Google OAuth 2.0
- **Validation**: Zod (end-to-end)
- **Logging**: Winston
- **Language**: TypeScript 5.9

## Project Structure

```
trpc-monorepo-1/
├── apps/
│   ├── api/              # Express server (port 8000)
│   │   └── src/
│   │       └── server.ts
│   └── web/              # Next.js app (port 3000)
│       └── app/
├── packages/
│   ├── trpc/             # Shared tRPC router + types
│   ├── database/         # Drizzle ORM + PostgreSQL schema
│   ├── services/         # Business logic (auth, etc.)
│   ├── logger/           # Winston logger
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/# Shared TypeScript config
├── docker-compose.yml    # PostgreSQL setup
└── turbo.json           # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Docker & Docker Compose (for PostgreSQL)

### Installation

1. **Clone and install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   Create `.env.local` in the root:

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/streamyst

   # Google OAuth
   GOOGLE_OAUTH_CLIENT_ID=your_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
   GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

   # Logging
   LOGGER_LEVEL=info
   NODE_ENV=development
   ```

3. **Start PostgreSQL**

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start development servers**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:8000
   - Web: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## Available Commands

### Development

```bash
pnpm dev              # Start all apps in dev mode
pnpm dev:api         # Start API only
pnpm dev:web         # Start web app only
```

### Database

```bash
pnpm db:generate     # Generate Drizzle migrations
pnpm db:migrate      # Run pending migrations
pnpm db:studio       # Open Drizzle Studio (GUI)
```

### Build & Test

```bash
pnpm build           # Build all packages
pnpm lint            # Run ESLint
pnpm type-check      # Run TypeScript type checking
```

## API Routes

### Health Check

- **GET** `/health` — Returns `{ status: "healthy" }`

### Authentication

- **GET** `/authentication/supported-providers` — Returns configured OAuth providers with auth URLs

### OpenAPI & Docs

- **GET** `/api` — OpenAPI schema (JSON)
- **GET** `/docs` — Scalar API documentation UI

## Authentication Setup

### Google OAuth

1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URI: `http://localhost:3000/auth/callback`
4. Copy Client ID and Secret to `.env.local`

The `auth.getSupportedAuthenticationProviders` route will automatically return Google as an available provider if credentials are configured.

## Database Schema

Currently includes:

- `usersTable` — User records with timestamps

Migrations are stored in `packages/database/drizzle/`. Add new tables to `packages/database/src/models/` and generate migrations with `pnpm db:generate`.

## Frontend Development

The Next.js app uses:

- **tRPC React Query client** in client components
- **tRPC proxy client** in server components
- **Tailwind CSS** for styling
- **shadcn/ui** for pre-built components
- **next-themes** for dark mode support
- **Sonner** for toast notifications

## Backend Development

The Express API:

- Mounts tRPC at `/trpc`
- Auto-generates OpenAPI schema at `/api`
- Serves Scalar docs at `/docs`
- Uses Winston for structured logging
- Validates all inputs with Zod

Add new routes in `packages/trpc/src/server/routes/` and export from the main router.

## Deployment

### Build for Production

```bash
pnpm build
```

### Environment Variables for Production

Set these in your deployment platform:

- `DATABASE_URL` — Production PostgreSQL connection string
- `GOOGLE_OAUTH_CLIENT_ID` — Production OAuth credentials
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` — Production callback URL
- `NODE_ENV=production`
- `LOGGER_LEVEL=warn`

### Running in Production

```bash
# API
node apps/api/dist/server.js

# Web (Next.js)
npm start
```

## Troubleshooting

### Database connection fails

- Ensure Docker container is running: `docker-compose ps`
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is accessible: `psql $DATABASE_URL`

### tRPC client errors

- Check that API server is running on port 8000
- Verify `TRPC_URL` environment variable in web app
- Check browser console for network errors

### OAuth not working

- Verify credentials in `.env.local`
- Check redirect URI matches Google Cloud console
- Ensure `GOOGLE_OAUTH_REDIRECT_URI` is correct for your environment

## Contributing

This is a template — feel free to modify, extend, and adapt it to your needs. Some ideas:

- Add more OAuth providers (GitHub, Discord, etc.)
- Extend the database schema
- Add more tRPC routes
- Customize the UI with your branding

## License

MIT

---

Built with ❤️ for hackathons and rapid prototyping.
