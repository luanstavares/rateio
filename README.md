This is a [Next.js](https://nextjs.org/) homepage for Rate.io, styled with Tailwind CSS 4 and shadcn/ui.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the homepage.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## API integration

The typed client is generated from the NestJS API OpenAPI document. Start the
API on its default port in one terminal, then regenerate the client from the
web app directory:

```bash
# rateio-api-latest-nestjs
npm run start:dev

# rateio-web-app
npm run api:generate
```

Set `OPENAPI_SOURCE` when the API document is not at the local default:

```bash
OPENAPI_SOURCE=https://api.example.com/openapi.json npm run api:generate
```

Run the contract drift check after starting the API locally:

```bash
npm run api:check
```

The check regenerates `lib/api/generated/` and fails when the generated output
differs from the committed client. Review and commit regenerated output when
the API contract intentionally changes; do not edit generated files by hand.

`NEXT_PUBLIC_API_BASE_URL` controls runtime requests and defaults to
`http://localhost:3000`. It is separate from `OPENAPI_SOURCE`, which is only
used while generating `lib/api/generated/`. Generated files are disposable and
must not be edited manually.

Realtime browser sessions use the HttpOnly session cookies directly. When the
frontend and API use sibling hosts in production, set
`RATEIO_COOKIE_DOMAIN=.example.com` so the browser can send the cookies to both
hosts. Leave it unset when both services use the exact same host. The API's
`CORS_ORIGIN` must be the exact frontend origin, not `*`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Persistent user session

The root `UserProvider` exposes `useUser()` across page navigation. Its TanStack
Query identity read revalidates on navigation, window focus, reconnect, and every
60 seconds while active. Logout and explicit session refresh use shared TanStack
mutations. BroadcastChannel synchronizes login/logout between tabs; browser locks
serialize explicit refresh and logout when available. Backend transactional
rotation also coordinates requests across web instances.

Access cookies follow the API's `accessExpiresAt` and last at most one day.
Refresh cookies follow the API's sliding 90-day expiry. Both remain HttpOnly,
SameSite=Lax, and Secure in production. Tokens are never placed in React state or
localStorage. The proxy renews expired, near-expiry, or legacy access JWTs before
server components and actions run.

A temporary refresh failure returns a retryable response and preserves cookies.
Invalid refresh credentials remove authentication from the current request;
automatic failures do not emit deletion cookies that could erase a concurrently
renewed session. Explicit successful logout revokes the backend session and
clears cookies. Invalid persisted cookies can remain until logout, expiry, or a
successful login; they do not authorize backend access.

Identity changes cancel outstanding queries, discard account data, refresh
server-rendered pages, and disconnect authenticated rateio/notification sockets.
If the backend is temporarily unavailable, the mounted user query retains its
last successful identity and exposes an error rather than silently signing out.

Run `npm run test:auth` for the focused infrastructure regressions. This uses
Node's built-in test runner and the existing TypeScript dependency; it installs
no browser or React test harness. Use the normal `npm run typecheck`,
`npm run lint`, and `npm run build` checks as well.
