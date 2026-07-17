import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import * as React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

export const FPS = 30;
/** 120 BPM → one beat every 15 frames, one 4/4 bar every 60 frames. */
export const BEAT = 15;
export const BAR = 60;
export const DURATION = 870;

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
const mono = loadMono("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

export const fonts = {
  sans: inter.fontFamily,
  mono: mono.fontFamily,
};

export const colors = {
  background: "#09090b",
  panel: "#131316",
  raised: "#1b1b1f",
  line: "#27272a",
  lineBright: "rgba(255,255,255,.14)",
  muted: "#a1a1aa",
  faint: "#63636b",
  text: "#fafafa",
  green: "#a3e635",
};

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  snap: Easing.bezier(0.3, 1.4, 0.4, 1),
};

export const clamp = (
  frame: number,
  range: number[],
  output: number[],
  easing = ease.out,
) =>
  interpolate(frame, range, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/**
 * Deterministic rendering helper. The breadcrumb measures the DOM through
 * ResizeObserver + requestAnimationFrame, and recharts measures its container
 * asynchronously — none of that is finished when Remotion would normally
 * screenshot the frame. Whenever `key` changes we open a delayRender handle
 * *during the render phase* (so Remotion sees it before capturing) and release
 * it only after `ticks` animation frames, which is enough for observer →
 * scheduled measure → React commit to complete.
 */
export function useRenderSettle(key: string | number, ticks = 5) {
  const entryRef = React.useRef<{
    key: string | number;
    handle: number;
    done: boolean;
  } | null>(null);

  if (entryRef.current === null || entryRef.current.key !== key) {
    if (entryRef.current && !entryRef.current.done) {
      continueRender(entryRef.current.handle);
    }
    entryRef.current = {
      key,
      handle: delayRender(`settle:${key}`),
      done: false,
    };
  }

  React.useEffect(() => {
    const entry = entryRef.current;
    if (!entry || entry.done) {
      return;
    }

    let raf = 0;
    let left = ticks;
    const release = () => {
      if (!entry.done) {
        entry.done = true;
        continueRender(entry.handle);
      }
    };
    const tick = () => {
      left -= 1;
      if (left <= 0) {
        release();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      release();
    };
  }, [key, ticks]);

  React.useEffect(() => {
    return () => {
      const entry = entryRef.current;
      if (entry && !entry.done) {
        entry.done = true;
        continueRender(entry.handle);
      }
    };
  }, []);
}

/** Blocks the first captured frame until every stylesheet font is loaded. */
export function useFontsReady() {
  const [handle] = React.useState(() => delayRender("fonts"));
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    const release = () => {
      if (!doneRef.current) {
        doneRef.current = true;
        continueRender(handle);
      }
    };
    document.fonts.ready.then(release, release);
    return release;
  }, [handle]);
}

/** Piecewise keyframe interpolation with per-segment easing. */
export const piecewise = (
  frame: number,
  points: Array<[frame: number, value: number]>,
  easing = ease.inOut,
): number => {
  if (frame <= points[0][0]) {
    return points[0][1];
  }

  for (let i = 1; i < points.length; i += 1) {
    const [f0, v0] = points[i - 1];
    const [f1, v1] = points[i];
    if (frame <= f1) {
      if (v0 === v1 || f1 === f0) {
        return v1;
      }
      return interpolate(frame, [f0, f1], [v0, v1], { easing });
    }
  }

  return points[points.length - 1][1];
};

export const fadeUp = (
  frame: number,
  start: number,
  dur = 12,
  dist = 34,
): React.CSSProperties => ({
  opacity: clamp(frame, [start, start + dur], [0, 1]),
  transform: `translateY(${clamp(frame, [start, start + dur], [dist, 0])}px)`,
});

export const Surface = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      borderRadius: 22,
      border: `1px solid ${colors.line}`,
      background: "linear-gradient(160deg, #1a1a1e 0%, #101013 100%)",
      boxShadow: "0 40px 110px rgba(0,0,0,.5), inset 0 1px rgba(255,255,255,.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const WindowDots = () => (
  <div style={{ display: "flex", gap: 9 }}>
    {["#3f3f46", "#3f3f46", "#3f3f46"].map((color, index) => (
      <span
        key={index}
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: color,
        }}
      />
    ))}
  </div>
);

export const BrowserWindow = ({
  width,
  url = "acme.com/dashboard",
  children,
  style,
}: {
  width: number;
  url?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <Surface style={{ width, overflow: "hidden", ...style }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 62,
        paddingInline: 24,
        borderBottom: `1px solid ${colors.line}`,
        background: "rgba(255,255,255,.025)",
      }}
    >
      <WindowDots />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            paddingInline: 18,
            paddingBlock: 6,
            borderRadius: 8,
            border: `1px solid ${colors.line}`,
            background: "rgba(9,9,11,.6)",
            color: colors.muted,
            fontSize: 17,
            fontFamily: fonts.mono,
            letterSpacing: -0.4,
            maxWidth: width - 180,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </span>
      </div>
    </div>
    {children}
  </Surface>
);

