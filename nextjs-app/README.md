# AQla Next.js production migration

This directory is the isolated production-migration target for AQla.

## Safety model

- The existing Lovable/TanStack application remains the live reference implementation.
- Production `main` is not replaced by this directory.
- Migration work happens on `agent/nextjs-aws-migration` until verified.
- No production Supabase secret or AWS credential belongs in GitHub.

## Initial stack

- Next.js 15.5.21 App Router
- React 19.2.8
- TypeScript
- Tailwind CSS
- Supabase via `@supabase/ssr`
- AWS target: Amplify Hosting for the web application, then SES for email and managed AWS queue/compute services for high-volume background work

## Migration order

1. Establish a buildable Next.js shell.
2. Connect a non-production/staging Supabase environment.
3. Port shared design system and public read-only pages.
4. Port authentication and authorization.
5. Port assessment and quit-plan workflows.
6. Move email transport to Amazon SES.
7. Move high-volume generation/follow-up jobs to managed AWS queues and compute.
8. Load-test, security-test, accessibility-test and compare against the live application.
9. Cut over DNS only after acceptance testing and rollback planning.

## Important

Do not copy real `.env` values into the repository. Use `.env.example` only as the variable-name contract.
