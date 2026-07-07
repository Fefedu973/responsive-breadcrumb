"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { BreadcrumbRenderer } from "./BreadcrumbRenderer";
import {
  getLayoutRange,
  getLayoutRanges,
  getLayoutWidth,
  solveBreadcrumbLayout,
} from "./solveBreadcrumbLayout";
import type {
  BreadcrumbAnimation,
  BreadcrumbData,
  BreadcrumbDebugState,
  BreadcrumbFocusRing,
  BreadcrumbItemDisplay,
  BreadcrumbPathTruncationOptions,
  BreadcrumbSelectedRing,
  BreadcrumbTruncationMode,
  LayoutNode,
  ResponsiveBreadcrumbProps,
  ResponsiveBreadcrumbStrings,
  SeparatorNavItem,
} from "./types";
import { useBreadcrumbMeasurements } from "./useBreadcrumbMeasurements";

const DEFAULT_STRINGS: ResponsiveBreadcrumbStrings = {
  navigateTo: (label) => `Navigate to ${label}`,
  showCollapsedItems: (count) =>
    count === 1
      ? "Show collapsed breadcrumb item"
      : `Show ${count} collapsed breadcrumb items`,
  moreOptions: "More options",
  nextItems: "Next items",
  showSiblingItems: (label) => `Show navigation options for ${label}`,
  noItemsAvailable: "No items available",
  itemLabelFallback: "item",
  truncatedItemTooltip: (label) => label,
  measureEllipsis: "Measure ellipsis",
  measureNextItems: "Measure next items",
};

type SelectedRingRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function ResponsiveBreadcrumb({
  items,
  renderSeparator,
  renderItem,
  renderEllipsis,
  renderTitleOnly,
  renderMenuItem,
  renderItemLink,
  renderMenuLink,
  strategy = "start",
  preference = "none",
  showHomeIcon = true,
  showNextArrow = false,
  nextItems = [],
  separatorNavItems = {},
  onItemClick,
  className,
  titleOnlyFallback,
  titleOnlyIcon,
  titleOnlyCustomElement,
  debug = false,
  onDebugStateChange,
  enableTruncation = false,
  truncateMinWidth = 60,
  truncateMaxWidth = 200,
  truncateThreshold = 100,
  truncateOrder = "biggest-first",
  truncationMode = "width",
  pathTruncation,
  compactReveal,
  showTooltipOnTruncate = true,
  allowMultipleEllipses = false,
  grouping = "contiguous",
  showCurrentInNav = "never",
  loadingFallback = "none",
  customLoadingFallback,
  customEllipsisElement,
  isLoading = false,
  lockOnOverlayOpen = true,
  overflowBehavior = "collapse",
  focusRing,
  selectedRing = "none",
  selectedKey,
  selectedIndex,
  selectedRingClassName,
  animateLayout = false,
  fallbackAtWidth,
  lastItemClickable = false,
  schema = "json-ld",
  showCollapsedCount = false,
  strings,
  clickableLeftOfEllipsis = false,
  separatorNavSide = "right",
  forceCollapse,
  itemPriority,
  direction = "auto",
  alwaysShow,
}: ResponsiveBreadcrumbProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [openOverlay, setOpenOverlay] = React.useState<string | null>(null);
  const [internalCompactRevealIndex, setInternalCompactRevealIndex] =
    React.useState<number | null>(null);
  const [selectedRingRect, setSelectedRingRect] =
    React.useState<SelectedRingRect | null>(null);
  const [detectedDirection, setDetectedDirection] = React.useState<"ltr" | "rtl">(
    "ltr",
  );

  const measurementLocked = lockOnOverlayOpen && openOverlay !== null;
  const isRtl =
    direction === "rtl" || (direction === "auto" && detectedDirection === "rtl");
  const headCount = alwaysShow?.head ?? 1;
  const tailCount = alwaysShow?.tail ?? 1;
  const includeNextArrow = showNextArrow && nextItems.length > 0;
  const resolvedFocusRing =
    focusRing ?? (overflowBehavior === "collapse" ? "inset" : "outer");
  const compactRevealIndex =
    compactReveal?.controlledIndex ?? internalCompactRevealIndex;
  const setCompactRevealIndex = React.useCallback(
    (index: number | null) => {
      if (compactReveal?.controlledIndex === undefined) {
        setInternalCompactRevealIndex(index);
      }

      compactReveal?.onControlledIndexChange?.(index);
    },
    [compactReveal],
  );
  const resolvedStrings = React.useMemo(
    () => ({ ...DEFAULT_STRINGS, ...strings }),
    [strings],
  );
  const resolvedTitleOnlyFallback = React.useMemo(() => {
    if (isLoading && loadingFallback === "custom" && customLoadingFallback) {
      return customLoadingFallback;
    }

    if (isLoading && loadingFallback === "title") {
      return titleOnlyFallback ?? items.at(-1)?.label ?? "";
    }

    return titleOnlyFallback ?? items.at(-1)?.label ?? "";
  }, [
    customLoadingFallback,
    isLoading,
    items,
    loadingFallback,
    titleOnlyFallback,
  ]);
  const measurements = useBreadcrumbMeasurements({
    containerRef,
    measureRef,
    locked: measurementLocked,
  });
  const itemWidths = React.useMemo(
    () => normalizeMeasuredWidths(measurements.itemWidths, items.length),
    [items.length, measurements.itemWidths],
  );
  const compactTokenWidths = React.useMemo(
    () => normalizeMeasuredWidths(measurements.compactTokenWidths, items.length),
    [items.length, measurements.compactTokenWidths],
  );
  const separatorWidths = React.useMemo(
    () =>
      normalizeMeasuredWidths(
        measurements.separatorWidths,
        Math.max(0, items.length - 1),
      ),
    [items.length, measurements.separatorWidths],
  );
  const hasCurrentMeasurements =
    measurements.ready &&
    measurements.itemWidths.length === items.length &&
    measurements.separatorWidths.length === Math.max(0, items.length - 1);

  React.useEffect(() => {
    if (direction !== "auto") {
      return;
    }

    const root = document.documentElement;
    const computedDirection = window.getComputedStyle(root).direction;
    setDetectedDirection(computedDirection === "rtl" ? "rtl" : "ltr");
  }, [direction]);

  const untruncatedFullLayout = React.useMemo(
    () =>
      buildFullLayout({
        items,
        itemWidths,
        separatorWidths,
        includeNextArrow,
        nextArrowWidth: measurements.nextArrowWidth,
      }),
    [
      includeNextArrow,
      items,
      itemWidths,
      measurements.nextArrowWidth,
      separatorWidths,
    ],
  );

  const buildLayoutForWidths = React.useCallback(
    (itemWidths: number[], fullLayoutForWidths: LayoutNode[]) => {
      if (items.length === 0) {
        return [];
      }

      if (isLoading && loadingFallback === "custom" && customLoadingFallback) {
        return titleOnlyLayout(measurements.titleOnlyWidth);
      }

      if (isLoading && loadingFallback === "title") {
        return titleOnlyLayout(measurements.titleOnlyWidth);
      }

      if (overflowBehavior !== "collapse") {
        return fullLayoutForWidths;
      }

      if (!hasCurrentMeasurements) {
        return titleOnlyLayout(measurements.titleOnlyWidth);
      }

      if (
        typeof fallbackAtWidth === "number" &&
        measurements.containerWidth <= fallbackAtWidth
      ) {
        return titleOnlyLayout(measurements.titleOnlyWidth);
      }

      return solveBreadcrumbLayout({
        availableWidth: measurements.containerWidth,
        itemWidths,
        separatorWidths,
        ellipsisWidth: measurements.ellipsisWidth,
        nextArrowWidth: measurements.nextArrowWidth,
        titleOnlyWidth: measurements.titleOnlyWidth,
        gapWidth: measurements.gap,
        includeNextArrow,
        options: {
          strategy,
          preference,
          canCollapse: items.map((item, index) =>
            getCanCollapse(item, index, items.length),
          ),
          forcedCollapsed: items.map((item, index) =>
            forceCollapse?.(item, index) ?? false,
          ),
          itemPriority: itemPriority
            ? items.map((item, index) => itemPriority(item, index))
            : undefined,
          alwaysShowHead: headCount,
          alwaysShowTail: tailCount,
          allowTitleOnly: true,
          allowMultipleEllipses,
          grouping,
        },
      });
    },
    [
      allowMultipleEllipses,
      customLoadingFallback,
      fallbackAtWidth,
      forceCollapse,
      grouping,
      hasCurrentMeasurements,
      headCount,
      includeNextArrow,
      isLoading,
      itemPriority,
      items,
      loadingFallback,
      measurements.containerWidth,
      measurements.ellipsisWidth,
      measurements.gap,
      measurements.nextArrowWidth,
      measurements.titleOnlyWidth,
      overflowBehavior,
      preference,
      separatorWidths,
      strategy,
      tailCount,
    ],
  );

  const titleOnlyForcedByLoading =
    isLoading &&
    (loadingFallback === "title" ||
      (loadingFallback === "custom" && Boolean(customLoadingFallback)));
  const titleOnlyForcedByWidth =
    typeof fallbackAtWidth === "number" &&
    measurements.containerWidth <= fallbackAtWidth;
  const shouldTryTruncation =
    enableTruncation &&
    overflowBehavior === "collapse" &&
    hasCurrentMeasurements &&
    !titleOnlyForcedByLoading &&
    !titleOnlyForcedByWidth &&
    getLayoutWidth(untruncatedFullLayout, measurements.gap) >
      measurements.containerWidth;

  const truncation = React.useMemo(
    () =>
      computeTruncation({
        items,
        itemWidths,
        compactTokenWidths,
        separatorWidths,
        availableWidth: measurements.containerWidth,
        gapWidth: measurements.gap,
        includeNextArrow,
        nextArrowWidth: measurements.nextArrowWidth,
        enabled: shouldTryTruncation,
        truncateMinWidth,
        truncateMaxWidth,
        truncateThreshold,
        truncateOrder,
        truncationMode,
        compactRevealIndex,
        compactReveal,
        alwaysShowHead: headCount,
        alwaysShowTail: tailCount,
      }),
    [
      compactReveal,
      compactRevealIndex,
      compactTokenWidths,
      headCount,
      includeNextArrow,
      items,
      itemWidths,
      measurements.containerWidth,
      measurements.gap,
      measurements.nextArrowWidth,
      separatorWidths,
      shouldTryTruncation,
      truncateMaxWidth,
      truncateMinWidth,
      truncateOrder,
      truncateThreshold,
      truncationMode,
      tailCount,
    ],
  );

  const fullLayout = React.useMemo(
    () =>
      buildFullLayout({
        items,
        itemWidths: truncation.itemWidths,
        separatorWidths,
        includeNextArrow,
        nextArrowWidth: measurements.nextArrowWidth,
      }),
    [
      includeNextArrow,
      items,
      measurements.nextArrowWidth,
      separatorWidths,
      truncation.itemWidths,
    ],
  );

  const layout = React.useMemo(
    () => buildLayoutForWidths(truncation.itemWidths, fullLayout),
    [buildLayoutForWidths, fullLayout, truncation.itemWidths],
  );
  const selectedRingTargetIndex = React.useMemo(() => {
    if (selectedRing !== "overlay") {
      return null;
    }

    if (typeof selectedIndex === "number") {
      return selectedIndex >= 0 && selectedIndex < items.length
        ? selectedIndex
        : null;
    }

    if (selectedKey) {
      const index = items.findIndex((item) => item.key === selectedKey);
      return index >= 0 ? index : null;
    }

    return items.length > 0 ? items.length - 1 : null;
  }, [items, selectedIndex, selectedKey, selectedRing]);

  const updateSelectedRingRect = React.useCallback(() => {
    const container = containerRef.current;

    if (selectedRingTargetIndex === null || !container) {
      setSelectedRingRect(null);
      return;
    }

    const target = container.querySelector<HTMLElement>(
      `[data-breadcrumb-renderer="visible"] [data-breadcrumb-item-index="${selectedRingTargetIndex}"]`,
    );

    if (!target) {
      setSelectedRingRect(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setSelectedRingRect({
      left: targetRect.left - containerRect.left,
      top: targetRect.top - containerRect.top,
      width: targetRect.width,
      height: targetRect.height,
    });
  }, [selectedRingTargetIndex]);

  React.useLayoutEffect(() => {
    updateSelectedRingRect();
  }, [
    layout,
    measurements.signature,
    selectedRingTargetIndex,
    updateSelectedRingRect,
  ]);

  React.useLayoutEffect(() => {
    if (selectedRingTargetIndex === null) {
      return;
    }

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateSelectedRingRect());
    observer.observe(container);

    const target = container.querySelector<HTMLElement>(
      `[data-breadcrumb-renderer="visible"] [data-breadcrumb-item-index="${selectedRingTargetIndex}"]`,
    );

    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [selectedRingTargetIndex, updateSelectedRingRect]);

  const validOverlayIds = React.useMemo(() => {
    const ids = new Set<string>();

    layout.forEach((node, nodeIndex) => {
      if (node.type === "ellipsis") {
        ids.add(`ellipsis-${node.from}-${node.to}`);
        return;
      }

      if (node.type === "next" && nextItems.length > 0) {
        ids.add("next");
        return;
      }

      if (node.type === "separator") {
        const overlayId = getSeparatorOverlayId({
          node,
          layout,
          nodeIndex,
          items,
          separatorNavItems,
          clickableLeftOfEllipsis,
          separatorNavSide,
          showCurrentInNav,
        });

        if (overlayId) {
          ids.add(overlayId);
        }
      }
    });

    return ids;
  }, [
    clickableLeftOfEllipsis,
    items,
    layout,
    nextItems.length,
    separatorNavItems,
    separatorNavSide,
    showCurrentInNav,
  ]);

  React.useEffect(() => {
    if (openOverlay && !validOverlayIds.has(openOverlay)) {
      setOpenOverlay(null);
    }
  }, [openOverlay, validOverlayIds]);

  const schemaJson = React.useMemo(() => {
    if (schema !== "json-ld") {
      return null;
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: primitiveLabel(item.label) || item.key,
        item: item.href,
      })),
    };

    return JSON.stringify(schemaData).replace(/</g, "\\u003c");
  }, [items, schema]);

  React.useEffect(() => {
    if (!debug || !onDebugStateChange) {
      return;
    }

    const collapsedRange = getLayoutRange(layout);
    const collapsedGroups = getLayoutRanges(layout);
    const usedWidth = getLayoutWidth(layout, measurements.gap);
    const visibleItemsCount = layout.filter((node) => node.type === "item").length;
    const collapsedItemsCount = collapsedGroups.reduce(
      (sum, range) => sum + range.b - range.a + 1,
      0,
    );
    const debugState: BreadcrumbDebugState = {
      containerWidth: measurements.containerWidth,
      availableWidth: measurements.containerWidth,
      usedWidth,
      remainingSpace: measurements.containerWidth - usedWidth,
      itemWidths,
      separatorWidths,
      ellipsisWidth: measurements.ellipsisWidth,
      nextArrowWidth: measurements.nextArrowWidth,
      titleOnlyWidth: measurements.titleOnlyWidth,
      gap: measurements.gap,
      collapsedRange,
      collapsedGroups,
      showTitleOnly: layout.some((node) => node.type === "title-only"),
      strategy,
      preference,
      totalItemsCount: items.length,
      visibleItemsCount,
      collapsedItemsCount,
      measurementLocked,
      truncatedItems: truncation.truncatedWidths,
      truncationEnabled: enableTruncation,
    };

    onDebugStateChange(debugState);
  }, [
    debug,
    enableTruncation,
    items.length,
    itemWidths,
    layout,
    measurementLocked,
    measurements.containerWidth,
    measurements.ellipsisWidth,
    measurements.gap,
    measurements.nextArrowWidth,
    measurements.titleOnlyWidth,
    onDebugStateChange,
    preference,
    separatorWidths,
    strategy,
    truncation.truncatedWidths,
  ]);

  const breadcrumb = (
    <BreadcrumbRenderer
      items={items}
      layout={layout}
      mode="visible"
      isMobile={isMobile}
      openOverlay={openOverlay}
      onOpenOverlayChange={setOpenOverlay}
      renderSeparator={renderSeparator}
      renderItem={renderItem}
      renderEllipsis={renderEllipsis}
      renderTitleOnly={renderTitleOnly}
      renderMenuItem={renderMenuItem}
      renderItemLink={renderItemLink}
      renderMenuLink={renderMenuLink}
      showHomeIcon={showHomeIcon}
      showNextArrow={showNextArrow}
      nextItems={nextItems}
      separatorNavItems={separatorNavItems}
      onItemClick={onItemClick}
      titleOnlyFallback={resolvedTitleOnlyFallback}
      titleOnlyIcon={titleOnlyIcon}
      titleOnlyCustomElement={titleOnlyCustomElement}
      customEllipsisElement={customEllipsisElement}
      lastItemClickable={lastItemClickable}
      showCollapsedCount={showCollapsedCount}
      strings={resolvedStrings}
      clickableLeftOfEllipsis={clickableLeftOfEllipsis}
      separatorNavSide={separatorNavSide}
      overflowBehavior={overflowBehavior}
      focusRing={resolvedFocusRing}
      truncatedWidths={truncation.truncatedWidths}
      itemDisplays={truncation.displays}
      pathTruncation={pathTruncation}
      compactReveal={compactReveal}
      compactRevealIndex={compactRevealIndex}
      onCompactRevealIndexChange={setCompactRevealIndex}
      animateLayout={animateLayout}
      showTooltipOnTruncate={showTooltipOnTruncate}
      schema={schema}
      showCurrentInNav={showCurrentInNav}
      debug={debug}
      isRtl={isRtl}
    />
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative min-w-0 max-w-full", className)}
      data-responsive-breadcrumb=""
      data-focus-ring={resolvedFocusRing}
    >
      {schemaJson ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      ) : null}
      {isLoading && loadingFallback === "none" ? null : overflowBehavior === "scroll" ? (
        <div className="max-w-full overflow-x-auto overflow-y-hidden">
          <div className="min-w-max">{breadcrumb}</div>
        </div>
      ) : (
        breadcrumb
      )}
      {selectedRing === "overlay" && selectedRingRect ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute rounded-md ring-2 ring-ring/50 transition-[left,top,width,height,opacity] duration-150 ease-out motion-reduce:transition-none",
            selectedRingClassName,
          )}
          style={{
            left: `${selectedRingRect.left}px`,
            top: `${selectedRingRect.top}px`,
            width: `${selectedRingRect.width}px`,
            height: `${selectedRingRect.height}px`,
          }}
        />
      ) : null}
      <MeasurementTree
        ref={measureRef}
        items={items}
        renderSeparator={renderSeparator}
        renderItem={renderItem}
        renderEllipsis={renderEllipsis}
        renderTitleOnly={renderTitleOnly}
        renderMenuItem={renderMenuItem}
        renderItemLink={renderItemLink}
        renderMenuLink={renderMenuLink}
        isMobile={isMobile}
        showHomeIcon={showHomeIcon}
        showNextArrow={showNextArrow}
        nextItems={nextItems}
        separatorNavItems={separatorNavItems}
        separatorNavSide={separatorNavSide}
        showCurrentInNav={showCurrentInNav}
        titleOnlyFallback={resolvedTitleOnlyFallback}
        titleOnlyIcon={titleOnlyIcon}
        titleOnlyCustomElement={titleOnlyCustomElement}
        customEllipsisElement={customEllipsisElement}
        lastItemClickable={lastItemClickable}
        showCollapsedCount={showCollapsedCount}
        clickableLeftOfEllipsis={clickableLeftOfEllipsis}
        strings={resolvedStrings}
        focusRing={resolvedFocusRing}
        compactReveal={compactReveal}
        animateLayout={animateLayout}
        isRtl={isRtl}
      />
    </div>
  );
}

