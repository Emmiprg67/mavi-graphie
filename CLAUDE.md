# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Marketing/portfolio site for a photographer ("Mavi Graphie"), built with Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS. All user-facing copy is German. There is no database — image content is stored as files on disk, and a lightweight custom auth scheme protects a single admin upload area.

## Commands

```
npm run dev     # start dev server (Next.js, Turbopack)
npm run build   # production build
npm run start   # run the production build
```

There is no lint script, no test runner, and no test files configured in this repo. Type-check manually with `npx tsc --noEmit` if needed.

## Architecture

### Routing (`app/`) vs. shared code (`src/`)
`app/` holds only route entry points (pages, layout, API routes). Actual UI components, copy, hooks, and libs live under `src/` and are imported via the `@/*` path alias (maps to `src/*`, configured in `tsconfig.json`).

### Content is data-driven, not hardcoded
Page copy lives in `src/data/siteContent.ts` (brand info, nav, hero, services, etc.) and `src/data/legalContent.ts` / `src/data/contact.ts`. Section components (`src/components/*Section.tsx`) pull their text from these files rather than inlining strings — when changing copy, edit the data file, not the component.

### Image management: Cloudinary for files, Vercel Blob for the manifest
- Image files (the actual bytes) live on **Cloudinary**, under the `mavi-graphie/uploads/` folder, uploaded via `cloudinary.uploader.upload_stream` (the `cloudinary` npm package). `MediaImage.src` is a Cloudinary delivery URL built with `cloudinary.url(publicId, { quality: "auto", fetch_format: "auto" })` for automatic format/quality optimization; `MediaImage.publicId` is stored so `PATCH`/`DELETE` can call `cloudinary.uploader.destroy()`. Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (manually provisioned — Cloudinary is not on the Vercel Marketplace).
- The lightweight JSON manifest (which images exist, category/order/alt text — a JSON array of `MediaImage`, see `src/types/media.ts`) stays on **Vercel Blob** at a single blob `media.json`, written with `addRandomSuffix: false, allowOverwrite: true` so it always resolves to the same blob. This split is intentional: the manifest needs instant read-after-write consistency on every page load, which Cloudinary's rate-limited Admin API isn't suited for, while Blob's public CDN URL with `cacheControlMaxAge: 0` gives that for free. Requires `BLOB_READ_WRITE_TOKEN`.
- All CRUD goes through `app/api/images/route.ts` (`GET`/`POST`/`PATCH`/`DELETE`, `runtime = "nodejs"`), which mixes Cloudinary calls (file storage) with `put`/`list` from `@vercel/blob` (manifest storage).
- `next.config.ts` allows `res.cloudinary.com` via `images.remotePatterns` so `next/image` can further optimize/resize the already-optimized Cloudinary URLs.
- `GET` supports query params: `home` (home-page images), `photographer` (about/photographer images), `category`, `limit`, and `includeInactive` (requires auth).
- Client-side reads go through `src/hooks/useUploadedImages.ts`, which has a module-level `Map` cache + in-flight request dedup keyed by query string — components sharing the same query reuse one fetch.
- Mutations (`POST`/`PATCH`/`DELETE`) are gated by `canMutate()`: either a valid admin session cookie, or a request header `x-admin-token` matching `ADMIN_UPLOAD_TOKEN` (for scripted/non-browser access).

### Admin auth is hand-rolled, not a library
`src/lib/adminAuth.ts` implements its own signed-cookie session: a JSON payload (`{ sub, exp, sid }`) is base64url-encoded and HMAC-SHA256 signed via Web Crypto (`crypto.subtle`), using `ADMIN_SESSION_SECRET`. No JWT library, no NextAuth. Login (`app/api/admin/login/route.ts`) checks `ADMIN_USERNAME` and a bcrypt hash in `ADMIN_PASSWORD_HASH` (see `.env.example` for how to generate one). All three env vars must be set for `/admin/login` to work at all.

### Route protection uses `proxy.ts`, not `middleware.ts`
This is Next.js 16's renamed middleware convention — `proxy.ts` at the project root exports a `proxy()` function with a `config.matcher`, functionally equivalent to the old `middleware.ts`. It matches `/admin/:path*` and redirects unauthenticated requests to `/admin/login` (and authenticated requests away from the login page).

### Contact form
`app/api/contact/route.ts` validates required fields + privacy checkbox, then sends the submission as an email via the Resend Marketplace integration (`resend` npm package) to `mavi.graphie@gmx.de`, using `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` (the verified sending domain, e.g. `mavi-graphie.com`; the "from" address is `kontakt@<RESEND_EMAIL_DOMAIN>`). The visitor's email is set as `replyTo`. If either env var isn't configured, it returns a 503 explaining the form isn't wired up yet — this is expected in local/dev environments without Resend configured.

### Styling & animation
- Tailwind config (`tailwind.config.ts`) defines the brand palette as named colors (`ivory`, `linen`, `mist`, `greige`, `clay`, `umber`, `graphite`, `gold`, `sage`, etc.) plus matching CSS custom properties in `app/globals.css` — prefer the Tailwind color names over raw hex values.
- No animation library (no framer-motion) — animations are hand-rolled with CSS transitions and custom JS (e.g. slider physics constants in `src/lib/animation.ts`). Respect `src/hooks/useReducedMotion.ts` when adding new motion.

### Environment variables
See `.env.example` for the full list (admin auth, optional upload token, optional contact webhook). Local secrets go in `.env.local` (gitignored).
