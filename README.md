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
