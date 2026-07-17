import {
  ChevronDown,
  FileCode2,
  Folder,
  FolderOpen,
  Package,
} from "lucide-react";
import * as React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

import type {
  BreadcrumbData,
  ResponsiveBreadcrumbProps,
  SeparatorNavItem,
} from "../../../../web/src/components/responsive/types";
import {
  clamp,
  colors,
  Cursor,
  fadeUp,
  piecewise,
  Pill,
  useRenderSettle,
} from "../kit";
import { LiveBreadcrumb } from "../LiveBreadcrumb";

const treeBreadcrumbItems: BreadcrumbData[] = [
  {
    key: "repository",
    label: "responsive-breadcrumb",
    href: "#repository",
    icon: <Package className="size-4" />,
    canCollapse: false,
  },
  { key: "apps", label: "apps", href: "#apps", canCollapse: false },
  { key: "web", label: "web", href: "#web", canCollapse: false },
  { key: "src", label: "src", href: "#src", canCollapse: false },
  {
    key: "components",
    label: "components",
    href: "#components",
    icon: <FolderOpen className="size-4" />,
    canCollapse: false,
  },
  {
    key: "responsive-file",
    label: "ResponsiveBreadcrumb.tsx",
    href: "#responsive-file",
    icon: <FileCode2 className="size-4" />,
    canCollapse: false,
  },
];

const siblingFolders: SeparatorNavItem[] = [
  { key: "app", label: "app", href: "#app", icon: <Folder className="size-4" /> },
  { key: "lib", label: "lib", href: "#lib", icon: <Folder className="size-4" /> },
  {
    key: "styles",
    label: "styles",
    href: "#styles",
    icon: <Folder className="size-4" />,
  },
];

const renderTreeMenuItem: NonNullable<
  ResponsiveBreadcrumbProps["renderMenuItem"]
> = ({ item }) => <TreeMenuItem item={item} />;

