import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  BrandMark,
  BrowserWindow,
  clamp,
  colors,
  fadeUp,
  Pill,
} from "../kit";
import { breadcrumbItems, LiveBreadcrumb } from "../LiveBreadcrumb";

const hookBreadcrumbItems = [
  breadcrumbItems[0],
  breadcrumbItems[1],
  breadcrumbItems[3],
  breadcrumbItems[4],
  {
    key: "administrator-roles",
    label: "Administrator Roles",
    href: "#administrator-roles",
  },
  breadcrumbItems[5],
];

/**
 * Bars 1–2 (frames 0–120). Brand chip, the two-line claim, then the full
 * breadcrumb lands in a browser window on the bar-2 downbeat (frame 60).
 */
export const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({
    frame: frame - 52,
    fps,
    durationInFrames: 52,
    config: {
      damping: 28,
      stiffness: 72,
      mass: 1.45,
      overshootClamping: true,
    },
  });
  const rest = 1 - arrival;
  const browserScale = 0.94 + arrival * 0.06;
  const browserX = rest * 1780;
  const browserY = rest * 72;
  const browserRotateY = rest * -34;
  const browserRotateX = rest * 3.5;
  const browserRotateZ = rest * 2.2;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 118,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          ...fadeUp(frame, 4, 12, 26),
        }}
      >
        <BrandMark size={44} />
        <span
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: -1,
            color: colors.text,
          }}
        >
          responsive-breadcrumb
        </span>
        <Pill>for shadcn/ui</Pill>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 240,
          textAlign: "center",
          fontWeight: 800,
          letterSpacing: -9,
          lineHeight: 0.94,
        }}
      >
        <div style={{ fontSize: 172, ...fadeUp(frame, 10, 14, 60) }}>
          BREADCRUMBS
        </div>
        <div
          style={{
            fontSize: 172,
            color: colors.muted,
            ...fadeUp(frame, 22, 14, 60),
          }}
        >
          THAT ALWAYS FIT.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 118,
          display: "flex",
          justifyContent: "center",
          opacity: clamp(frame, [52, 58], [0, 1]),
          transform: `translate3d(${browserX}px, ${browserY}px, 0)`,
          perspective: 1400,
        }}
      >
        <div
          style={{
            transformOrigin: "88% 52%",
            transform: `perspective(1400px) rotateY(${browserRotateY}deg) rotateX(${browserRotateX}deg) rotateZ(${browserRotateZ}deg) scale(${browserScale})`,
            willChange: "transform",
          }}
        >
          <BrowserWindow width={1660}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 148,
                paddingInline: 44,
              }}
            >
              <LiveBreadcrumb
                size={30}
                items={hookBreadcrumbItems}
                settleKey="hook"
                enableTruncation={false}
              />
            </div>
          </BrowserWindow>
        </div>
      </div>
    </AbsoluteFill>
  );
};
