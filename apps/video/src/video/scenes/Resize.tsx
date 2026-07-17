import { AbsoluteFill, useCurrentFrame } from "remotion";

import {
  BrowserWindow,
  clamp,
  colors,
  Cursor,
  fadeUp,
  fonts,
  piecewise,
  SceneTag,
} from "../kit";
import { LiveBreadcrumb } from "../LiveBreadcrumb";

/**
 * Bars 3–5 (frames 120–300). The money shot: the browser window steps down
 * through every layout state on the beat grid — full → truncated → collapsed
 * → title-only — then snaps back to collapsed to hand over to the menu scene.
 */
const WIDTH_KEYFRAMES: Array<[number, number]> = [
  [0, 1560],
  [30, 1560],
  [45, 1250],
  [75, 1250],
  [90, 740],
  [120, 740],
  [135, 420],
  [162, 420],
  [176, 760],
  [180, 760],
];

const stateAt = (width: number) => {
  if (width >= 1400) return "FULL";
  if (width >= 980) return "TRUNCATED";
  if (width >= 520) return "COLLAPSED";
  return "TITLE-ONLY";
};

export const ResizeScene = () => {
  const frame = useCurrentFrame();
  const width = piecewise(frame, WIDTH_KEYFRAMES);
  const widthNext = piecewise(frame + 1, WIDTH_KEYFRAMES);
  const dragging = Math.abs(widthNext - width) > 0.5;
  const state = stateAt(width);

  // The pointer rides the drag handle on the window's right edge.
  const cursorArrive = clamp(frame, [14, 24], [0, 1]);
  const cursorX = 960 + width / 2 + 2 + (1 - cursorArrive) * 150;
  const cursorY = 571 + (1 - cursorArrive) * 110;

  return (
    <AbsoluteFill style={{ opacity: clamp(frame, [0, 6], [0, 1]) }}>
      <SceneTag index="01" text="RESPONSIVE" frame={frame} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 108,
          textAlign: "center",
          fontSize: 128,
          fontWeight: 800,
          letterSpacing: -7,
          lineHeight: 0.95,
          ...fadeUp(frame, 2, 13, 46),
        }}
      >
        ANY WIDTH.
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 262,
          textAlign: "center",
          color: colors.muted,
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: -1,
          ...fadeUp(frame, 8, 13, 30),
        }}
      >
        Real DOM measurement. One deterministic layout pass.
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 400,
          display: "flex",
          justifyContent: "center",
          ...fadeUp(frame, 6, 14, 60),
        }}
      >
        <div style={{ width, position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
              fontFamily: fonts.mono,
              fontSize: 24,
              letterSpacing: -0.5,
            }}
          >
            <span style={{ color: colors.text, fontWeight: 600 }}>{state}</span>
            <span style={{ color: colors.muted }}>{Math.round(width)}px</span>
          </div>

          <BrowserWindow width={width}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 138,
                paddingInline: 36,
                overflow: "hidden",
              }}
            >
              <LiveBreadcrumb
                size={24}
                settleKey={Math.round(width)}
                variant="resize"
              />
            </div>
          </BrowserWindow>

          {/* Drag handle riding the window's right edge */}
          <div
            style={{
              position: "absolute",
              top: 40 + 62 + 138 / 2,
              right: -13,
              transform: "translateY(-50%)",
              width: 26,
              height: 76,
              borderRadius: 14,
              border: `1px solid ${dragging ? colors.lineBright : colors.line}`,
              background: dragging ? "#26262b" : "#1c1c20",
              boxShadow: dragging
                ? "0 0 28px rgba(255,255,255,.22), 0 10px 30px rgba(0,0,0,.5)"
                : "0 10px 30px rgba(0,0,0,.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 2.5,
                  borderRadius: 2,
                  background: dragging ? colors.text : colors.faint,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 108,
          display: "flex",
          justifyContent: "center",
          gap: 18,
          ...fadeUp(frame, 12, 14, 26),
        }}
      >
        <StatePill label="truncate" active={width < 1400} />
        <StatePill label="collapse" active={width < 980} />
        <StatePill label="title-only" active={width < 520} />
      </div>

      <Cursor
        x={cursorX}
        y={cursorY}
        pressed={frame > 24 && dragging}
        opacity={clamp(frame, [14, 20], [0, 1])}
      />
    </AbsoluteFill>
  );
};

const StatePill = ({ label, active }: { label: string; active: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "13px 20px",
      borderRadius: 999,
      border: `1px solid ${active ? "#71717a" : colors.line}`,
      background: active ? "#27272a" : "rgba(24,24,27,.6)",
      color: active ? colors.text : colors.faint,
      fontSize: 24,
      fontWeight: 600,
      letterSpacing: -0.3,
    }}
  >
    <span
      style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: active ? colors.text : "#3f3f46",
        boxShadow: active ? "0 0 16px rgba(255,255,255,.55)" : "none",
      }}
    />
    {label}
  </div>
);
