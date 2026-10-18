# PLN EMI Admin

## Start

```sh
pnpm install
pnpm dev
```

## Scripts

- `pnpm build` builds the app and checks TypeScript.
- `pnpm lint` runs ESLint.
- `pnpm format` formats files with Prettier and sorts Tailwind classes.
- `pnpm format:check` checks formatting without changing files.

File routes live in `src/routes`. TanStack Router generates `src/routeTree.gen.ts` when the dev server or production build starts. Add shadcn/ui components with `pnpm dlx shadcn@latest add <component>`.

## Docker Deployment

Build an image with the API base URL and landing site URL for the target environment:

```sh
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_LANDING_SITE_URL=https://www.example.com \
  -t pln-emi-admin .
```

Both URLs are embedded in the frontend during the image build, so build a separate image for each environment. The build fails if `VITE_API_BASE_URL` or `VITE_LANDING_SITE_URL` is missing.

Run the container on port 3000:

```sh
docker run --rm -p 3000:80 pln-emi-admin
```

Set the API server's `FRONTEND_ORIGIN` to the public origin that serves this frontend, including its scheme and port when present. See [the API documentation](docs/api.md) for the server's origin requirements.
