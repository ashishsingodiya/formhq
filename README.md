# FormHQ

A Typeform-style form builder where creators design beautiful, themed forms one question at a time, publish them with a single click, and collect responses from anyone with the link — no respondent login required.

## Demo

- **Live Link:** https://formhq.ashish.pro
- **API docs (Scalar):** https://formhq-api.ashish.pro/docs
- **Demo credentials**
  - Email: `demo@ashish.pro`
  - Password: `Pass@123`

The demo account is pre-seeded with 12 themed sample forms, each with 100–150 submissions spread across the last 30 days, so analytics and submission lists are populated out of the box.

## Highlights

- **9 field types** — short text, long text, email, number, single select, multi select, rating, date, yes/no — each with its own validation/display config (Zod discriminated union).
- **One-question-at-a-time builder** with a 16:9 / 9:16 device frame, inline title/description editing on the canvas, and drag-to-reorder fields via `@dnd-kit`.
- **17 theme presets** plus a customize panel that overrides colors, background (solid/gradient/image), typography, shape, and layout. 8 Google Fonts wired through `next/font/google`.
- **Public + Unlisted visibility.** Public forms appear in `/explore`; unlisted forms only resolve via direct link. Unpublished, expired, or response-capped forms are rejected server-side.
- **Per-form analytics** — 30-day submission chart, per-field response rate, distribution for select/yes-no fields, and average rating for rating fields.
- **Share tab** with copy-link, public URL, and QR code (downloadable SVG via `qrcode.react`).
- **Settings tab** for publish state, visibility, response limit, expiry, and form deletion (soft delete).
- **Auto-save form edits** with a debounced save indicator that spins while mutations are in flight.
- **OpenAPI + Scalar docs** generated from the tRPC router via `trpc-to-openapi`. Same router is mounted at both `/trpc` and `/api` (REST).
- **Auth** — email + password (HMAC-SHA256 + per-user salt), JWT in an `httpOnly` cookie, Next.js middleware guards `/dashboard/*` routes.
- **Pre-commit hygiene** — Husky runs `lint-staged` (Prettier) on commit, and commitlint enforces Conventional Commits on commit messages.

## Stack

- **Monorepo** — pnpm workspaces + Turborepo
- **Backend** — Express 5, tRPC v11, `trpc-to-openapi`, Scalar API reference
- **Frontend** — Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, TanStack Query, `@dnd-kit`, recharts, qrcode.react, react-hook-form, sonner
- **Database** — PostgreSQL 15 + Drizzle ORM
- **Validation** — Zod v4 (end-to-end, shared between server and client)
- **Auth** — JWT (`jsonwebtoken`) in httpOnly cookies, HMAC-SHA256 password hashing
- **Tooling** — TypeScript 5.9, ESLint 9, Prettier, Husky, lint-staged, commitlint

## Repository Layout

```
formhq/
├── apps/
│   ├── api/                          # Express server (port 8000)
│   │   └── src/{index,server,env}.ts
│   └── web/                          # Next.js app (port 3000)
│       ├── app/
│       │   ├── (auth)/{login,signup}
│       │   ├── (marketing)/          # landing, /pricing, /explore
│       │   ├── dashboard/            # creator dashboard
│       │   │   └── forms/[slug]/{edit,share,submissions,analytics,settings}
│       │   └── form/[slug]/          # public renderer
│       ├── components/
│       │   ├── builder/              # canvas, sidebar, theme modal, etc.
│       │   ├── renderer/             # themed form preview + primitives
│       │   └── ui/                   # shadcn components
│       ├── hooks/api/{auth,form}/    # typed tRPC hooks
│       ├── lib/                      # field-types, debounce util
│       └── middleware.ts             # auth route guard
├── packages/
│   ├── database/                     # Drizzle schema, migrations, seed
│   │   ├── models/{user,form,form-field,form-submissions}.ts
│   │   ├── drizzle/                  # generated SQL migrations
│   │   └── seed.ts                   # 12 themed sample forms
│   ├── services/                     # business logic
│   │   ├── user/      (UserService — auth, JWT)
│   │   ├── form/      (FormService — CRUD, slug, soft delete)
│   │   ├── form-field/ (FormFieldService — fields, ordering, config)
│   │   └── form-submissions/ (FormSubmissionService — submit gating, analytics)
│   ├── themes/                       # 17 presets + 8 fonts + resolve/merge
│   ├── trpc/
│   │   ├── server/                   # router, procedures, OpenAPI metadata
│   │   └── client/                   # typed client
│   ├── logger/                       # Winston wrapper
│   ├── eslint-config/
│   └── typescript-config/
├── .husky/                           # pre-commit + commit-msg hooks
├── docker-compose.yml                # postgresdb + migrate + api
├── Dockerfile                        # multi-stage: builder → migrator → runner
├── turbo.json
├── pnpm-workspace.yaml
└── commitlint.config.mjs
```

## Database Schema