export const FinalResponsiveBreadcrumb = ResponsiveBreadcrumb;
export default ResponsiveBreadcrumb;
export type {
  BreadcrumbAnimation,
  BreadcrumbData,
  BreadcrumbDebugState,
  CollapsePreference,
  CollapseStrategy,
  BreadcrumbCompactRevealOptions,
  BreadcrumbFocusRing,
  BreadcrumbItemDisplay,
  BreadcrumbPathTruncationOptions,
  BreadcrumbSelectedRing,
  BreadcrumbTruncationMode,
  LayoutNode,
  ResponsiveBreadcrumbProps,
  SeparatorNavItem,
} from "./types";

const noopOpenOverlayChange = () => undefined;
const noopCompactRevealChange = (_index: number | null) => undefined;

const MeasurementTree = React.forwardRef<
  HTMLDivElement,
  {
    items: BreadcrumbData[];
    renderSeparator?: ResponsiveBreadcrumbProps["renderSeparator"];
    renderItem?: ResponsiveBreadcrumbProps["renderItem"];
    renderEllipsis?: ResponsiveBreadcrumbProps["renderEllipsis"];
    renderTitleOnly?: ResponsiveBreadcrumbProps["renderTitleOnly"];
    renderMenuItem?: ResponsiveBreadcrumbProps["renderMenuItem"];
    renderItemLink?: ResponsiveBreadcrumbProps["renderItemLink"];
    renderMenuLink?: ResponsiveBreadcrumbProps["renderMenuLink"];
    isMobile: boolean;
    showHomeIcon: boolean;
    showNextArrow: boolean;
    nextItems: SeparatorNavItem[];
    separatorNavItems: NonNullable<ResponsiveBreadcrumbProps["separatorNavItems"]>;
    separatorNavSide: NonNullable<ResponsiveBreadcrumbProps["separatorNavSide"]>;
    showCurrentInNav: NonNullable<ResponsiveBreadcrumbProps["showCurrentInNav"]>;
    titleOnlyFallback: React.ReactNode;
    titleOnlyIcon?: React.ReactNode;
    titleOnlyCustomElement?: React.ReactNode;
    customEllipsisElement?: React.ReactNode;
    lastItemClickable: boolean;
    showCollapsedCount: boolean;
    clickableLeftOfEllipsis: boolean;
    strings: ResponsiveBreadcrumbStrings;
    focusRing: BreadcrumbFocusRing;
    compactReveal?: ResponsiveBreadcrumbProps["compactReveal"];
    animateLayout: BreadcrumbAnimation;
    isRtl: boolean;
  }
