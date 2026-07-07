import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const responsiveDir = new URL("../src/components/responsive/", import.meta.url);

function readSource(fileName: string) {
  return readFileSync(new URL(fileName, responsiveDir), "utf8");
}

const renderer = readSource("BreadcrumbRenderer.tsx");
const component = readSource("ResponsiveBreadcrumb.tsx");
const measurements = readSource("useBreadcrumbMeasurements.ts");
const types = readSource("types.ts");

assert.match(
  component,
  /mode="measure"[\s\S]*layout=\{fullMeasurementLayout\}[\s\S]*measurementScope="full"/,
  "full measurement layout is rendered by BreadcrumbRenderer",
);

assert.match(
  component,
  /mode="measure"[\s\S]*layout=\{ellipsisMeasurementLayout\}[\s\S]*measurementScope="ellipsis"/,
  "ellipsis measurement layout is rendered by BreadcrumbRenderer",
);

assert.match(
  component,
  /mode="measure"[\s\S]*layout=\{titleOnlyMeasurementLayout\}[\s\S]*measurementScope="title-only"/,
  "title-only measurement layout is rendered by BreadcrumbRenderer",
);

assert.match(
  measurements,
  /querySelector<HTMLElement>\('\[data-measure-list="full"\]'\)/,
  "measurement gap is read from the full BreadcrumbList",
);

assert.match(
  renderer,
  /data-measure-item=\{\s*isMeasure && measurementScope === "full" \? index : undefined\s*\}/,
  "item measurements are scoped to the full measurement layout",
);

assert.match(
  renderer,
  /data-measure-ellipsis=\{\s*isMeasure && measurementScope === "ellipsis" \? "" : undefined\s*\}/,
  "ellipsis measurement is scoped to the ellipsis measurement layout",
);

assert.match(
  renderer,
  /data-measure-next=\{\s*isMeasure && measurementScope === "full" \? "" : undefined\s*\}/,
  "next-arrow measurement is scoped to the full measurement layout",
);

assert.match(
  renderer,
  /data-measure-title-only=\{\s*isMeasure && measurementScope === "title-only" \? "" : undefined\s*\}/,
  "title-only measurement is scoped to the title-only measurement layout",
);

assert.match(
  component,
  /const validOverlayIds = React\.useMemo/,
  "valid overlay ids are derived from the current layout",
);

assert.match(
  component,
  /if \(openOverlay && !validOverlayIds\.has\(openOverlay\)\) \{\s*setOpenOverlay\(null\);/,
  "stale overlay ids are cleared when the layout changes",
);

assert.match(
  component,
  /getLayoutWidth\(untruncatedFullLayout, measurements\.gap\) >\s*measurements\.containerWidth/,
  "truncation is attempted before collapse when the full layout overflows",
);

assert.doesNotMatch(
  component,
  /untruncatedLayout\.some\(\(node\) => node\.type === "title-only"\)/,
  "truncation is not delayed until after title-only fallback",
);

assert.match(types, /renderMenuItem\?:/, "renderMenuItem is part of the public API");
assert.match(
  renderer,
  /renderMenuItem\?\.\(\{ item, mode: "menu", disabled \}\)/,
  "menu overlays use renderMenuItem when provided",
);

console.log("responsive breadcrumb source tests passed");
