# Running Neon Auth on Next.js 14

`@neondatabase/auth` declares `peerOptional next@">=16.0.0"`. Every published
version has, going back to `0.1.0-beta.1` — there is no release that targets
Next 14. This project is pinned to Next 14.2.35, so the pairing is unsupported
by Neon. It does work, with two conditions.

## 1. Installs need `legacy-peer-deps`

Without it, `npm install` and `npm ci` both fail with `ERESOLVE`. The repo's
`.npmrc` sets `legacy-peer-deps=true` so this is automatic for everyone,
including CI. Do not remove it while Next is on 14.

## 2. No Edge middleware

`auth.middleware()` does not work here. Bundled for Next 14's Edge runtime it
pulls in `CompressionStream` / `DecompressionStream` — the SDK compresses
session cookies — and Next 14 reports:

```
A Node.js API is used (CompressionStream at line: 10) which is not supported
in the Edge Runtime.
```

The build still succeeds, so this fails at runtime rather than at compile time,
which is the worst way for it to fail.

Route protection therefore lives in `app/(app)/layout.tsx`, a server component
on the Node runtime, where those globals exist. `app/api/auth/[...path]/route.ts`
is a Node route handler for the same reason. With no `middleware.ts` in the
project, the build is clean — zero warnings.

Guarding in the layout is a real trade: middleware would reject unauthenticated
requests before any rendering work, while the layout guard runs after the route
is entered. For this app that is acceptable — every data path is a route
handler that checks the session itself, so the layout guard is about navigation,
not data protection.

## What to re-check on any upgrade

- **Bumping `@neondatabase/auth`.** Nothing stops a patch release from adopting
  a Next 16 API. Run `npx next build` and confirm zero warnings.
- **Bumping Next to 16+.** Both conditions above disappear: drop `.npmrc`, and
  `auth.middleware()` becomes usable in `proxy.ts` (Next 16's name for
  `middleware.ts`).

## Also worth knowing

- The package is `0.5.0-beta`. It is pre-1.0 software in the authentication
  path.
- Legacy Neon Auth (Stack Auth, `@stackframe/stack`) does support `next >=14.1`,
  but Neon closed it to new projects: "no longer available for new projects but
  remains supported for existing users." It is not an option for a new project.
- The Better Auth client adds weight to the pages that import it: `/login` and
  `/signup` are ~233 kB First Load JS against ~97 kB for `/board`.