export const BrandMark = ({ size = 46 }: { size?: number }) => (
  <span
    style={{
      display: "grid",
      width: size,
      height: size,
      placeItems: "center",
      borderRadius: size * 0.26,
      background: colors.text,
      color: "#121215",
      boxShadow: "0 10px 34px rgba(255,255,255,.14)",
      fontSize: size * 0.58,
      fontWeight: 800,
      lineHeight: 1,
    }}
  >
    ›
  </span>
);

export const Pill = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      height: 42,
      paddingInline: 17,
      borderRadius: 999,
      border: `1px solid ${colors.line}`,
      background: "rgba(24,24,27,.82)",
      color: colors.muted,
      fontSize: 19,
      fontWeight: 600,
      letterSpacing: -0.3,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const SceneTag = ({
  index,
  text,
  frame,
}: {
  index: string;
  text: string;
  frame: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: 96,
      top: 66,
      display: "flex",
      alignItems: "center",
      gap: 16,
      color: colors.muted,
      fontSize: 23,
      fontWeight: 700,
      letterSpacing: 3,
      ...fadeUp(frame, 2, 10, 18),
    }}
  >
    <span style={{ color: colors.text }}>{index}</span>
    <span style={{ width: 46, height: 1, background: colors.faint }} />
    {text}
  </div>
);

export const AmbientBackground = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill aria-hidden>
      <div
        style={{
          position: "absolute",
          inset: -80,
          opacity: 0.2,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${interpolate(frame, [0, DURATION], [0, -72])}px, ${interpolate(frame, [0, DURATION], [0, -36])}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          left: -320,
          top: -480,
          borderRadius: "50%",
          opacity: 0.13,
          filter: "blur(100px)",
          background: "radial-gradient(circle, #52525b 0%, transparent 66%)",
          transform: `translateX(${interpolate(frame, [0, DURATION], [0, 130])}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          right: -320,
          bottom: -480,
          borderRadius: "50%",
          opacity: 0.1,
          filter: "blur(120px)",
          background: "radial-gradient(circle, #71717a 0%, transparent 68%)",
          transform: `translateX(${interpolate(frame, [0, DURATION], [0, -110])}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette = () => (
  <AbsoluteFill
    aria-hidden
    style={{
      background:
        "radial-gradient(ellipse 72% 62% at 50% 44%, transparent 58%, rgba(0,0,0,.42) 100%)",
      pointerEvents: "none",
    }}
  />
);

/** macOS-style pointer. (x, y) is the tip of the arrow. */
export const Cursor = ({
  x,
  y,
  pressed = false,
  opacity = 1,
}: {
  x: number;
  y: number;
  pressed?: boolean;
  opacity?: number;
}) => (
  <svg
    width={34}
    height={40}
    viewBox="0 0 17 20"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${pressed ? 0.82 : 1})`,
      transformOrigin: "2px 2px",
      filter: "drop-shadow(0 4px 10px rgba(0,0,0,.55))",
      opacity,
      pointerEvents: "none",
      zIndex: 80,
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

/**
 * Standard scene entrance/exit: an 8-frame whip in (scale + lift) and a
 * 6-frame push out. Uniform scale only, so live breadcrumbs stay measurable.
 * Scenes whose popover portal cannot follow transforms use out="fade".
 */
export const SceneShell = ({
  duration,
  out = "full",
  children,
}: {
  duration: number;
  out?: "full" | "fade" | "none";
  children: React.ReactNode;
}) => {
  const frame = useCurrentFrame();
  const inScale = clamp(frame, [0, 9], [1.055, 1]);
  const inY = clamp(frame, [0, 9], [26, 0]);
  const opacityIn = clamp(frame, [0, 5], [0, 1]);
  const outStart = duration - 7;
  const opacityOut =
    out === "none" ? 1 : clamp(frame, [outStart, duration - 1], [1, 0], ease.inOut);
  const outScale =
    out === "full" ? clamp(frame, [outStart, duration - 1], [1, 0.965], ease.inOut) : 1;
  const outY =
    out === "full" ? clamp(frame, [outStart, duration - 1], [0, -18], ease.inOut) : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: opacityIn * opacityOut,
        transform: `translateY(${inY + outY}px) scale(${inScale * outScale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Subtle three-frame glow on musical cuts, synced with the crash hits. */
export const CutFlashes = ({ cuts }: { cuts: number[] }) => {
  const frame = useCurrentFrame();
  const strength = cuts.reduce((acc, cut) => {
    if (frame < cut || frame > cut + 3) {
      return acc;
    }
    return Math.max(acc, interpolate(frame, [cut, cut + 3], [0.055, 0]));
  }, 0);

  if (strength <= 0) {
    return null;
  }

  return (
    <AbsoluteFill
      aria-hidden
      style={{
        background:
          "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.25) 55%, transparent 100%)",
        opacity: strength,
        zIndex: 90,
        pointerEvents: "none",
      }}
    />
  );
};

export const ProgressRail = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: `${interpolate(frame, [0, DURATION - 1], [0, 100])}%`,
        height: 3,
        background: "rgba(250,250,250,.85)",
        boxShadow: "0 0 18px rgba(255,255,255,.25)",
        zIndex: 100,
      }}
    />
  );
};