| Table              | Notes                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`            | email + password (HMAC-SHA256 + salt), `email_verified`, profile image                                                                                                                                           |
| `forms`            | slug (unique, 30 chars), title, description, `is_published`, `published_at`, `visibility` (`PUBLIC` / `UNLISTED`), `theme_config` JSON, `expires_at`, `response_limit`, `created_by`, `deleted_at` (soft delete) |
| `form_fields`      | title (default `"Untitled question"`), `type` (9-value enum), `config` JSON discriminated union, `order` `numeric(scale:2)` (unique per form), `is_required`                                                     |
| `form_submissions` | `form_id`, `values` JSON `[{ formFieldId, value }]`, `created_at`                                                                                                                                                |

`order` uses `numeric(scale:2)` so reordering a field only needs to update that one row's order key (e.g. inserting between `1.00` and `2.00` becomes `1.50`).

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9
- Docker + Docker Compose

### Setup

```bash
# 1. Clone and install
git clone https://github.com/ashishsingodiya/formhq.git formhq
cd formhq
pnpm install

# 2. Copy env file and adjust as needed
cp .env.example .env

# 3. Optional — symlink the root .env into every app/package
./setup.sh

# 4. Start Postgres (Docker)
docker compose up -d postgresdb

# 5. Run migrations
pnpm db:migrate

# 6. Seed demo data (creates demo@email.com / Pass@123 + 12 forms)
pnpm --filter @repo/database db:seed

# 7. Start dev servers
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8000
- API docs (Scalar): http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

### Environment Variables

```env
NODE_ENV=development
PORT=8000
HOST_PORT=8000

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=formhq

DATABASE_URL=postgres://postgres:postgres@localhost:5432/formhq

NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

JWT_SECRET=replace_me_with_a_long_random_string
```

## Scripts

```bash
# Dev
pnpm dev                              # all apps
pnpm --filter web dev                 # web only
pnpm --filter @repo/api dev           # api only

# Database
pnpm db:generate                      # generate Drizzle migration from schema
pnpm db:migrate                       # apply pending migrations
pnpm --filter @repo/database db:seed  # seed demo user + forms + submissions
pnpm --filter @repo/database dev      # open Drizzle Studio

# Build / lint / types
pnpm build
pnpm lint
pnpm check-types
pnpm format                           # Prettier on **/*.{ts,tsx,md}
```

## API

The same tRPC router is exposed two ways:

- **`/trpc`** — typed tRPC client (used by the Next.js app via `@trpc/react-query`)
- **`/api`** — REST surface generated by `trpc-to-openapi`, documented at **`/docs`** (Scalar)

Routers:

| Router   | Procedures                                                                                                                                                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`   | `createUserWithEmailAndPassword`, `signInUserWithEmailAndPassword`, `getLoggedInUserInfo`, `logout`                                                                                                                                                                          |
| `form`   | `createForm`, `listForms`, `listPublicForms`, `getFormBySlug`, `getPublicFormBySlug`, `updateForm`, `deleteForm`, `createField`, `updateField`, `deleteField`, `getFields`, `submitForm`, `listSubmissions`, `listSubmissionsPaginated`, `getAnalytics`, `getDashboardStats` |
| `health` | `getHealth`                                                                                                                                                                                                                                                                  |

Authenticated procedures read the JWT from the `authentication-token` cookie via a tRPC middleware (`authenticatedProcedure` in `packages/trpc/server/trpc.ts`). Public submission, public-form-by-slug, and the public forms listing are open.

Server-side gating on `submitForm`: rejects if the form is missing/soft-deleted, not published, past `expiresAt`, or already at `responseLimit`.

## Form Builder

The builder canvas is a fixed-ratio frame (16:9 landscape or 9:16 portrait) centered on a muted background. Title and description are edited inline on the canvas; the right sidebar holds the answer-type dropdown plus per-type validation/display settings. The left panel lists fields with drag handles powered by `@dnd-kit/sortable`. Theme presets and the customize panel live in a modal. All edits auto-save with a debounced mutation; the header shows a spinning indicator while saves are in flight.

## Theming

`@repo/themes` exposes:

- **18 presets** — Default, Ocean, Mono, Midnight, Rose, Amber, Slate, Crimson, Aurora, Lavender, Mountain, Forest, Cosmos, Blossom, Winter, Beach, Desert
- **8 fonts** via `next/font/google` — Geist, Inter, DM Sans, Space Grotesk, Lora, Playfair Display, Instrument Serif, JetBrains Mono
- `resolveTheme(config)` — merges a preset with optional overrides
- `themeToCssVars(theme)` — emits CSS variables consumed by the renderer

Each form stores a `themeConfig: { presetId, overrides? }` JSON column. The public renderer wraps the form in a themed shell and applies the resolved CSS variables, so themes work for both creators (preview) and respondents (live).

## Git Hooks

- **`pre-commit`** runs `lint-staged`, which formats staged `.ts/.tsx/.js/.jsx/.mjs/.cjs/.json/.md/.css/.yml/.yaml` files with Prettier.
- **`commit-msg`** runs `commitlint` with `@commitlint/config-conventional`, so commits must follow Conventional Commits (`feat: …`, `fix: …`, `chore: …`, etc.).

## Deployment

The included `Dockerfile` is a multi-stage build:

1. **`builder`** — installs all workspace deps, builds `@repo/api`, and produces an isolated prod-only deploy at `/prod/api` via `pnpm --filter @repo/api deploy --prod`.
2. **`migrator`** — reuses the builder image and runs `drizzle-kit migrate` against `DATABASE_URL`.
3. **`runner`** — minimal Node image, copies the prod deploy and runs `node dist/index.js`.

`docker-compose.yml` wires together `postgresdb` (with healthcheck), a one-shot `migrate` service, and the `api` service that waits on both.

The Next.js app deploys independently (Vercel, Netlify, or any Node host).