>(function MeasurementTree(
  {
    items,
    renderSeparator,
    renderItem,
    renderEllipsis,
    renderTitleOnly,
    renderMenuItem,
    renderItemLink,
    renderMenuLink,
    isMobile,
    showHomeIcon,
    showNextArrow,
    nextItems,
    separatorNavItems,
    separatorNavSide,
    showCurrentInNav,
    titleOnlyFallback,
    titleOnlyIcon,
    titleOnlyCustomElement,
    customEllipsisElement,
    lastItemClickable,
    showCollapsedCount,
    clickableLeftOfEllipsis,
    strings,
    focusRing,
    compactReveal,
    animateLayout,
    isRtl,
  },
  ref,
) {
  const includeNextArrow = showNextArrow && nextItems.length > 0;
  const fullMeasurementLayout = buildFullLayout({
    items,
    itemWidths: Array.from({ length: items.length }, () => 0),
    separatorWidths: Array.from(
      { length: Math.max(0, items.length - 1) },
      () => 0,
    ),
    includeNextArrow,
    nextArrowWidth: 0,
  });
  const ellipsisMeasurementLayout = [
    getEllipsisMeasurementNode(items.length),
  ];
  const titleOnlyMeasurementLayout = titleOnlyLayout(0);
  const compactMeasurementDisplays = Object.fromEntries(
    items.map((_, index) => [index, { kind: "compact", tokenWidth: 0 }]),
  ) as Record<number, BreadcrumbItemDisplay>;
  const sharedRendererProps = {
    items,
    isMobile,
    openOverlay: null,
    onOpenOverlayChange: noopOpenOverlayChange,
    renderSeparator,
    renderItem,
    renderEllipsis,
    renderTitleOnly,
    renderMenuItem,
    renderItemLink,
    renderMenuLink,
    showHomeIcon,
    showNextArrow,
    nextItems,
    separatorNavItems,
    onItemClick: undefined,
    titleOnlyFallback,
    titleOnlyIcon,
    titleOnlyCustomElement,
    customEllipsisElement,
    lastItemClickable,
    showCollapsedCount,
    strings,
    clickableLeftOfEllipsis,
    separatorNavSide,
    overflowBehavior: "collapse" as const,
    truncatedWidths: {},
    itemDisplays: {},
    pathTruncation: undefined,
    compactReveal,
    compactRevealIndex: null,
    onCompactRevealIndexChange: noopCompactRevealChange,
    animateLayout,
    showTooltipOnTruncate: false,
    schema: "none" as const,
    showCurrentInNav,
    debug: false,
    focusRing,
    isRtl,
  } satisfies Omit<
    React.ComponentProps<typeof BreadcrumbRenderer>,
    "layout" | "mode" | "measurementScope"
  >;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 -z-10 h-0 max-w-none overflow-hidden opacity-0"
      style={{ contain: "layout style", visibility: "hidden" }}
    >
      <BreadcrumbRenderer
        {...sharedRendererProps}
        mode="measure"
        layout={fullMeasurementLayout}
        measurementScope="full"
      />
      <BreadcrumbRenderer
        {...sharedRendererProps}
        mode="measure"
        layout={ellipsisMeasurementLayout}
        measurementScope="ellipsis"
      />
      <BreadcrumbRenderer
        {...sharedRendererProps}
        mode="measure"
        layout={titleOnlyMeasurementLayout}
        measurementScope="title-only"
      />
      <BreadcrumbRenderer
        {...sharedRendererProps}
        mode="measure"
        layout={fullMeasurementLayout}
        measurementScope="compact"
        itemDisplays={compactMeasurementDisplays}
      />
    </div>
  );
});

