# Responsive Breadcrumb

**The breadcrumb that always fits.** A measured, responsive breadcrumb component for React and shadcn/ui.

The component measures its real rendered DOM in a hidden tree, solves the best layout in a single pass with a pure TypeScript solver, then truncates, collapses ranges into ellipsis menus, or falls back to a title — it never overflows, at any container width. Collapsed and sibling menus open as popovers on desktop and drawers on mobile.

## Demo

https://github.com/user-attachments/assets/7b48c2ad-be58-41a5-94f5-200d5ab4242e

Live demo (GitHub Pages, deployed from `apps/web`):

**<https://fefedu973.github.io/Responsive-Breadcrumb/>**

The demo page includes:

- **Playground** — one breadcrumb with the main props, in a drag-to-resize stage with device presets and an auto-resize animation.
- **Features** — 14 isolated demos, one per capability: strategies, preferences, truncation, title-only fallback, multiple ellipses, separator tree menus, next-page arrow, pinning, forced collapse & priorities, overflow modes, RTL & localization, loading states, custom rendering, SEO & focus rings.
- **Inspector** — the solver's internals streamed live through `onDebugStateChange`: measured widths, collapsed ranges, truncation results, remaining space.
- **API** — the full props reference, grouped by concern.

## Install

Install with the shadcn CLI, directly from the GitHub registry:

```bash
bunx shadcn@latest add Fefedu973/responsive-breadcrumb/responsive-breadcrumb
```

Or register the GitHub Pages namespace once, then add by name:

```bash
bunx shadcn@latest registry add @responsive-breadcrumb=https://fefedu973.github.io/Responsive-Breadcrumb/r/{name}.json
bunx shadcn@latest add @responsive-breadcrumb/responsive-breadcrumb
```

Then import it from your configured `ui` alias:

```tsx
import { ResponsiveBreadcrumb } from "@/components/ui/responsive-breadcrumb";
```

## Usage

```tsx
<ResponsiveBreadcrumb
  items={[
    { key: "home", label: "Home", href: "/" },
    { key: "docs", label: "Docs", href: "/docs" },
    { key: "guides", label: "Guides", href: "/docs/guides" },
    { key: "page", label: "Current Page" },
  ]}
  strategy="center"          // where the ellipsis appears: start | center | end | none
  preference="minimize-count" // tie-breaker: minimize-count | minimize-visibility | none
  enableTruncation            // shrink long labels before collapsing
  onItemClick={(item) => console.log(item)}
/>
```

Going further:

```tsx
<ResponsiveBreadcrumb
  items={items}
  alwaysShow={{ head: 1, tail: 2 }}            // pin crumbs at each end
  allowMultipleEllipses                         // several collapsed groups (implies grouping="smart")
  separatorNavItems={{ docs: siblingPages }}    // separators become sibling menus
  showNextArrow nextItems={childPages}          // forward arrow after the current page
  showCollapsedCount collapsedCountPlacement="outside" // floating count badge; or "inline"
  isLoading={pending} loadingFallback="custom"  // skeleton while data loads
  customLoadingFallback={<Skeleton className="h-4 w-40" />}
  direction="auto" strings={frenchStrings}      // RTL + localized labels
  schema="json-ld"                              // Schema.org BreadcrumbList
  renderItemLink={({ href, children, onClick }) => (
    <Link href={href} onClick={onClick}>{children}</Link>
  )}
/>
```

## Features

- **Real DOM measurement** — items, separators, ellipsis, next arrow and title-only fallback are measured from a hidden tree that uses your actual renderers, so custom markup stays pixel-accurate. Measurement is keyed and observer-driven, not per-render.
- **Pure single-pass solver** — `solveBreadcrumbLayout.ts` picks the best fitting layout deterministically; no cascading re-layouts, no jumping collapsed ranges.
- **Graceful degradation** — optional label truncation first, then range collapse, then a guaranteed title-only fallback. `overflowBehavior` can switch to native `scroll` or `wrap` instead.
- **Collapse control** — `strategy`, `preference`, `alwaysShow` head/tail pinning, per-item `canCollapse`/`canTruncate`, `forceCollapse`, `itemPriority`, and multi-ellipsis grouping (`smart`/`free`) around pinned crumbs.
- **Navigation menus** — collapsed items, separator sibling menus (tree navigation) and a next-page arrow, all in accessible popovers that become drawers on mobile (`lockOnOverlayOpen` freezes measurement during drawer animations).
- **Fully customizable** — render props for items, separators, ellipsis, title-only, menu rows and link wrappers (bring your router's `Link`).
- **Accessible & international** — single `aria-current` on the current crumb, localizable visible/ARIA labels through `strings`, RTL via `direction`, configurable focus rings for clipped containers.
- **SEO** — server-rendered Schema.org `BreadcrumbList` as JSON-LD, or microdata annotations.
- **Debuggable** — `debug` outlines plus `onDebugStateChange` streaming widths, ranges and remaining space (powers the demo's Inspector).

## How it works

```
items + renderers ──▶ hidden measurement tree (real DOM widths)
                          │
                          ▼
              solveBreadcrumbLayout()  ── pure, deterministic, tested
                          │
                          ▼
                LayoutNode[] ──▶ BreadcrumbRenderer (visible DOM)
```

1. A hidden, `visibility: hidden` tree renders the full breadcrumb, the ellipsis and the title-only fallback with your real renderers, and measures them.
2. The solver enumerates candidate layouts (collapsed ranges, truncated widths) and picks the best one that fits, according to `strategy`, `preference`, pinning and priorities.
3. Only the winning `LayoutNode[]` is rendered. Resizes are picked up by `ResizeObserver`; content changes re-measure via an identity key.

## Project structure

```txt
apps/web/src/components/responsive/   # the published component
  index.ts
  ResponsiveBreadcrumb.tsx            # orchestration: measure → solve → render
  BreadcrumbRenderer.tsx              # visible/measure/menu rendering
  solveBreadcrumbLayout.ts            # pure layout solver
  useBreadcrumbMeasurements.ts        # keyed, observer-driven DOM measurement
  types.ts                            # public API types

apps/web/src/components/demo/         # demo site building blocks
  playground.tsx, feature-demos.tsx, inspector.tsx, api-reference.tsx,
  demo-stage.tsx (drag-to-resize stage), scenarios.tsx, …

apps/web/tests/
  solveBreadcrumbLayout.test.ts       # solver behavior
  responsiveBreadcrumbSource.test.ts  # source invariants

registry.json                         # shadcn registry definition
```

## Development

```bash
bun install

# demo site on http://localhost:3005
bun run --cwd apps/web dev

# checks
bun run --cwd apps/web test
bunx tsc --noEmit -p apps/web/tsconfig.json
bun run registry:validate
bun run registry:build
bun run --cwd apps/web build
```
