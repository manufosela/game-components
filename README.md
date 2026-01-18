# Component Catalog

This monorepo hosts web components and their demos. Each component lives under `packages/*` with its own `demo/` folder and tests.

## Structure
- `packages/*`: individual component packages and demos.
- `apps/site`: Astro catalog that renders the component list and demo pages.

## Commands
- `pnpm install`: install dependencies.
- `pnpm test`: run package tests (web-test-runner by default).
- `pnpm site:dev`: run the Astro catalog locally.
- `pnpm site:build`: build the static catalog for GitHub Pages.

## Publishing
Packages are scoped under `@manufosela/*` and should be versioned with Changesets.