function buildFullLayout({
  items,
  itemWidths,
  separatorWidths,
  includeNextArrow,
  nextArrowWidth,
}: {
  items: BreadcrumbData[];
  itemWidths: number[];
  separatorWidths: number[];
  includeNextArrow: boolean;
  nextArrowWidth: number;
}): LayoutNode[] {
  const nodes: LayoutNode[] = [];

  items.forEach((_, index) => {
    nodes.push({ type: "item", index, width: itemWidths[index] ?? 0 });

    if (index < items.length - 1) {
      nodes.push({
        type: "separator",
        after: index,
        width: separatorWidths[index] ?? 0,
      });
    }
  });

  if (includeNextArrow) {
    nodes.push({ type: "next", width: nextArrowWidth });
  }

  return nodes;
}

function computeTruncation({
  items,
  itemWidths,
  compactTokenWidths,
  separatorWidths,
  availableWidth,
  gapWidth,
  includeNextArrow,
  nextArrowWidth,
  enabled,
  truncateMinWidth,
  truncateMaxWidth,
  truncateThreshold,
  truncateOrder,
  truncationMode,
  compactRevealIndex,
  compactReveal,
  alwaysShowHead,
  alwaysShowTail,
}: {
  items: BreadcrumbData[];
  itemWidths: number[];
  compactTokenWidths: number[];
  separatorWidths: number[];
  availableWidth: number;
  gapWidth: number;
  includeNextArrow: boolean;
  nextArrowWidth: number;
  enabled: boolean;
  truncateMinWidth: number;
  truncateMaxWidth: number;
  truncateThreshold: number;
  truncateOrder: "biggest-first" | "smallest-first";
  truncationMode: BreadcrumbTruncationMode;
  compactRevealIndex: number | null;
  compactReveal?: ResponsiveBreadcrumbProps["compactReveal"];
  alwaysShowHead: number;
  alwaysShowTail: number;
}) {
  const effectiveItemWidths = itemWidths.map((width) => width ?? 0);
  const truncatedWidths: Record<number, number> = {};
  const displays: Record<number, BreadcrumbItemDisplay> = {};

  if (!enabled || items.length === 0) {
    return { itemWidths: effectiveItemWidths, truncatedWidths, displays };
  }

  let overflow =
    getLayoutWidth(
      buildFullLayout({
        items,
        itemWidths: effectiveItemWidths,
        separatorWidths,
        includeNextArrow,
        nextArrowWidth,
      }),
      gapWidth,
    ) - availableWidth;

  if (overflow <= 0) {
    return { itemWidths: effectiveItemWidths, truncatedWidths, displays };
  }

  if (truncationMode === "compact-reveal") {
    return computeCompactRevealTruncation({
      items,
      itemWidths: effectiveItemWidths,
      compactTokenWidths,
      separatorWidths,
      availableWidth,
      gapWidth,
      includeNextArrow,
      nextArrowWidth,
      compactRevealIndex,
      compactReveal,
      alwaysShowHead,
      alwaysShowTail,
    });
  }

  const minWidth = Math.max(1, truncateMinWidth);
  const maxWidth = Math.max(minWidth, truncateMaxWidth);
  const candidates = items
    .map((item, index) => ({
      item,
      index,
      width: effectiveItemWidths[index] ?? 0,
      canTruncate: getCanTruncate(item, index, items.length),
    }))
    .filter(({ width, canTruncate }) => canTruncate && width > truncateThreshold)
    .sort((left, right) =>
      truncateOrder === "biggest-first"
        ? right.width - left.width
        : left.width - right.width,
    );

  for (const candidate of candidates) {
    if (overflow <= 0) {
      break;
    }

    const targetWidth = Math.max(
      minWidth,
      Math.min(maxWidth, candidate.width - overflow),
    );
    const nextWidth = Math.min(candidate.width, targetWidth);

    if (nextWidth >= candidate.width) {
      continue;
    }

    effectiveItemWidths[candidate.index] = nextWidth;
    truncatedWidths[candidate.index] = nextWidth;
    displays[candidate.index] = {
      kind: truncationMode === "path-start-end" ? "path-start-end" : "width",
      width: nextWidth,
    };
    overflow -= candidate.width - nextWidth;
  }

  return { itemWidths: effectiveItemWidths, truncatedWidths, displays };
}

