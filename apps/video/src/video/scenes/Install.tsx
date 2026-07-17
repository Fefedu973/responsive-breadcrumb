import { Check, Terminal } from "lucide-react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import {
  clamp,
  colors,
  fadeUp,
  fonts,
  SceneTag,
  Surface,
  WindowDots,
} from "../kit";

const CMD_DASHBOARD = "npx shadcn@latest add dashboard-01";
const CMD_BREADCRUMB =
  "npx shadcn@latest add Fefedu973/responsive-breadcrumb/responsive-breadcrumb";

const typed = (
  frame: number,
  text: string,
  start: number,
  end: number,
): string => {
  const count = Math.floor(
    interpolate(frame, [start, end], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }),
  );
  return text.slice(0, count);
};

/**
 * Bars 10–11 (frames 540–660). The terminal beat: install the official shadcn
 * dashboard, then add the breadcrumb straight from the GitHub registry.
 */
export const InstallScene = () => {
  const frame = useCurrentFrame();

  const line1 = typed(frame, CMD_DASHBOARD, 6, 32);
  const line1Done = frame >= 32;
  const line2Visible = frame >= 52;
  const line2 = typed(frame, CMD_BREADCRUMB, 52, 90);
  const line2Done = frame >= 90;
  const caretOn = frame % 14 < 8;

  return (
    <AbsoluteFill style={{ opacity: clamp(frame, [0, 6], [0, 1]) }}>
      <SceneTag index="03" text="DROP-IN" frame={frame} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 110,
          textAlign: "center",
          fontSize: 122,
          fontWeight: 800,
          letterSpacing: -6.5,
          ...fadeUp(frame, 2, 13, 46),
        }}
      >
        DROP IT IN.
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 330,
          display: "flex",
          justifyContent: "center",
          perspective: 1700,
          ...fadeUp(frame, 6, 15, 90),
        }}
      >
        <div
          style={{
            width: 1500,
            transform: `rotateX(${clamp(frame, [0, 40], [8, 3.5])}deg) rotateY(-2.5deg) skewX(-0.6deg) scale(${clamp(frame, [0, 118], [0.99, 1.045], Easing.inOut(Easing.quad))})`,
          }}
        >
          <Surface style={{ padding: "0 0 40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                height: 66,
                paddingInline: 30,
                borderBottom: `1px solid ${colors.line}`,
                color: colors.muted,
              }}
            >
              <Terminal size={24} />
              <span style={{ fontSize: 21, fontWeight: 600 }}>terminal</span>
              <div style={{ marginLeft: "auto" }}>
                <WindowDots />
              </div>
            </div>

            <div
              style={{
                paddingInline: 44,
                paddingTop: 36,
                fontFamily: fonts.mono,
                fontSize: 29,
                letterSpacing: -0.8,
                lineHeight: 1.45,
                whiteSpace: "nowrap",
              }}
            >
              <div>
                <span style={{ color: colors.faint }}>$ </span>
                <span style={{ color: colors.text }}>{line1}</span>
                {!line1Done ? <Caret on={caretOn} /> : null}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 18,
                  color: colors.green,
                  fontSize: 26,
                  opacity: clamp(frame, [38, 44], [0, 1]),
                }}
              >
                <Check size={26} strokeWidth={3} />
                dashboard-01 installed
                <span style={{ color: colors.faint }}>— the official shadcn dashboard</span>
              </div>

              {line2Visible ? (
                <div style={{ marginTop: 26 }}>
                  <span style={{ color: colors.faint }}>$ </span>
                  <span style={{ color: colors.text }}>{line2}</span>
                  {!line2Done ? <Caret on={caretOn} /> : null}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 18,
                  color: colors.green,
                  fontSize: 26,
                  opacity: clamp(frame, [96, 102], [0, 1]),
                }}
              >
                <Check size={26} strokeWidth={3} />
                responsive-breadcrumb ready
                <span style={{ color: colors.faint }}>— one component, zero config</span>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Caret = ({ on }: { on: boolean }) => (
  <span
    style={{
      display: "inline-block",
      width: "0.62em",
      height: "1.15em",
      verticalAlign: "text-bottom",
      background: colors.text,
      opacity: on ? 1 : 0,
      marginLeft: 3,
    }}
  />
);
