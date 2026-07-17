import {
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import * as React from "react";
import { continueRender, delayRender } from "remotion";

import { ResponsiveBreadcrumb } from "../../../web/src/components/responsive/ResponsiveBreadcrumb";
import type { BreadcrumbData } from "../../../web/src/components/responsive/types";
import type { ResponsiveBreadcrumbProps } from "../../../web/src/components/responsive/types";
import type { SeparatorNavItem } from "../../../web/src/components/responsive/types";
import { TooltipProvider as ProductTooltipProvider } from "../../../web/src/components/ui/tooltip";
import { useRenderSettle } from "./kit";

export const breadcrumbItems: BreadcrumbData[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "#dashboard",
    canCollapse: false,
    canTruncate: false,
  },
  {
    key: "workspace",
    label: "Workspace",
    href: "#workspace",
    icon: <Users className="size-4" />,
  },
  {
    key: "engineering",
    label: "Engineering",
    href: "#engineering",
    icon: <FileText className="size-4" />,
  },
  {
    key: "security-policies",
    label: "Security Policies",
    href: "#security-policies",
    icon: <ShieldCheck className="size-4" />,
  },
  {
    key: "access-control",
    label: "Access Control",
    href: "#access-control",
  },
  {
    key: "edit-role",
    label: "Edit Admin Role",
    href: "#edit-role",
    canCollapse: false,
    canTruncate: false,
  },
];

/**
 * Deeper path used inside the dashboard header: at 15px in a ~1400px header
 * it genuinely overflows, so the component collapses on its own — no forced
 * state anywhere in the payoff shot.
 */
export const dashboardBreadcrumbItems: BreadcrumbData[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "#dashboard",
    canCollapse: false,
    canTruncate: false,
  },
  {
    key: "workspace-admin",
    label: "Enterprise Workspace Administration",
    href: "#workspace-admin",
  },
  {
    key: "compliance",
    label: "International Compliance Operations",
    href: "#compliance",
    icon: <ShieldCheck className="size-4" />,
  },
  {
    key: "access-governance",
    label: "Identity & Access Governance Policies",
    href: "#access-governance",
  },
  {
    key: "privileged-roles",
    label: "Privileged Roles and Permissions",
    href: "#privileged-roles",
  },
  {
    key: "edit-role",
    label: "Edit Super Administrator Access",
    href: "#edit-role",
    canCollapse: false,
    canTruncate: false,
  },
];

const forceCollapseMiddle = (_item: BreadcrumbData, index: number) =>
  index > 0 && index < 4;

/**
 * The real ResponsiveBreadcrumb, wrapped for deterministic Remotion capture:
 * every width change opens a delayRender handle until the component's
 * ResizeObserver → rAF → measure → commit pipeline has settled, and the
 * collapsed-items popover is driven declaratively (open via the real trigger,
 * with capture blocked until the content is actually in the DOM).
 */
export const LiveBreadcrumb = ({
  size,
  items = breadcrumbItems,
  collapsed = false,
  openMenu = false,
  openSeparatorMenu = false,
  settleKey = "static",
  truncateMinWidth = 150,
  truncateMaxWidth = 330,
  enableTruncation = true,
  variant = "default",
  popoverPortalled = true,
  renderMenuItem,
  separatorNavItems,
  forceCollapse,
  showCollapsedCount = false,
  collapsedCountPlacement = "inline",
  showHomeIcon = true,
}: {
  size: number;
  items?: BreadcrumbData[];
  collapsed?: boolean;
  openMenu?: boolean;
  openSeparatorMenu?: boolean;
  settleKey?: string | number;
  truncateMinWidth?: number;
  truncateMaxWidth?: number;
  enableTruncation?: boolean;
  variant?: "default" | "resize" | "menu" | "tree" | "dashboard";
  popoverPortalled?: boolean;
  renderMenuItem?: ResponsiveBreadcrumbProps["renderMenuItem"];
  separatorNavItems?: Record<string, SeparatorNavItem[]>;
  forceCollapse?: ResponsiveBreadcrumbProps["forceCollapse"];
  showCollapsedCount?: boolean;
  collapsedCountPlacement?: ResponsiveBreadcrumbProps["collapsedCountPlacement"];
  showHomeIcon?: boolean;
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wantsOverlay = openMenu || openSeparatorMenu;

  useRenderSettle(
    `bc:${settleKey}:${collapsed}:${wantsOverlay}:${size}`,
    5,
  );

  const menuEntry = React.useRef<{ handle: number; done: boolean } | null>(null);
  if (wantsOverlay && menuEntry.current === null) {
    menuEntry.current = { handle: delayRender("breadcrumb-menu"), done: false };
  }

  React.useEffect(() => {
    const entry = menuEntry.current;
    const release = () => {
      if (entry && !entry.done) {
        entry.done = true;
        continueRender(entry.handle);
      }
    };

    if (!wantsOverlay) {
      release();
      return;
    }

    let raf = 0;
    let attempts = 0;

    const menuIsMounted = () =>
      document.querySelector(
        '[data-slot="popover-content"][data-state="open"]',
      ) !== null;

    const step = () => {
      attempts += 1;

      if (menuIsMounted()) {
        // Give floating-ui two more frames to finalize the position.
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(release);
        });
        return;
      }

      const trigger = rootRef.current?.querySelector<HTMLButtonElement>(
        openSeparatorMenu
          ? '[data-slot="breadcrumb-interactive-separator"] button'
          : 'button[aria-label^="Show "][aria-label*="collapsed"]',
      );

      if (trigger && trigger.getAttribute("data-state") !== "open") {
        trigger.click();
      }

      if (attempts < 90) {
        raf = requestAnimationFrame(step);
      } else {
        release();
      }
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      release();
    };
  }, [openSeparatorMenu, wantsOverlay]);

  return (
    <ProductTooltipProvider>
      <div
        ref={rootRef}
        className={`video-breadcrumb video-breadcrumb--${variant}`}
        style={{ "--video-breadcrumb-size": `${size}px` } as React.CSSProperties}
      >
        <ResponsiveBreadcrumb
          items={items}
          strategy="start"
          preference="none"
          showHomeIcon={showHomeIcon}
          enableTruncation={enableTruncation}
          truncateMinWidth={truncateMinWidth}
          truncateMaxWidth={truncateMaxWidth}
          truncateThreshold={110}
          alwaysShow={{ head: 1, tail: 1 }}
          forceCollapse={
            forceCollapse ?? (collapsed ? forceCollapseMiddle : undefined)
          }
          popoverPortalled={popoverPortalled}
          renderMenuItem={renderMenuItem}
          separatorNavItems={separatorNavItems}
          showCurrentInNav="with-others"
          showCollapsedCount={showCollapsedCount}
          collapsedCountPlacement={collapsedCountPlacement}
        />
      </div>
    </ProductTooltipProvider>
  );
};
