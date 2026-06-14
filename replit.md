# Mariela Martínez Negocios Inmobiliarios

A complete real estate website for Mariela Martínez Negocios Inmobiliarios, a real estate agency based in Paraná, Entre Ríos, Argentina. Includes a public-facing site with property listings, filtering, and WhatsApp integration, plus a protected admin panel for property management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at /api)
- `pnpm --filter @workspace/mariela-inmobiliaria run dev` — run the frontend (served at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Admin Credentials

- URL: `/admin/login`
- Username: `admin`
- Password: `password` (bcrypt hash of "password" seeded — the well-known hash `$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Wouter + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: JWT (jsonwebtoken) + bcryptjs
- File uploads: Multer
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/properties.ts` — Properties table schema
- `lib/db/src/schema/admins.ts` — Admins table schema
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/mariela-inmobiliaria/src/` — React frontend
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware

## Architecture decisions

- Contract-first: OpenAPI spec → Orval codegen → typed React Query hooks and Zod validators
- Upload endpoint NOT in OpenAPI spec (avoids File/Blob TypeScript issues); handled directly with Multer at POST /api/upload
- JWT tokens stored in localStorage under "admin_token" key on the frontend
- Photo arrays stored as `text[]` (PostgreSQL array) in Drizzle schema
- All prices and numbers use Argentine format (periods as thousands separator)

## Product

- Public site: Home with featured properties + agency stats, property search/filter listing, property detail with gallery, About page, Tasaciones (valuation) lead capture, Contact
- Admin panel at /admin: Login, property list, create/edit/delete properties, image upload
- Floating WhatsApp button on every page linking to 5493436214375
- All copy in Argentine Spanish

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` after any schema change before artifact typechecks
- Re-run codegen after any OpenAPI spec changes
- The upload endpoint is NOT in the OpenAPI spec — call POST /api/upload directly with fetch + FormData
- Admin password in seed: "password" (use the known bcrypt hash when re-seeding)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
