import { AbsoluteFill, useCurrentFrame } from "remotion";

import {
  BrandMark,
  clamp,
  colors,
  ease,
  fadeUp,
  fonts,
} from "../kit";

/**
 * Bars 14–14.5 (frames 780–870). End card: brand, the one-liner install
 * command, and where to find it. Holds to the last frame so Twitter's
 * end-of-video freeze lands on the CTA.
 */
export const EndScene = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: clamp(frame, [0, 6], [0, 1]),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${clamp(frame, [0, 20], [0.94, 1], ease.snap)})`,
        }}
      >
        <div style={{ ...fadeUp(frame, 3, 12, 28) }}>
          <BrandMark size={72} />
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -4.5,
            ...fadeUp(frame, 9, 12, 34),
          }}
        >
          Responsive shadcn components.
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            fontWeight: 500,
            color: colors.muted,
            letterSpacing: -0.8,
            ...fadeUp(frame, 15, 12, 26),
          }}
        >
          A library built for every screen. More to come.
        </div>

        <div
          style={{
            marginTop: 52,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 30px",
            borderRadius: 16,
            border: `1px solid ${colors.lineBright}`,
            background: "rgba(20,20,23,.85)",
            boxShadow: "0 28px 80px rgba(0,0,0,.45)",
            fontFamily: fonts.mono,
            fontSize: 23,
            letterSpacing: -0.6,
            ...fadeUp(frame, 22, 12, 30),
          }}
        >
          <span style={{ color: colors.faint }}>$</span>
          <span style={{ color: colors.text }}>
            npx shadcn@latest add Fefedu973/responsive-breadcrumb/responsive-breadcrumb
          </span>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: colors.faint,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: -0.4,
            ...fadeUp(frame, 28, 12, 22),
          }}
        >
          github.com/Fefedu973/responsive-breadcrumb
          <span style={{ color: "#3f3f46" }}>·</span>
          MIT
        </div>
      </div>
    </AbsoluteFill>
  );
};