function computeCompactRevealTruncation({
  items,
  itemWidths,
  compactTokenWidths,
  separatorWidths,
  availableWidth,
  gapWidth,
  includeNextArrow,
  nextArrowWidth,
  compactRevealIndex,
  compactReveal,
  alwaysShowHead,
  alwaysShowTail,
}: {
  items: BreadcrumbData[];
  itemWidths: number[];
  compactTokenWidths: number[];
  separatorWidths: number[];
  availableWidth: number;
  gapWidth: number;
  includeNextArrow: boolean;
  nextArrowWidth: number;
  compactRevealIndex: number | null;
  compactReveal?: ResponsiveBreadcrumbProps["compactReveal"];
  alwaysShowHead: number;
  alwaysShowTail: number;
}) {
  const effectiveItemWidths = itemWidths.map((width) => width ?? 0);
  const truncatedWidths: Record<number, number> = {};
  const displays: Record<number, BreadcrumbItemDisplay> = {};
  const headCount = compactReveal?.alwaysShowHead ?? alwaysShowHead;
  const tailCount = compactReveal?.alwaysShowTail ?? alwaysShowTail;

  items.forEach((item, index) => {
    const pinnedByHead = index < headCount;
    const pinnedByTail = index >= items.length - tailCount;
    const revealed = compactRevealIndex === index;
    const canCompact =
      getCanTruncate(item, index, items.length) &&
      !pinnedByHead &&
      !pinnedByTail &&
      !revealed;
    const tokenWidth = compactTokenWidths[index] ?? 0;

    if (!canCompact || tokenWidth <= 0 || tokenWidth >= effectiveItemWidths[index]) {
      return;
    }

    effectiveItemWidths[index] = tokenWidth;
    truncatedWidths[index] = tokenWidth;
    displays[index] = { kind: "compact", tokenWidth };
  });

  const compactWidth = getLayoutWidth(
    buildFullLayout({
      items,
      itemWidths: effectiveItemWidths,
      separatorWidths,
      includeNextArrow,
      nextArrowWidth,
    }),
    gapWidth,
  );

  if (compactWidth > availableWidth) {
    return { itemWidths: effectiveItemWidths, truncatedWidths, displays };
  }

  return { itemWidths: effectiveItemWidths, truncatedWidths, displays };
}