const TreeMenuItem = ({ item }: { item: BreadcrumbData | SeparatorNavItem }) => {
  const frame = useCurrentFrame();
  const active = frame >= 68 && item.key === "lib";

  return (
    <span
      data-video-menu-row-active={active ? "true" : undefined}
      style={{
        display: "flex",
        width: "100%",
        minWidth: 0,
        alignItems: "center",
        gap: 16,
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};

export const TreeScene = () => {
  const frame = useCurrentFrame();
  const menuOpen = frame >= 45;
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [separatorPoint, setSeparatorPoint] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  useRenderSettle(
    `tree-separator:${separatorPoint ? "ready" : "pending"}:${menuOpen}`,
    6,
  );

  React.useEffect(() => {
    if (frame < 18 || separatorPoint) {
      return;
    }

    let raf = 0;
    let attempts = 0;

    const locateSeparator = () => {
      const candidates = Array.from(
        panelRef.current?.querySelectorAll<HTMLButtonElement>(
          '[data-slot="breadcrumb-interactive-separator"] button',
        ) ?? [],
      );
      const visible = candidates.find((candidate) => {
        if (candidate.closest('[aria-hidden="true"]')) {
          return false;
        }
        const rect = candidate.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (visible) {
        const rect = visible.getBoundingClientRect();
        setSeparatorPoint({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else if (attempts < 90) {
        attempts += 1;
        raf = requestAnimationFrame(locateSeparator);
      }
    };

    locateSeparator();
    return () => cancelAnimationFrame(raf);
  }, [frame, separatorPoint]);

  const separatorX = separatorPoint?.x ?? 1318;
  const separatorY = separatorPoint?.y ?? 192;
  const cursorX = piecewise(frame, [
    [0, 1720],
    [16, 1720],
    [40, separatorX],
    [52, separatorX],
    [70, 1460],
    [112, 1460],
  ]);
  const cursorY = piecewise(frame, [
    [0, 790],
    [16, 790],
    [40, separatorY],
    [52, separatorY],
    [70, 390],
    [112, 390],
  ]);
  const rippleProgress = clamp(frame, [42, 51], [0, 1]);
  const showRipple = frame >= 42 && frame <= 51;

  return (
    <AbsoluteFill>
      <div
        ref={panelRef}
        style={{
          position: "absolute",
          left: 84,
          top: 84,
          color: colors.faint,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 4,
          ...fadeUp(frame, 2, 10, 20),
        }}
      >
        03 — TREE NAVIGATION
      </div>

      <div style={{ position: "absolute", left: 84, top: 308, width: 390 }}>
        <div
          style={{
            fontSize: 82,
            fontWeight: 850,
            letterSpacing: -5.5,
            lineHeight: 0.92,
            ...fadeUp(frame, 7, 12, 36),
          }}
        >
          NAVIGATE
          <br />
          <span style={{ color: colors.muted }}>THE TREE.</span>
        </div>
        <p
          style={{
            margin: "30px 0 0",
            maxWidth: 350,
            color: colors.muted,
            fontSize: 24,
            lineHeight: 1.45,
            ...fadeUp(frame, 15, 12, 28),
          }}
        >
          Every separator can become a shortcut to sibling branches.
        </p>
        <Pill
          style={{
            marginTop: 28,
            height: 44,
            fontSize: 18,
            ...fadeUp(frame, 22, 10, 18),
          }}
        >
          separatorNavItems
        </Pill>
      </div>

      <div
        style={{
          position: "absolute",
          left: 530,
          top: 150,
          width: 1320,
          height: 780,
          display: "grid",
          gridTemplateColumns: "310px 1fr",
          border: "1px solid rgba(255,255,255,.13)",
          borderRadius: 24,
          background: "rgba(12,12,14,.94)",
          boxShadow: "0 55px 150px rgba(0,0,0,.52)",
          overflow: "visible",
          ...fadeUp(frame, 4, 13, 34),
        }}
      >
        <FileTree />

        <div style={{ minWidth: 0, overflow: "visible" }}>
          <div
            style={{
              height: 84,
              display: "flex",
              alignItems: "center",
              paddingInline: 30,
              borderBottom: "1px solid rgba(255,255,255,.1)",
              overflow: "visible",
            }}
          >
            <LiveBreadcrumb
              size={18}
              items={treeBreadcrumbItems}
              settleKey="tree-navigation"
              variant="tree"
              enableTruncation={false}
              openSeparatorMenu={menuOpen}
              popoverPortalled={false}
              separatorNavItems={{ components: siblingFolders }}
              renderMenuItem={renderTreeMenuItem}
              showHomeIcon={false}
            />
          </div>
          <CodePreview />
        </div>
      </div>

      {showRipple ? (
        <div
          style={{
            position: "absolute",
            left: cursorX + 2,
            top: cursorY + 2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2px solid rgba(250,250,250,.72)",
            transform: `translate(-50%, -50%) scale(${1 + rippleProgress * 4.8})`,
            opacity: (1 - rippleProgress) * 0.7,
            pointerEvents: "none",
            zIndex: 70,
          }}
        />
      ) : null}

      <Cursor
        x={cursorX}
        y={cursorY}
        pressed={frame >= 43 && frame <= 47}
        opacity={clamp(frame, [5, 12], [0, 1])}
      />
    </AbsoluteFill>
  );
};

const FileTree = () => (
  <div
    style={{
      borderRight: "1px solid rgba(255,255,255,.1)",
      padding: "24px 16px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "0 10px 18px",
        color: colors.faint,
        fontSize: 14,
        fontWeight: 750,
        letterSpacing: 2.2,
      }}
    >
      EXPLORER
    </div>
    <TreeRow label="responsive-breadcrumb" depth={0} folder open />
    <TreeRow label="apps" depth={1} folder open />
    <TreeRow label="web" depth={2} folder open />
    <TreeRow label="src" depth={3} folder open />
    <TreeRow label="app" depth={4} folder />
    <TreeRow label="components" depth={4} folder open selected />
    <TreeRow label="ResponsiveBreadcrumb.tsx" depth={5} />
    <TreeRow label="BreadcrumbRenderer.tsx" depth={5} />
    <TreeRow label="types.ts" depth={5} />
    <TreeRow label="lib" depth={4} folder />
    <TreeRow label="styles" depth={4} folder />
    <TreeRow label="package.json" depth={1} />
  </div>
);

const TreeRow = ({
  label,
  depth,
  folder = false,
  open = false,
  selected = false,
}: {
  label: string;
  depth: number;
  folder?: boolean;
  open?: boolean;
  selected?: boolean;
}) => (
  <div
    style={{
      height: 46,
      display: "flex",
      alignItems: "center",
      gap: 8,
      paddingLeft: 8 + depth * 15,
      paddingRight: 8,
      borderRadius: 8,
      background: selected ? "rgba(255,255,255,.09)" : "transparent",
      color: selected ? colors.text : colors.muted,
      fontSize: 16,
      whiteSpace: "nowrap",
    }}
  >
    {folder ? (
      <ChevronDown
        size={14}
        style={{ opacity: 0.65, transform: open ? "none" : "rotate(-90deg)" }}
      />
    ) : (
      <span style={{ width: 14 }} />
    )}
    {folder ? (
      open ? <FolderOpen size={17} /> : <Folder size={17} />
    ) : (
      <FileCode2 size={16} style={{ color: "#a1a1aa" }} />
    )}
    <span>{label}</span>
  </div>
);

const CodePreview = () => (
  <div style={{ padding: "64px 54px" }}>
    <div
      style={{
        color: colors.faint,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 18,
        lineHeight: 2.2,
      }}
    >
      <div><span style={{ color: "#c084fc" }}>const</span> siblingFolders = tree.children;</div>
      <div style={{ marginTop: 24, color: colors.muted }}>&lt;ResponsiveBreadcrumb</div>
      <div style={{ paddingLeft: 32 }}><span style={{ color: "#67e8f9" }}>items</span>={"{path}"}</div>
      <div style={{ paddingLeft: 32 }}><span style={{ color: "#67e8f9" }}>separatorNavItems</span>={"{siblingFolders}"}</div>
      <div style={{ color: colors.muted }}>/&gt;</div>
    </div>
  </div>
);
