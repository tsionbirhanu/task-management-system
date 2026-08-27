# Running Neon Auth on Next.js 16

`@neondatabase/auth` declares `peerOptional next@">=16.0.0"`, and this project
now runs on Next 16.3.3. That means the old `legacy-peer-deps` workaround is no
longer needed.

## Route Protection

The app still protects authenticated pages in `app/(app)/layout.tsx` instead of
middleware. That is a deliberate app-level choice: every data route also checks
the session before touching user data, so the layout guard controls navigation
while the API handlers enforce ownership.

If you later want earlier request rejection, Neon Auth's middleware can be
tested on Next 16 in `proxy.ts`.

## What To Re-Check On Upgrades

- **Bumping `@neondatabase/auth`.** The package is still beta software in the
  auth path. Run `npm run build` and test sign-in/sign-up after upgrades.
- **Changing route handlers.** Dynamic route params are promises on Next 16, so
  handlers under routes like `/api/tasks/[id]` must await `context.params`.
- **Changing lint config.** Next 16 uses ESLint 9 through the ESLint CLI, not
  `next lint`.
