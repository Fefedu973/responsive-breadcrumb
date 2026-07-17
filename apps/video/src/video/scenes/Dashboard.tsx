import * as React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";

import dashboardData from "@/app/dashboard/data.json";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { clamp, colors, fadeUp, Pill, useRenderSettle } from "../kit";
import { dashboardBreadcrumbItems, LiveBreadcrumb } from "../LiveBreadcrumb";

const collapseOnlyOneDashboardLevel = (_item: unknown, index: number) =>
  index === 1;

/**
 * Bars 12–13 (frames 660–780). The payoff: the camera holds a close-up on
 * the breadcrumb inside the real dashboard-01 header, then pulls back to
 * reveal the whole dashboard. Uniform scale only — the breadcrumb keeps
 * measuring itself correctly because every measured width scales equally.
 */
export const DashboardScene = () => {
  const frame = useCurrentFrame();

  useRenderSettle("dashboard-mount", 10);
  useImagesReady();

  const scale = clamp(
    frame,
    [30, 78],
    [2.35, 1],
    Easing.bezier(0.5, 0, 0.15, 1),
  ) * clamp(frame, [78, 120], [1, 0.988], Easing.inOut(Easing.quad));
  const centerCrumb = clamp(
    frame,
    [30, 78],
    [170, 0],
    Easing.bezier(0.5, 0, 0.15, 1),
  );

  return (
    <AbsoluteFill style={{ opacity: clamp(frame, [0, 5], [0, 1]) }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 46,
          width: 1780,
          height: 986,
          transformOrigin: "24% 5.5%",
          transform: `translateY(${centerCrumb}px) scale(${scale})`,
        }}
      >
        <RealDashboard />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 44,
          display: "flex",
          justifyContent: "center",
          ...fadeUp(frame, 84, 12, 24),
        }}
      >
        <Pill style={{ fontSize: 22, height: 48, paddingInline: 22 }}>
          <span style={{ color: colors.text, fontWeight: 700 }}>
            shadcn dashboard-01
          </span>
          · one line added, fully responsive
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

/** Blocks capture until every image inside the dashboard has decoded. */
const useImagesReady = () => {
  const [handle] = React.useState(() => delayRender("dashboard-images"));
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    const release = () => {
      if (!doneRef.current) {
        doneRef.current = true;
        continueRender(handle);
      }
    };

    let raf = 0;
    let tries = 0;
    const check = () => {
      tries += 1;
      const images = Array.from(document.querySelectorAll("img"));
      if (images.every((img) => img.complete) && tries > 6) {
        release();
      } else if (tries < 240) {
        raf = requestAnimationFrame(check);
      } else {
        release();
      }
    };
    raf = requestAnimationFrame(check);

    return () => {
      cancelAnimationFrame(raf);
      release();
    };
  }, [handle]);
};

const RealDashboard = () => (
  <TooltipProvider>
    <div
      className="dark h-full w-full overflow-hidden rounded-[24px] bg-background text-foreground"
      style={{
        border: "1px solid rgba(255,255,255,.13)",
        boxShadow:
          "0 65px 180px rgba(0,0,0,.66), inset 0 1px rgba(255,255,255,.05)",
      }}
    >
      <SidebarProvider
        className="h-full min-h-0"
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "3.5rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="h-full min-h-0 overflow-hidden">
          <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
            <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2"
                style={{ height: 16, alignSelf: "center" }}
              />
              <div className="min-w-0 flex-1 overflow-hidden">
                <LiveBreadcrumb
                  size={15}
                  items={dashboardBreadcrumbItems}
                  settleKey="dashboard"
                  enableTruncation={false}
                  variant="dashboard"
                  forceCollapse={collapseOnlyOneDashboardLevel}
                  showCollapsedCount
                  collapsedCountPlacement="outside"
                />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="@container/main flex flex-1 flex-col gap-2 overflow-hidden">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <Img
                    src={staticFile("dashboard-chart.png")}
                    alt="Total visitors chart"
                    className="block h-auto w-full rounded-xl"
                  />
                </div>
                <DataTable data={dashboardData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  </TooltipProvider>
);
