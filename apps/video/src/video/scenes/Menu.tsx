import * as React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";

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
  SceneTag,
  Surface,
  useRenderSettle,
} from "../kit";
import { LiveBreadcrumb } from "../LiveBreadcrumb";

const MENU_OPENS_AT = 30;

/**
 * Bars 6–7 (frames 300–420). Close-up on the collapsed breadcrumb: the real
 * popover opens on the beat and reveals the hidden crumbs. The panel is
 * static once the popover is open (floating-ui does not track ancestor
 * transforms), so all motion happens before frame 24.
 */
export const MenuScene = () => {
  const frame = useCurrentFrame();
  const openMenu = frame >= MENU_OPENS_AT;
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = React.useState<Point | null>(null);

  useRenderSettle(`menu-scene:${openMenu}`, 8);

  // Locate the real (visible) collapsed-items trigger. On mount the
  // breadcrumb briefly renders without measurements, so the only matching
  // button is the aria-hidden measurement tree — retry over animation frames
  // until the on-screen trigger exists, and never measure before frame 24
  // (the panel is still translating in until then).
  React.useEffect(() => {
    if (frame < 24 || ripple) {
      return;
    }

    let raf = 0;
    let tries = 0;

    const find = () => {
      const candidates = Array.from(
        panelRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[aria-label^="Show "][aria-label*="collapsed"]',
        ) ?? [],
      );
      const visible = candidates.find((el) => {
        if (el.closest('[aria-hidden="true"]')) {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.top > 0;
      });

      if (visible) {
        const rect = visible.getBoundingClientRect();
        setRipple({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else if (tries < 120) {
        tries += 1;
        raf = requestAnimationFrame(find);
      }
    };

    find();
    return () => cancelAnimationFrame(raf);
  }, [frame, ripple]);

  const rippleProgress = clamp(frame, [26, 44], [0, 1], Easing.linear);
  const cursorX = ripple
    ? ripple.x + (1 - clamp(frame, [8, 25], [0, 1])) * 390
    : 0;
  const cursorY = ripple
    ? ripple.y + (1 - clamp(frame, [8, 25], [0, 1])) * 310
    : 0;

  const cursorOpacity = clamp(frame, [8, 14], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: clamp(frame, [0, 6], [0, 1]) }}>
      <SceneTag index="02" text="NOTHING LOST" frame={frame} />

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 300,
          fontSize: 148,
          fontWeight: 800,
          letterSpacing: -8,
          lineHeight: 0.92,
          ...fadeUp(frame, 4, 13, 50),
        }}
      >
        NOTHING
        <br />
        <span style={{ color: colors.muted }}>LOST.</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 124,
          top: 610,
          fontSize: 36,
          fontWeight: 500,
          color: colors.muted,
          letterSpacing: -1,
          ...fadeUp(frame, 12, 13, 30),
        }}
      >
        Collapsed crumbs stay one click away.
      </div>

      <div
        ref={panelRef}
        style={{
          position: "absolute",
          left: 890,
          top: 330,
          width: 920,
          opacity: clamp(frame, [4, 16], [0, 1]),
          transform: `translateY(${clamp(frame, [4, 22], [60, 0])}px)`,
        }}
      >
        <Surface style={{ padding: "36px 36px" }}>
          <LiveBreadcrumb
            size={26}
            collapsed
            openMenu={openMenu}
            settleKey="menu"
            variant="menu"
            popoverPortalled={false}
            renderMenuItem={renderVideoMenuItem}
          />
        </Surface>
      </div>

      {ripple && frame < MENU_OPENS_AT ? (
        <Cursor
          x={cursorX}
          y={cursorY}
          pressed={frame >= 26 && frame <= 32}
          opacity={cursorOpacity}
        />
      ) : null}

      {ripple && rippleProgress > 0 && rippleProgress < 1 ? (
        <>
          <span
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "4px solid rgba(250,250,250,.95)",
              boxShadow:
                "0 0 24px rgba(255,255,255,.5), inset 0 0 14px rgba(255,255,255,.3)",
              transform: `translate(-50%, -50%) scale(${1 + rippleProgress * 3.4})`,
              opacity: 1 - rippleProgress,
              pointerEvents: "none",
              zIndex: 60,
            }}
          />
          <span
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "3px solid rgba(250,250,250,.7)",
              transform: `translate(-50%, -50%) scale(${1 + rippleProgress * 5.8})`,
              opacity: (1 - rippleProgress) * 0.6,
              pointerEvents: "none",
              zIndex: 60,
            }}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

type Point = { x: number; y: number };

const MENU_ITEM_KEYS = ["workspace", "engineering", "security-policies"];

const renderVideoMenuItem: NonNullable<
  ResponsiveBreadcrumbProps["renderMenuItem"]
> = ({ item }) => <VideoMenuItem item={item} />;

const VideoMenuItem = ({
  item,
}: {
  item: BreadcrumbData | SeparatorNavItem;
}) => {
  const frame = useCurrentFrame();
  const itemIndex = MENU_ITEM_KEYS.indexOf(item.key);
  const activeIndex = frame < 62 ? 0 : frame < 82 ? 1 : 2;
  const cursorY = piecewise(frame, [
    [30, -74],
    [42, 0],
    [56, 0],
    [66, 68],
    [76, 68],
    [86, 136],
    [108, 136],
  ]);
  const cursorRight = piecewise(frame, [
    [30, 400],
    [42, 52],
    [108, 52],
  ]);
  const cursorOpacity = clamp(frame, [108, 116], [1, 0]);

  return (
    <span
      data-video-menu-row-active={
        frame >= 40 && itemIndex === activeIndex ? "true" : undefined
      }
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        minWidth: 0,
        alignItems: "center",
        gap: 16,
      }}
    >
      {item.icon}
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.label}
      </span>
      {itemIndex === 0 && frame >= MENU_OPENS_AT ? (
        <InlineMenuCursor
          right={cursorRight}
          y={cursorY}
          opacity={cursorOpacity}
        />
      ) : null}
    </span>
  );
};

const InlineMenuCursor = ({
  right,
  y,
  opacity,
}: {
  right: number;
  y: number;
  opacity: number;
}) => (
  <svg
    width={34}
    height={40}
    viewBox="0 0 17 20"
    style={{
      position: "absolute",
      right,
      top: "50%",
      zIndex: 100,
      opacity,
      pointerEvents: "none",
      filter: "drop-shadow(0 4px 10px rgba(0,0,0,.55))",
      transform: `translateY(calc(-50% + ${y}px))`,
    }}
  >
    <path
      d="M1.5 1.5 L1.5 15.2 L5.4 11.7 L7.9 17.4 L10.6 16.2 L8.1 10.6 L13.3 10.2 Z"
      fill="#fafafa"
      stroke="#18181b"
      strokeWidth={1.1}
      strokeLinejoin="round"
    />
  </svg>
);