function titleOnlyLayout(width: number): LayoutNode[] {
  return [{ type: "title-only", width }];
}

function getEllipsisMeasurementNode(count: number): LayoutNode {
  if (count > 2) {
    return { type: "ellipsis", from: 1, to: count - 2, width: 0 };
  }

  return { type: "ellipsis", from: 0, to: Math.max(0, count - 1), width: 0 };
}

function getCanCollapse(item: BreadcrumbData, index: number, count: number) {
  if (item.canCollapse !== undefined) {
    return item.canCollapse;
  }

  return index !== 0 && index !== count - 1;
}

function getCanTruncate(item: BreadcrumbData, index: number, count: number) {
  if (item.canTruncate !== undefined) {
    return item.canTruncate;
  }

  return index !== count - 1;
}

function getSeparatorOverlayId({
  node,
  layout,
  nodeIndex,
  items,
  separatorNavItems,
  clickableLeftOfEllipsis,
  separatorNavSide,
  showCurrentInNav,
}: {
  node: Extract<LayoutNode, { type: "separator" }>;
  layout: LayoutNode[];
  nodeIndex: number;
  items: BreadcrumbData[];
  separatorNavItems: NonNullable<ResponsiveBreadcrumbProps["separatorNavItems"]>;
  clickableLeftOfEllipsis: boolean;
  separatorNavSide: NonNullable<ResponsiveBreadcrumbProps["separatorNavSide"]>;
  showCurrentInNav: NonNullable<ResponsiveBreadcrumbProps["showCurrentInNav"]>;
}) {
  const previousItem = items[node.after];
  const nextNode = layout[nodeIndex + 1];
  const nextIndex =
    nextNode?.type === "item"
      ? nextNode.index
      : nextNode?.type === "ellipsis"
        ? nextNode.from
        : node.after + 1;
  const nextItem = items[nextIndex];
  const anchorItem = separatorNavSide === "left" ? previousItem : nextItem;
  const leftOfEllipsis = nextNode?.type === "ellipsis";
  const baseNavItems = getSeparatorNavItems(
    separatorNavItems,
    previousItem,
    nextItem,
    separatorNavSide,
  );
  const navItems = withCurrentItem({
    navItems: baseNavItems,
    nextItem: anchorItem,
    showCurrentInNav,
  });
  const interactive =
    navItems.length > 0 &&
    (!leftOfEllipsis || clickableLeftOfEllipsis);

  if (!interactive) {
    return null;
  }

  return `separator-${anchorItem?.key ?? node.after}`;
}

