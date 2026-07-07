# Responsive Breadcrumb

A measured, responsive breadcrumb component for React and shadcn/ui.

The component measures real rendered DOM widths, solves a responsive layout with a pure TypeScript layout solver, and renders collapsed breadcrumb ranges through accessible popovers or mobile drawers.

## Demo

The demo app is deployed with GitHub Pages from `apps/web`.

After the first successful workflow run, the site will be available at:

```txt
https://fefedu973.github.io/responsive-breadcrumb/
```

## Install With shadcn

Install directly from the GitHub registry:

```bash
bunx shadcn@latest add Fefedu973/responsive-breadcrumb/responsive-breadcrumb
```

Or register the GitHub Pages namespace:

```bash
bunx shadcn@latest registry add @responsive-breadcrumb=https://fefedu973.github.io/responsive-breadcrumb/r/{name}.json
bunx shadcn@latest add @responsive-breadcrumb/responsive-breadcrumb
```

Use it from your configured shadcn `ui` alias:

```tsx
import { ResponsiveBreadcrumb } from "@/components/ui/responsive-breadcrumb";
```

## Features

- Real DOM measurement for items, separators, ellipsis, next controls, and title-only fallback.
- Pure solver in `solveBreadcrumbLayout.ts`.
- Single contiguous collapse by default.
- Optional multi-ellipsis mode.
- Non-collapsible head/tail items with `alwaysShow`.
- Programmatic pre-collapse with `forceCollapse`.
- Priority-aware collapse with `itemPriority`.
- Title-only fallback for very small containers.
- Optional truncation before collapse for long labels.
- Optional scroll and wrap overflow modes.
- Accessible popover and drawer overlays.
- Custom menu item rendering with `renderMenuItem`.
- Localizable visible and ARIA labels through `strings`.
- Optional Schema.org JSON-LD or microdata.
- Focused solver tests.

## Project Structure

```txt
apps/web/src/components/responsive/
  index.ts
  ResponsiveBreadcrumb.tsx
  BreadcrumbRenderer.tsx
  solveBreadcrumbLayout.ts
  useBreadcrumbMeasurements.ts
  types.ts

registry.json

apps/web/tests/
  solveBreadcrumbLayout.test.ts
  responsiveBreadcrumbSource.test.ts
```

Local experiments and old implementations are intentionally not published.

## Development

Install dependencies:

```bash
bun install
```

Run the demo locally:

```bash
bun run --cwd apps/web dev
```

Open:

```txt
http://localhost:3005
```

Run checks:

```bash
bun run --cwd apps/web test
bunx tsc --noEmit -p apps/web/tsconfig.json
bun run registry:validate
bun run registry:build
bun run --cwd apps/web build
```

## GitHub Pages Deployment

The workflow at `.github/workflows/deploy-pages.yml` runs on pushes to `main`.

It:

1. Installs dependencies with Bun.
2. Runs solver tests.
3. Runs TypeScript.
4. Builds the shadcn registry JSON into `apps/web/public/r`.
5. Builds the Next.js demo as a static export.
6. Uploads `apps/web/out` to GitHub Pages.