function getSeparatorNavItems(
  separatorNavItems: NonNullable<ResponsiveBreadcrumbProps["separatorNavItems"]>,
  previousItem: BreadcrumbData | undefined,
  nextItem: BreadcrumbData | undefined,
  side: NonNullable<ResponsiveBreadcrumbProps["separatorNavSide"]>,
) {
  const anchorItem = side === "left" ? previousItem : nextItem;

  if (!anchorItem) {
    return [];
  }

  return (
    separatorNavItems[anchorItem.key] ??
    (previousItem && nextItem
      ? separatorNavItems[`${previousItem.key}:${nextItem.key}`]
      : undefined) ??
    []
  );
}

function withCurrentItem({
  navItems,
  nextItem,
  showCurrentInNav,
}: {
  navItems: SeparatorNavItem[];
  nextItem: BreadcrumbData | undefined;
  showCurrentInNav: NonNullable<ResponsiveBreadcrumbProps["showCurrentInNav"]>;
}) {
  const shouldInclude =
    nextItem &&
    (showCurrentInNav === "always" ||
      (showCurrentInNav === "with-others" && navItems.length > 0));

  if (!shouldInclude) {
    return navItems;
  }

  if (navItems.some((item) => item.key === nextItem.key)) {
    return navItems;
  }

  return [
    {
      key: nextItem.key,
      label: nextItem.label,
      href: nextItem.href,
      icon: nextItem.icon,
      clickable: nextItem.clickable,
      disabled: nextItem.disabled,
    },
    ...navItems,
  ];
}

function normalizeMeasuredWidths(widths: number[], length: number) {
  return Array.from({ length }, (_, index) => widths[index] ?? 0);
}

function primitiveLabel(label: React.ReactNode) {
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }

  return "";
}
