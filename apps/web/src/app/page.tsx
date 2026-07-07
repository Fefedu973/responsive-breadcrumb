"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
    ResponsiveBreadcrumb,
    type BreadcrumbDebugState,
    type BreadcrumbFocusRing,
    type ResponsiveBreadcrumbProps,
} from "@/components/responsive/ResponsiveBreadcrumb";
import { breadcrumbDebugStore, useBreadcrumbDebugStore } from "@/lib/breadcrumb-debug-store";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    FileText,
    Settings,
    Users,
    ShoppingCart,
    Package,
    BarChart,
    Home as HomeIcon,
    Folder,
    File,
    Database,
    Server,
    Globe,
    Building,
    MapPin,
    Calendar,
    Clock,
    Monitor,
    Smartphone,
    Tablet,
    ChevronDown,
    ChevronRight,
    Bug,
    Ruler,
    Eye,
    Target
} from "lucide-react";

// Debug Panel Component - subscribes to external store (no parent re-renders)
function DebugPanel({ scenarios }: { scenarios: any }) {
    const debugState = useBreadcrumbDebugStore();

    if (!debugState) {
        return (
            <Card className="p-8 mt-6 text-center">
                <Bug className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Enable Debug Mode</h3>
                <p className="text-sm text-muted-foreground">
                    Check the "Enable Debug Outlines" option above to see live measurements and debug information.
                    Resize the panel to see the breadcrumb adapt in real-time.
                </p>
            </Card>
        );
    }

    return (
        <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-blue-600" />
                        Container Size
                    </h3>
                    <p className="text-2xl font-mono">{Math.round(debugState.containerWidth)}px</p>
                    <p className="text-xs text-muted-foreground">
                        Available width: {Math.round(debugState.remainingSpace)}px
                    </p>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        Strategy
                    </h3>
                    <p className="text-lg font-medium capitalize">{debugState.strategy}</p>
                    <p className="text-xs text-muted-foreground">
                        Preference: {debugState.preference === "minimize-count" ? "Min Count" : "Min Visibility"}
                    </p>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        Items State
                    </h3>
                    <p className="text-2xl font-mono">
                        {debugState.visibleItemsCount}/{debugState.totalItemsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {debugState.showTitleOnly ? "Title-only mode" : `${debugState.collapsedItemsCount} collapsed`}
                    </p>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Bug className="h-4 w-4 text-red-600" />
                        Measurements
                    </h3>
                    <p className="text-lg font-medium">
                        {debugState.measurementLocked ? "Locked" : "Active"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Gap: {debugState.gap.toFixed(1)}px
                    </p>
                </Card>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-blue-600" />
                        Item Widths
                    </h3>
                    <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                        {debugState.itemWidths.map((width, idx) => {
                            const isCollapsed = debugState.collapsedRange &&
                                idx >= debugState.collapsedRange.a &&
                                idx <= debugState.collapsedRange.b;
                            const isTruncated = debugState.truncatedItems[idx] !== undefined;
                            const truncatedWidth = debugState.truncatedItems[idx];
                            return (
                                <div
                                    key={idx}
                                    className={`flex justify-between items-center p-2 rounded ${isCollapsed
                                        ? "bg-yellow-100 dark:bg-yellow-900/20"
                                        : isTruncated
                                            ? "bg-purple-100 dark:bg-purple-900/20"
                                            : "bg-muted"
                                        }`}
                                >
                                    <span className="font-mono text-xs">
                                        Item {idx}: {scenarios.documents[idx]?.label.slice(0, 20)}
                                    </span>
                                    <div className="flex gap-1 items-center">
                                        {isTruncated && (
                                            <>
                                                <Badge variant="outline" className="text-xs">
                                                    {Math.round(truncatedWidth)}px
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">→</span>
                                            </>
                                        )}
                                        <Badge variant={isCollapsed ? "secondary" : isTruncated ? "default" : "default"}>
                                            {Math.round(width)}px
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        Component Widths
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 rounded bg-muted">
                            <span className="font-mono text-xs">Ellipsis Button</span>
                            <Badge>{Math.round(debugState.ellipsisWidth)}px</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-muted">
                            <span className="font-mono text-xs">Next Arrow</span>
                            <Badge>{Math.round(debugState.nextArrowWidth)}px</Badge>
                        </div>
                        {debugState.titleOnlyWidth > 0 && (
                            <div className="flex justify-between items-center p-2 rounded bg-muted">
                                <span className="font-mono text-xs">Title Only</span>
                                <Badge>{Math.round(debugState.titleOnlyWidth)}px</Badge>
                            </div>
                        )}
                        <Separator className="my-2" />
                        {debugState.truncationEnabled && (
                            <>
                                <div className="space-y-1 p-2 rounded bg-purple-50 dark:bg-purple-950/20">
                                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Truncation Info:</p>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        <p>• {Object.keys(debugState.truncatedItems).length} items truncated</p>
                                        <p>• Total saved: {Math.round(
                                            Object.entries(debugState.truncatedItems).reduce((acc, [idx, w]) =>
                                                acc + (debugState.itemWidths[Number(idx)] - w), 0
                                            )
                                        )}px</p>
                                    </div>
                                </div>
                                <Separator className="my-2" />
                            </>
                        )}
                        <div className="space-y-1">
                            <p className="text-xs font-medium">Separator Widths:</p>
                            {debugState.separatorWidths.map((width, idx) => (
                                <div key={idx} className="flex justify-between items-center pl-4">
                                    <span className="font-mono text-xs">Sep {idx}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {Math.round(width)}px
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-600" />
                    Collapse State
                </h3>
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                        <h4 className="font-medium mb-2">Current Mode</h4>
                        <div className="space-y-1 text-muted-foreground">
                            <p>
                                • {debugState.showTitleOnly ? (
                                    <Badge variant="secondary">Title-Only Mode</Badge>
                                ) : debugState.collapsedRange ? (
                                    <span>
                                        Collapsed range: [{debugState.collapsedRange.a}, {debugState.collapsedRange.b}]
                                    </span>
                                ) : (
                                    <Badge variant="default">All Items Visible</Badge>
                                )}
                            </p>
                            <p>• Measurement: {debugState.measurementLocked ? "Locked (drawer open)" : "Active"}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Sizing Breakdown</h4>
                        <div className="space-y-1 text-muted-foreground text-xs">
                            <p>• Container width: {Math.round(debugState.containerWidth)}px</p>
                            <p>• Available width: {Math.round(debugState.availableWidth)}px</p>
                            <p>• Used width: {Math.round(debugState.usedWidth)}px</p>
                            <p className={`font-medium ${Math.round(debugState.remainingSpace) > 0
                                ? "text-green-600 dark:text-green-400"
                                : Math.round(debugState.remainingSpace) < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-orange-600 dark:text-orange-400"
                                }`}>
                                • Remaining space: {Math.round(debugState.remainingSpace)}px
                            </p>
                            <div className="h-px bg-border my-2"></div>
                            <p className="text-xs opacity-70">Items: {Math.round(debugState.itemWidths.reduce((a, b) => a + b, 0))}px</p>
                            <p className="text-xs opacity-70">Separators: {Math.round(debugState.separatorWidths.reduce((a, b) => a + b, 0))}px</p>
                            <p className="text-xs opacity-70">Gaps: {Math.round(debugState.gap * (debugState.itemWidths.length + debugState.separatorWidths.length - 1))}px</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Performance</h4>
                        <div className="space-y-1 text-muted-foreground">
                            <p>• Single-pass computation</p>
                            <p>• ResizeObserver updates</p>
                            <p>• External store (no parent re-renders)</p>
                            <p>• Hidden measurement container</p>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}

// Debug-only helper. User-entered markup is displayed as text, not injected.
function renderTextElement(value: string): React.ReactNode {
    if (!value || value.trim() === "") {
        return null;
    }
    return <span>{value}</span>;
}

export default function Home() {
    // Global configuration state
    const [globalStrategy, setGlobalStrategy] = useState<"center" | "start" | "end" | "none">("start");
    const [globalPreference, setGlobalPreference] = useState<"minimize-count" | "minimize-visibility" | "none">("none");
    const [globalShowHomeIcon, setGlobalShowHomeIcon] = useState(true);
    const [globalShowNextArrow, setGlobalShowNextArrow] = useState(false);

    // Strategy demo state
    const [strategyDemo, setStrategyDemo] = useState<"center" | "start" | "end" | "none">("center");
    const [preferenceDemo, setPreferenceDemo] = useState<"minimize-count" | "minimize-visibility" | "none">("none");

    // Mobile/Truncation demo state
    const [showTitleOnly, setShowTitleOnly] = useState(true);
    const [titleOnlyText, setTitleOnlyText] = useState("Current Page");
    const [enableTruncation, setEnableTruncation] = useState(true);
    const [truncateMinWidth, setTruncateMinWidth] = useState(60);
    const [truncateMaxWidth, setTruncateMaxWidth] = useState(200);
    const [truncateThreshold, setTruncateThreshold] = useState(100);
    const [truncateOrder, setTruncateOrder] = useState<"biggest-first" | "smallest-first">("biggest-first");

    // Multi-ellipsis demo state
    const [allowMultipleEllipses, setAllowMultipleEllipses] = useState(true);
    const [grouping, setGrouping] = useState<"contiguous" | "free" | "smart">("smart");
    const [multiEllipsisPreference, setMultiEllipsisPreference] = useState<"minimize-count" | "minimize-visibility" | "none">("minimize-count");
    const [truncatableItems, setTruncatableItems] = useState([
        {
            key: "home", label: "Home", href: "/", canTruncate: false
        },
        {
            key: "category", label: "Category with an Extremely Long Name That Tests Truncation", href: "/category", canTruncate: true, icon: <BarChart className="h-4 w-4" />
        },
        {
            key: "subcategory", label: "Subcategory Also Has Very Long Name That Should Be Handled", href: "/category/sub", canTruncate: true
        },
        { key: "item", label: "Item with Ridiculously Detailed Description That Goes On Forever", canTruncate: false },
    ]);

    // Collapsible demo state
    const [collapsibleItems, setCollapsibleItems] = useState([
        {
            key: "home", label: "Home", href: "/", canCollapse: false
        },
        {
            key: "level1", label: "Level 1", href: "/level1", canCollapse: true
        },
        {
            key: "level2", label: "Level 2", href: "/level1/level2", canCollapse: true
        },
        {
            key: "level3", label: "Level 3", href: "/level1/level2/level3", canCollapse: true
        },
        {
            key: "level4", label: "Level 4", href: "/level1/level2/level3/level4", canCollapse: true
        },
        { key: "current", label: "Current Page", canCollapse: false },
    ]);

    // Debug state - using external store to avoid re-rendering the entire page
    const [debugMode, setDebugMode] = useState(false);

    // Debug configuration state
    const [debugStrategy, setDebugStrategy] = useState<"center" | "start" | "end" | "none">("start");
    const [debugPreference, setDebugPreference] = useState<"minimize-count" | "minimize-visibility" | "none">("none");
    const [debugShowHomeIcon, setDebugShowHomeIcon] = useState(true);
    const [debugShowNextArrow, setDebugShowNextArrow] = useState(true);
    const [debugAllowMultipleEllipses, setDebugAllowMultipleEllipses] = useState(false);
    const [debugGrouping, setDebugGrouping] = useState<"contiguous" | "free" | "smart">("contiguous");
    const [debugEnableTruncation, setDebugEnableTruncation] = useState(false);
    const [debugTruncateMinWidth, setDebugTruncateMinWidth] = useState(60);
    const [debugTruncateMaxWidth, setDebugTruncateMaxWidth] = useState(200);
    const [debugTruncateThreshold, setDebugTruncateThreshold] = useState(100);
    const [debugTruncateOrder, setDebugTruncateOrder] = useState<"biggest-first" | "smallest-first">("biggest-first");
    const [debugShowTitleOnly, setDebugShowTitleOnly] = useState(false);
    const [debugTitleOnlyText, setDebugTitleOnlyText] = useState("Current Page");
    const [debugTitleOnlyIcon, setDebugTitleOnlyIcon] = useState("fileText");
    const [debugScenario, setDebugScenario] = useState<"documents" | "custom">("documents");
    const [debugShowTooltipOnTruncate, setDebugShowTooltipOnTruncate] = useState(true);
    const [debugCustomSeparator, setDebugCustomSeparator] = useState("");
    const [debugShowCurrentInNav, setDebugShowCurrentInNav] = useState<"never" | "with-others" | "always">("never");
    const [debugLoadingFallback, setDebugLoadingFallback] = useState<"title" | "custom" | "none">("none");
    const [debugCustomLoadingText, setDebugCustomLoadingText] = useState("Loading...");
    const [debugCustomEllipsis, setDebugCustomEllipsis] = useState("");
    const [debugTitleOnlyCustomElement, setDebugTitleOnlyCustomElement] = useState("");
    const [debugLoadingDelay, setDebugLoadingDelay] = useState(0);
    const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);

    // New feature state
    const [debugLockOnOverlayOpen, setDebugLockOnOverlayOpen] = useState(true);
    const [debugOverflowBehavior, setDebugOverflowBehavior] = useState<"collapse" | "scroll" | "wrap">("collapse");
    const [debugFallbackAtWidth, setDebugFallbackAtWidth] = useState<number | undefined>(undefined);
    const [debugLastItemClickable, setDebugLastItemClickable] = useState(false);
    const [debugSchema, setDebugSchema] = useState<"json-ld" | "microdata" | "none">("json-ld");
    const [debugShowCollapsedCount, setDebugShowCollapsedCount] = useState(false);
    const [debugClickableLeftOfEllipsis, setDebugClickableLeftOfEllipsis] = useState(false);
    const [debugDirection, setDebugDirection] = useState<"ltr" | "rtl" | "auto">("auto");
    const [debugAlwaysShowHead, setDebugAlwaysShowHead] = useState(1);
    const [debugAlwaysShowTail, setDebugAlwaysShowTail] = useState(1);
    const [debugFocusRing, setDebugFocusRing] = useState<BreadcrumbFocusRing>("inset");

    // Focus ring and router link demo state
    const [focusRingDemo, setFocusRingDemo] = useState<BreadcrumbFocusRing>("inset");
    const [focusRingOverflow, setFocusRingOverflow] = useState<"collapse" | "scroll" | "wrap">("collapse");
    const [focusRingWidth, setFocusRingWidth] = useState(360);
    const focusRingFirstLinkRef = useRef<HTMLAnchorElement | null>(null);
    const [displayModesWidth, setDisplayModesWidth] = useState(420);
    const [compactRevealIndex, setCompactRevealIndex] = useState<number | null>(null);
    const [selectedOverlayKey, setSelectedOverlayKey] = useState("components");

    // Custom breadcrumb items
    const [customBreadcrumbItems, setCustomBreadcrumbItems] = useState<Array<{ key: string; label: string; href?: string; canCollapse: boolean; canTruncate: boolean; clickable?: boolean; icon: string; customElement?: string }>>([
        { key: "home", label: "Home", href: "/", canCollapse: false, canTruncate: false, clickable: true, icon: "home" },
        { key: "level1", label: "Level 1", href: "/level1", canCollapse: true, canTruncate: true, clickable: true, icon: "folder" },
        { key: "level2", label: "Level 2", href: "/level1/level2", canCollapse: true, canTruncate: true, clickable: true, icon: "file" },
        { key: "current", label: "Current Page", canCollapse: false, canTruncate: false, clickable: true, icon: "fileText" },
    ]);

    // Custom navigation tree for separator navigation
    const [customSeparatorNav, setCustomSeparatorNav] = useState<Record<string, Array<{ key: string; label: string; href: string; icon: string; clickable?: boolean }>>>({});

    // Custom next items for forward navigation
    const [customNextItems, setCustomNextItems] = useState<Array<{ key: string; label: string; href: string; icon: string; clickable?: boolean }>>([]);

    // Available icons mapping
    const iconMap = {
        none: null,
        home: <HomeIcon className="h-4 w-4" />,
        folder: <Folder className="h-4 w-4" />,
        file: <File className="h-4 w-4" />,
        fileText: <FileText className="h-4 w-4" />,
        settings: <Settings className="h-4 w-4" />,
        users: <Users className="h-4 w-4" />,
        shoppingCart: <ShoppingCart className="h-4 w-4" />,
        package: <Package className="h-4 w-4" />,
        barChart: <BarChart className="h-4 w-4" />,
        database: <Database className="h-4 w-4" />,
        server: <Server className="h-4 w-4" />,
        globe: <Globe className="h-4 w-4" />,
        building: <Building className="h-4 w-4" />,
        mapPin: <MapPin className="h-4 w-4" />,
        calendar: <Calendar className="h-4 w-4" />,
        clock: <Clock className="h-4 w-4" />,
    };

    const getIconComponent = (iconName: string) => {
        return iconMap[iconName as keyof typeof iconMap] || null;
    };

    // Simulate loading delay when loading fallback is enabled
    useEffect(() => {
        if (debugLoadingFallback !== "none" && debugLoadingDelay > 0) {
            setIsSimulatingLoading(true);
            const timer = setTimeout(() => {
                setIsSimulatingLoading(false);
            }, debugLoadingDelay);
            return () => clearTimeout(timer);
        } else {
            setIsSimulatingLoading(false);
        }
    }, [debugLoadingFallback, debugLoadingDelay]);

    // Push debug data to the external store (no parent re-renders)
    const pushDebug = useCallback((state: BreadcrumbDebugState) => {
        breadcrumbDebugStore.set(state);
    }, []);

    // Clear the store when debug mode is disabled
    useEffect(() => {
        if (!debugMode) {
            breadcrumbDebugStore.clear();
        }
    }, [debugMode]);

    // Comprehensive breadcrumb scenarios
    const scenarios = {
        comprehensive: [
            {
                key: "dashboard", label: "Dashboard", href: "/", icon: <BarChart className="h-4 w-4" />
            },
            {
                key: "admin", label: "Administration", href: "/admin", icon: <Settings className="h-4 w-4" />
            },
            {
                key: "users", label: "User Management", href: "/admin/users", icon: <Users className="h-4 w-4" />
            },
            {
                key: "roles", label: "Roles & Permissions", href: "/admin/users/roles"
            },
            {
                key: "permissions", label: "Permission Settings", href: "/admin/users/roles/permissions"
            },
            { key: "edit", label: "Edit Super Admin Role" },
        ],

        ecommerce: [
            {
                key: "home", label: "Home", href: "/"
            },
            {
                key: "shop", label: "Shop", href: "/shop", icon: <ShoppingCart className="h-4 w-4" />
            },
            {
                key: "electronics", label: "Electronics", href: "/shop/electronics"
            },
            {
                key: "computers", label: "Computers & Laptops", href: "/shop/electronics/computers"
            },
            {
                key: "gaming", label: "Gaming Laptops", href: "/shop/electronics/computers/gaming"
            },
            {
                key: "brands", label: "Premium Brands", href: "/shop/electronics/computers/gaming/premium"
            },
            { key: "product", label: "ASUS ROG Strix G15 Advantage Edition" },
        ],

        documents: [
            {
                key: "docs", label: "Documents", href: "/", icon: <FileText className="h-4 w-4" />
            },
            {
                key: "projects", label: "Projects", href: "/projects", icon: <Folder className="h-4 w-4" />
            },
            {
                key: "2024", label: "2024", href: "/projects/2024"
            },
            {
                key: "q4", label: "Q4 Reports", href: "/projects/2024/q4"
            },
            {
                key: "financial", label: "Financial Analysis", href: "/projects/2024/q4/financial"
            },
            { key: "file", label: "Annual_Financial_Report_2024_Q4_Final_v3.pdf", href: "/projects/2024/q4/financial" },
        ],

        longLabels: [
            {
                key: "home", label: "Home", href: "/"
            },
            {
                key: "category", label: "Category with an Extremely Long Name That Tests Truncation", href: "/category"
            },
            {
                key: "subcategory", label: "Subcategory Also Has Very Long Name That Should Be Handled", href: "/category/sub"
            },
            { key: "item", label: "Item with Ridiculously Detailed Description That Goes On Forever" },
        ],

        tree: [
            {
                key: "home", label: "Home", href: "/"
            },
            {
                key: "region", label: "North America", href: "/regions/na"
            },
            {
                key: "country", label: "United States", href: "/regions/na/us"
            },
            {
                key: "state", label: "California", href: "/regions/na/us/ca"
            },
            { key: "city", label: "San Francisco" },
        ],

        focusRing: [
            {
                key: "workspace", label: "Workspace", href: "/#workspace", icon: <Building className="h-4 w-4" />
            },
            {
                key: "projects", label: "Projects", href: "/#projects", icon: <Folder className="h-4 w-4" />
            },
            {
                key: "responsive-system", label: "Responsive Component System", href: "/#responsive-system"
            },
            {
                key: "navigation", label: "Navigation Primitives", href: "/#navigation"
            },
            {
                key: "breadcrumb", label: "Responsive Breadcrumb Registry Item", href: "/#breadcrumb"
            },
            { key: "focus", label: "Configurable Focus Ring" },
        ],

        pathStartEnd: [
            {
                key: "repo", label: "responsive-breadcrumb", href: "/#repo", icon: <Package className="h-4 w-4" />
            },
            {
                key: "workspace", label: "apps/web", href: "/#workspace", icon: <Folder className="h-4 w-4" />
            },
            {
                key: "test", label: "services/api-incoming/src/endpoints/proxy-webhook-events.test.ts", href: "/#test", canTruncate: true
            },
            { key: "case", label: "filters/market-data/live-candles/proxy-webhook-events.test.ts", canTruncate: true },
        ],

        compactReveal: [
            { key: "workspace", label: "workspace", href: "/#workspace" },
            { key: "projects", label: "projects", href: "/#projects" },
            { key: "components", label: "components", href: "/#components" },
            { key: "responsive", label: "responsive", href: "/#responsive" },
            { key: "breadcrumb", label: "breadcrumb", href: "/#breadcrumb" },
            { key: "renderer", label: "BreadcrumbRenderer.tsx", href: "/#renderer" },
            { key: "current", label: "compact-reveal mode" },
        ],
    };

    // Tree navigation data
    const treeNavigation = {
        region: [
            {
                key: "europe", label: "Europe", href: "/regions/eu", icon: <Globe className="h-4 w-4" />
            },
            {
                key: "asia", label: "Asia Pacific", href: "/regions/ap", icon: <Globe className="h-4 w-4" />
            },
            { key: "africa", label: "Africa", href: "/regions/af", icon: <Globe className="h-4 w-4" /> },
        ],
        country: [
            {
                key: "canada", label: "Canada", href: "/regions/na/ca", icon: <Building className="h-4 w-4" />
            },
            { key: "mexico", label: "Mexico", href: "/regions/na/mx", icon: <Building className="h-4 w-4" /> },
        ],
        state: [
            {
                key: "ny", label: "New York", href: "/regions/na/us/ny", icon: <MapPin className="h-4 w-4" />
            },
            {
                key: "tx", label: "Texas", href: "/regions/na/us/tx", icon: <MapPin className="h-4 w-4" />
            },
            { key: "fl", label: "Florida", href: "/regions/na/us/fl", icon: <MapPin className="h-4 w-4" /> },
        ],
        city: [
            {
                key: "la", label: "Los Angeles", href: "/regions/na/us/ca/la", icon: <Building className="h-4 w-4" />
            },
            {
                key: "sd", label: "San Diego", href: "/regions/na/us/ca/sd", icon: <Building className="h-4 w-4" />
            },
            { key: "sj", label: "San Jose", href: "/regions/na/us/ca/sj", icon: <Building className="h-4 w-4" /> },
        ],
    };

    const nextItems = [
        {
            key: "settings", label: "Settings", href: "#settings", icon: <Settings className="h-4 w-4" />
        },
        {
            key: "profile", label: "Profile", href: "#profile", icon: <Users className="h-4 w-4" />
        },
        {
            key: "notifications", label: "Notifications", href: "#notifications", icon: <Clock className="h-4 w-4" />
        },
        { key: "security", label: "Security", href: "#security", icon: <FileText className="h-4 w-4" /> },
    ];

    const focusRingSeparatorNav = {
        projects: [
            {
                key: "registry", label: "Registry", href: "/#registry", icon: <Package className="h-4 w-4" />
            },
            {
                key: "demo-site", label: "Demo Site", href: "/#demo-site", icon: <Monitor className="h-4 w-4" />
            },
            {
                key: "documentation", label: "Documentation", href: "/#documentation", icon: <FileText className="h-4 w-4" />
            },
        ],
        breadcrumb: [
            {
                key: "focus-ring", label: "Focus Ring", href: "/#focus-ring", icon: <Target className="h-4 w-4" />
            },
            {
                key: "router-links", label: "Router Links", href: "/#router-links", icon: <Globe className="h-4 w-4" />
            },
        ],
    };

    const renderDemoItemLink = useCallback<NonNullable<ResponsiveBreadcrumbProps["renderItemLink"]>>(
        ({ href, children, onClick, ariaDisabled, itemProp, index }) => (
            <Link
                ref={index === 0 ? focusRingFirstLinkRef : undefined}
                href={href as Route}
                prefetch={true}
                onClick={onClick}
                aria-disabled={ariaDisabled || undefined}
                itemProp={itemProp}
            >
                {children}
            </Link>
        ),
        [],
    );

    const renderDemoMenuLink = useCallback<NonNullable<ResponsiveBreadcrumbProps["renderMenuLink"]>>(
        ({ href, children, ariaLabel, onClick }) => (
            <Link
                href={href as Route}
                prefetch={true}
                aria-label={ariaLabel}
                onClick={onClick}
            >
                {children}
            </Link>
        ),
        [],
    );

    const handleCollapsibleToggle = (index: number) => {
        setCollapsibleItems(prev => prev.map((item, i) =>
            i === index ? { ...item, canCollapse: !item.canCollapse } : item
        ));
    };

    const handleTruncatableToggle = (index: number) => {
        setTruncatableItems(prev => prev.map((item, i) =>
            i === index ? { ...item, canTruncate: !item.canTruncate } : item
        ));
    };

    const DemoLayout = ({
        children,
        title,
        description,
        controls = null
    }: {
        children: React.ReactNode;
        title: string;
        description: string;
        controls?: React.ReactNode;
    }) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {controls && (
                    <>
                        <Separator className="my-4" />
                        {controls}
                    </>
                )}
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResizablePanelGroup direction="horizontal" className="rounded-lg border h-full">
                    <ResizablePanel defaultSize={20} minSize={10}>
                        <div className="flex h-full items-center justify-center p-4 bg-muted/30">
                            <div className="text-center space-y-2">
                                <Package className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Sidebar</p>
                            </div>
                        </div >
                    </ResizablePanel >
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={80}>
                        <div className="flex flex-col h-full">
                            <div className="border-b p-4 bg-card">
                                {children}
                            </div>
                            <div className="flex-1 p-6 flex items-center justify-center">
                                < div className="text-center space-y-2">
                                    < Monitor className="h-12 w-12 mx-auto text-muted-foreground" />
                                    < p className="text-muted-foreground">
                                        Main content area - resize to see breadcrumb adapt
                                    </p >
                                </div >
                            </div >
                        </div >
                    </ResizablePanel >
                </ResizablePanelGroup >
            </CardContent >
        </Card >
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            < div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    < h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Final Responsive Breadcrumb Demo
                    </h1 >
                    <p className="text-muted-foreground text-lg">
                        Comprehensive showcase of all breadcrumb features including responsive design, tree navigation, and advanced configurations
                    </p >
                </div >

                {/* Global Controls */}
                < Card className="mb-8">
                    < CardHeader >
                        <CardTitle className="flex items-center gap-2">
                            < Settings className="h-5 w-5" />
                            Global Configuration
                        </CardTitle >
                        <CardDescription>
                            These settings apply to the comprehensive demo and serve as defaults for other demos
                        </CardDescription>
                    </CardHeader >
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        < div className="space-y-2">
                            < Label htmlFor="global-strategy">Collapse Strategy</Label>
                            < Select value={globalStrategy} onValueChange={(v: any) => setGlobalStrategy(v)
                            }>
                                <SelectTrigger id="global-strategy">
                                    < SelectValue />
                                </SelectTrigger >
                                <SelectContent>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="start">Start</SelectItem>
                                    < SelectItem value="end">End</SelectItem>
                                    < SelectItem value="none">None (Follow Preference)</SelectItem>
                                </SelectContent >
                            </Select >
                        </div >

                        <div className="space-y-2">
                            < Label htmlFor="global-preference">Collapse Preference</Label>
                            < Select value={globalPreference} onValueChange={(v: any) => setGlobalPreference(v)}>
                                <SelectTrigger id="global-preference">
                                    < SelectValue />
                                </SelectTrigger >
                                <SelectContent>
                                    <SelectItem value="minimize-count">Minimize Count</SelectItem>
                                    <SelectItem value="minimize-visibility">Minimize Visibility</SelectItem>
                                    <SelectItem value="none">None (Sequential/Alternating)</SelectItem>
                                </SelectContent >
                            </Select >
                        </div >

                        <div className="space-y-2">
                            < div className="flex items-center space-x-2">
                                < Checkbox
                                    id="global-homeIcon"
                                    checked={globalShowHomeIcon}
                                    onCheckedChange={(checked) => setGlobalShowHomeIcon(checked === true)}
                                />
                                < Label htmlFor="global-homeIcon" className="cursor-pointer">
                                    Show Home Icon
                                </Label >
                            </div >
                        </div >

                        <div className="space-y-2">
                            < div className="flex items-center space-x-2">
                                < Checkbox
                                    id="global-nextArrow"
                                    checked={globalShowNextArrow}
                                    onCheckedChange={(checked) => setGlobalShowNextArrow(checked === true)}
                                />
                                < Label htmlFor="global-nextArrow" className="cursor-pointer">
                                    Show Next Arrow
                                </Label >
                            </div >
                        </div >
                    </CardContent >
                </Card >

                {/* Demo Tabs */}
                < Tabs defaultValue="comprehensive" className="space-y-6">
                    < TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
                        < TabsTrigger value="comprehensive" className="text-xs">Comprehensive</TabsTrigger>
                        < TabsTrigger value="strategies" className="text-xs">Strategies</TabsTrigger>
                        < TabsTrigger value="mobile" className="text-xs">Mobile/Truncation</TabsTrigger>
                        < TabsTrigger value="multi-ellipsis" className="text-xs">Multi-Ellipsis</TabsTrigger>
                        < TabsTrigger value="tree" className="text-xs">Tree Navigation</TabsTrigger>
                        < TabsTrigger value="focus-ring" className="text-xs">Focus Rings</TabsTrigger>
                        < TabsTrigger value="display-modes" className="text-xs">Display Modes</TabsTrigger>
                        < TabsTrigger value="collapsible" className="text-xs">Collapsible Control</TabsTrigger>
                        < TabsTrigger value="debug" className="text-xs">Debug Mode</TabsTrigger>
                    </TabsList >

                    {/* Comprehensive Demo */}
                    < TabsContent value="comprehensive">
                        < DemoLayout
                            title="Comprehensive Feature Demo"
                            description="Interactive demo showcasing all features together - resize to see adaptive behavior"
                        >
                            <ResponsiveBreadcrumb
                                items={scenarios.comprehensive}
                                strategy={globalStrategy}
                                preference={globalPreference}
                                showHomeIcon={globalShowHomeIcon}
                                showNextArrow={globalShowNextArrow}
                                nextItems={nextItems}
                                separatorNavItems={{
                                    admin: [
                                        {
                                            key: "users-alt", label: "Alternative Users", href: "/admin/users-alt", icon: <Users className="h-4 w-4" />
                                        },
                                        {
                                            key: "settings", label: "System Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" />
                                        },
                                        { key: "logs", label: "System Logs", href: "/admin/logs", icon: <FileText className="h-4 w-4" /> },
                                    ]
                                }}
                                onItemClick={(item) => console.log("Clicked:", item)}
                                titleOnlyFallback="Edit Super Admin Role"
                                titleOnlyIcon={< Settings className="h-4 w-4" />}
                            />
                        </DemoLayout >

                        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            < Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Target className="h-4 w-4 text-green-600" />
                                    Active Features
                                </h3 >
                                <div className="space-y-1 text-sm">
                                    < div className="flex items-center gap-2">
                                        < Badge variant="secondary" className="text-xs">Responsive</Badge>
                                        < span className="text-muted-foreground">Desktop/Mobile</span>
                                    </div >
                                    <div className="flex items-center gap-2">
                                        < Badge variant="secondary" className="text-xs">Tree Nav</Badge>
                                        < span className="text-muted-foreground">Separator clicks</span>
                                    </div >
                                    <div className="flex items-center gap-2">
                                        < Badge variant="secondary" className="text-xs">Next Arrow</Badge>
                                        < span className="text-muted-foreground">Forward navigation</span>
                                    </div >
                                    <div className="flex items-center gap-2">
                                        < Badge variant="secondary" className="text-xs">Icons</Badge>
                                        < span className="text-muted-foreground">Custom icons</span>
                                    </div >
                                </div >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Monitor className="h-4 w-4 text-blue-600" />
                                    Breakpoint Behavior
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    < p > <strong>Desktop:</strong> Popovers for navigation</ p>
                                    <p><strong>Mobile:</strong> Drawers with full screen</p>
                                    <p><strong>Transition:</strong> Smooth responsive switching</p>
                                </div>
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Eye className="h-4 w-4 text-purple-600" />
                                    Visual Cues
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    < p > <strong>Ellipsis:</strong> Shows collapsed items</p >
                                    <p><strong>Hover:</strong> Interactive separators</p>
                                    <p><strong>Icons:</strong> Contextual navigation</p>
                                </div >
                            </Card >
                        </div >
                    </TabsContent >

                    {/* Strategies Demo */}
                    < TabsContent value="strategies">
                        < DemoLayout
                            title="Collapse Strategies & Preferences"
                            description="Compare different collapsing strategies and preferences to find the optimal behavior"
                            controls={
                                < div className="grid gap-4 md:grid-cols-2">
                                    < div className="space-y-2">
                                        < Label htmlFor="strategy-demo">Collapse Strategy</Label>
                                        < Select value={strategyDemo} onValueChange={(v: any) => setStrategyDemo(v)}>
                                            <SelectTrigger id="strategy-demo">
                                                < SelectValue />
                                            </SelectTrigger >
                                            <SelectContent>
                                                <SelectItem value="center">Center - Collapse from middle</SelectItem>
                                                <SelectItem value="start">Start - Collapse from beginning</SelectItem>
                                                < SelectItem value="end">End - Collapse from end</SelectItem>
                                                < SelectItem value="none">None - Follow preference only</SelectItem>
                                            </SelectContent >
                                        </Select >
                                    </div >

                                    <div className="space-y-2">
                                        < Label htmlFor="preference-demo">Collapse Preference</Label>
                                        < Select value={preferenceDemo} onValueChange={(v: any) => setPreferenceDemo(v)}>
                                            <SelectTrigger id="preference-demo">
                                                < SelectValue />
                                            </SelectTrigger >
                                            <SelectContent>
                                                <SelectItem value="minimize-count">Minimize Count - Fewest items</SelectItem>
                                                <SelectItem value="minimize-visibility">Minimize Visibility - Smallest items</SelectItem>
                                                <SelectItem value="none">None - Sequential/Alternating</SelectItem>
                                            </SelectContent >
                                        </Select >
                                    </div >
                                </div >
                            }
                        >
                            <ResponsiveBreadcrumb
                                items={scenarios.ecommerce}
                                strategy={strategyDemo}
                                preference={preferenceDemo}
                                showHomeIcon={true}
                                onItemClick={(item) => console.log("Clicked:", item)}
                            />
                        </DemoLayout>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4 text-blue-600" />
                                    Center Strategy
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Collapses items from the middle outward, preserving context at both ends.
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    Best for navigation depth
                                </Badge>
                            </Card>

                            <Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < ChevronRight className="h-4 w-4 text-green-600" />
                                    Start Strategy
                                </h3 >
                                <p className="text-sm text-muted-foreground mb-2">
                                    Collapses from the beginning, keeping recent navigation visible.
                                </p >
                                <Badge variant="outline" className="text-xs">
                                    Best for current focus
                                </Badge >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < ChevronRight className="h-4 w-4 text-purple-600" />
                                    End Strategy
                                </h3 >
                                <p className="text-sm text-muted-foreground mb-2">
                                    Collapses from the end, maintaining root context visibility.
                                </p >
                                <Badge variant="outline" className="text-xs">
                                    Best for hierarchy view
                                </Badge >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < ChevronRight className="h-4 w-4 text-orange-600" />
                                    None Strategy
                                </h3 >
                                <p className="text-sm text-muted-foreground mb-2">
                                    Starts with optimal item, expands ellipsis by comparing adjacent items based on preference.
                                </p >
                                <Badge variant="outline" className="text-xs">
                                    Optimal expansion
                                </Badge >
                            </Card >
                        </div >

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <Card className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-blue-600" />
                                    Minimize Count
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Collapses the fewest items possible by choosing larger items first.
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    Fewer ellipsis items
                                </Badge>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-green-600" />
                                    Minimize Visibility
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Reduces visual footprint by collapsing smaller items first.
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    Compact appearance
                                </Badge>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-purple-600" />
                                    None Preference
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    No size preference - collapses sequentially or alternates (for center strategy).
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    Predictable order
                                </Badge>
                            </Card>
                        </div >
                    </TabsContent >

                    {/* Mobile/Truncation Demo */}
                    < TabsContent value="mobile">
                        < DemoLayout
                            title="Mobile Optimization & Truncation"
                            description="Test how the breadcrumb handles very long labels and extreme space constraints with intelligent truncation"
                            controls={
                                < div className="space-y-4">
                                    < div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        < div className="space-y-2">
                                            < div className="flex items-center space-x-2">
                                                < Checkbox
                                                    id="enable-truncation"
                                                    checked={enableTruncation}
                                                    onCheckedChange={(checked) => setEnableTruncation(checked === true)}
                                                />
                                                < Label htmlFor="enable-truncation" className="cursor-pointer">
                                                    Enable Truncation
                                                </Label >
                                            </div >
                                            <p className="text-xs text-muted-foreground">
                                                Gradually shrink items before collapsing them entirely
                                            </p >
                                        </div >

                                        < div className="space-y-2">
                                            < Label htmlFor="truncate-order">Truncation Order</Label>
                                            < Select value={truncateOrder} onValueChange={(v: any) => setTruncateOrder(v)} disabled={!enableTruncation}>
                                                <SelectTrigger id="truncate-order">
                                                    < SelectValue />
                                                </SelectTrigger >
                                                <SelectContent>
                                                    <SelectItem value="biggest-first">Biggest First</SelectItem>
                                                    <SelectItem value="smallest-first">Smallest First</SelectItem>
                                                </SelectContent >
                                            </Select >
                                            <p className="text-xs text-muted-foreground">
                                                Order in which items are truncated
                                            </p >
                                        </div >

                                        < div className="space-y-2">
                                            < Label htmlFor="truncate-min">Min Width: {truncateMinWidth}px</Label>
                                            < Slider
                                                id="truncate-min"
                                                min={0}
                                                max={150}
                                                step={10}
                                                value={[truncateMinWidth]}
                                                onValueChange={(values) => setTruncateMinWidth(values[0])}
                                                className="w-full"
                                                disabled={!enableTruncation}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Minimum width before item stops truncating
                                            </p >
                                        </div >

                                        < div className="space-y-2">
                                            < Label htmlFor="truncate-max">Max Width: {truncateMaxWidth}px</Label>
                                            < Slider
                                                id="truncate-max"
                                                min={0}
                                                max={400}
                                                step={25}
                                                value={[truncateMaxWidth]}
                                                onValueChange={(values) => setTruncateMaxWidth(values[0])}
                                                className="w-full"
                                                disabled={!enableTruncation}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Maximum width - items larger than this will truncate
                                            </p >
                                        </div >

                                        < div className="space-y-2">
                                            < Label htmlFor="truncate-threshold">Threshold: {truncateThreshold}px</Label>
                                            < Slider
                                                id="truncate-threshold"
                                                min={0}
                                                max={300}
                                                step={20}
                                                value={[truncateThreshold]}
                                                onValueChange={(values) => setTruncateThreshold(values[0])}
                                                className="w-full"
                                                disabled={!enableTruncation}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Items wider than this become candidates for truncation
                                            </p >
                                        </div >

                                        < div className="space-y-2">
                                            < div className="flex items-center space-x-2">
                                                < Checkbox
                                                    id="title-only"
                                                    checked={showTitleOnly}
                                                    onCheckedChange={(checked) => setShowTitleOnly(checked === true)}
                                                />
                                                < Label htmlFor="title-only" className="cursor-pointer">
                                                    Enable Title - Only Fallback
                                                </Label >
                                            </div >
                                            <p className="text-xs text-muted-foreground">
                                                When enabled, shows only title when space is extremely limited
                                            </p >
                                        </div >

                                        <div className="space-y-2">
                                            < Label htmlFor="title-text">Title-Only Text</Label>
                                            < Select value={titleOnlyText} onValueChange={setTitleOnlyText} >
                                                <SelectTrigger id="title-text">
                                                    < SelectValue />
                                                </SelectTrigger >
                                                <SelectContent>
                                                    <SelectItem value="Current Page">Current Page</SelectItem>
                                                    <SelectItem value="Item Details">Item Details</SelectItem>
                                                    < SelectItem value="Product Information">Product Information</SelectItem>
                                                </SelectContent >
                                            </Select >
                                        </div >
                                    </div >

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Item Truncation Control</Label>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Toggle which items can be truncated. Non-truncatable items will keep their full width.
                                        </p>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {truncatableItems.map((item, index) => (
                                                <div key={item.key} className="flex items-center space-x-2 p-2 border rounded">
                                                    <Checkbox
                                                        id={`truncatable-${index}`}
                                                        checked={item.canTruncate}
                                                        onCheckedChange={() => handleTruncatableToggle(index)}
                                                        disabled={!enableTruncation}
                                                    />
                                                    <Label
                                                        htmlFor={`truncatable-${index}`}
                                                        className="cursor-pointer text-sm flex-1 truncate"
                                                    >
                                                        {item.label}
                                                    </Label>
                                                    {!item.canTruncate && (
                                                        <Badge variant="secondary" className="text-xs">Fixed</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div >
                            }
                        >
                            <ResponsiveBreadcrumb
                                items={truncatableItems}
                                strategy="center"
                                preference="minimize-visibility"
                                showHomeIcon={true}
                                titleOnlyFallback={showTitleOnly ? titleOnlyText : undefined}
                                titleOnlyIcon={< Smartphone className="h-4 w-4" />}
                                onItemClick={(item) => console.log("Clicked:", item)}
                                enableTruncation={enableTruncation}
                                truncateMinWidth={truncateMinWidth}
                                truncateMaxWidth={truncateMaxWidth}
                                truncateThreshold={truncateThreshold}
                                truncateOrder={truncateOrder}
                            />
                        </DemoLayout >

                        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            < Card className="p-4 md:col-span-2 lg:col-span-3">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < Target className="h-4 w-4 text-purple-600" />
                                    How Truncation Works
                                </h3 >
                                <div className="grid gap-4 md:grid-cols-3 text-sm">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-purple-600 dark:text-purple-400">Phase 1: Truncate</h4>
                                        <p className="text-muted-foreground">
                                            Items wider than the threshold are gradually shrunk based on the selected order (biggest-first or smallest-first).
                                            Each item has a minimum width it won't shrink past. Icons never shrink. Toggle individual items to control which can be truncated.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Phase 2: Collapse</h4>
                                        <p className="text-muted-foreground">
                                            Once all truncatable items hit their minimum width, the component starts
                                            collapsing items into the ellipsis menu using the selected strategy.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-red-600 dark:text-red-400">Phase 3: Title-Only</h4>
                                        <p className="text-muted-foreground">
                                            If even full collapse doesn't fit, the component falls back to showing only
                                            the title text with CSS truncation.
                                        </p>
                                    </div>
                                </div>
                            </Card >
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            < Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Monitor className="h-4 w-4 text-blue-600" />
                                    Desktop
                                </h3 >
                                <p className="text-sm text-muted-foreground">
                                    Full labels visible with intelligent truncation
                                </p >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Tablet className="h-4 w-4 text-green-600" />
                                    Tablet
                                </h3 >
                                <p className="text-sm text-muted-foreground">
                                    Moderate collapsing with readable labels
                                </p >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Smartphone className="h-4 w-4 text-orange-600" />
                                    Mobile
                                </h3 >
                                <p className="text-sm text-muted-foreground">
                                    Aggressive collapsing with drawer navigation
                                </p >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-2 flex items-center gap-2">
                                    < Target className="h-4 w-4 text-red-600" />
                                    Extreme
                                </h3 >
                                <p className="text-sm text-muted-foreground">
                                    Title - only mode when no space available
                                </p >
                            </Card >
                        </div >
                    </TabsContent >

                    {/* Multi-Ellipsis Demo */}
                    < TabsContent value="multi-ellipsis">
                        < DemoLayout
                            title="Multi-Ellipsis Support"
                            description="Test breadcrumbs with multiple non-collapsible items creating separate ellipsis groups"
                            controls={
                                < div className="space-y-4">
                                    < div className="grid gap-4 md:grid-cols-3">
                                        < div className="space-y-2">
                                            < div className="flex items-center space-x-2">
                                                < Checkbox
                                                    id="allow-multi-ellipsis"
                                                    checked={allowMultipleEllipses}
                                                    onCheckedChange={(checked) => setAllowMultipleEllipses(checked === true)}
                                                />
                                                < Label htmlFor="allow-multi-ellipsis" className="cursor-pointer">
                                                    Allow Multiple Ellipses
                                                </Label >
                                            </div >
                                            < p className="text-xs text-muted-foreground pl-6">
                                                Enable detection of multiple collapsible blocks
                                            </p >
                                        </div >

                                        < div className="space-y-2">
                                            < Label htmlFor="grouping-mode">Grouping Mode</Label>
                                            < Select value={grouping} onValueChange={(v: any) => setGrouping(v)}>
                                                < SelectTrigger id="grouping-mode" disabled={!allowMultipleEllipses}>
                                                    < SelectValue />
                                                </SelectTrigger >
                                                < SelectContent>
                                                    < SelectItem value="contiguous">Contiguous (Single Block)</SelectItem>
                                                    < SelectItem value="free">Free (By canCollapse)</SelectItem>
                                                    < SelectItem value="smart">Smart (Optimal Multi)</SelectItem>
                                                </SelectContent >
                                            </Select >
                                        </div >

                                        < div className="space-y-2">
                                            < Label htmlFor="multi-preference">Collapse Preference</Label>
                                            < Select value={multiEllipsisPreference} onValueChange={(v: any) => setMultiEllipsisPreference(v)}>
                                                < SelectTrigger id="multi-preference">
                                                    < SelectValue />
                                                </SelectTrigger >
                                                < SelectContent>
                                                    < SelectItem value="minimize-count">Minimize Count</SelectItem>
                                                    < SelectItem value="minimize-visibility">Minimize Visibility</SelectItem>
                                                    < SelectItem value="none">None (Sequential)</SelectItem>
                                                </SelectContent >
                                            </Select >
                                        </div >
                                    </div >

                                    < Separator />

                                    < div className="space-y-2">
                                        < h4 className="text-sm font-medium">Scenario Explanation</h4>
                                        {grouping === "smart" ? (
                                            <>
                                                < p className="text-xs text-muted-foreground">
                                                    Smart mode: All 9 items are collapsible with varying label lengths. The algorithm dynamically decides
                                                    where to create ellipses based on efficiency and preference, not fixed by canCollapse boundaries.
                                                </p >
                                                < div className="grid gap-2 md:grid-cols-3 text-xs">
                                                    < div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                        < span className="font-medium text-blue-700 dark:text-blue-300">Long Labels:</span>
                                                        < span className="text-muted-foreground"> "Enterprise Dashboard Platform", "Advanced Analytics Suite", etc.</span>
                                                    </div >
                                                    < div className="p-2 rounded bg-green-50 dark:bg-green-950/20">
                                                        < span className="font-medium text-green-700 dark:text-green-300">Short Labels:</span>
                                                        < span className="text-muted-foreground"> "Home", "Reports", "Data", "Charts"</span>
                                                    </div >
                                                    < div className="p-2 rounded bg-purple-50 dark:bg-purple-950/20">
                                                        < span className="font-medium text-purple-700 dark:text-purple-300">Smart Choice:</span>
                                                        < span className="text-muted-foreground"> Creates multiple ellipses at optimal positions</span>
                                                    </div >
                                                </div >
                                            </>
                                        ) : (
                                            <>
                                                < p className="text-xs text-muted-foreground">
                                                    Free/Contiguous mode: Non-collapsible items at positions 0 (Home), 3 (Profile), and 6 (Settings).
                                                    In "Free" mode, this creates three fixed blocks that collapse independently.
                                                </p >
                                                < div className="grid gap-2 md:grid-cols-3 text-xs">
                                                    < div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                        < span className="font-medium text-blue-700 dark:text-blue-300">Block 1:</span>
                                                        < span className="text-muted-foreground"> Dashboard, Reports (items 1-2)</span>
                                                    </div >
                                                    < div className="p-2 rounded bg-green-50 dark:bg-green-950/20">
                                                        < span className="font-medium text-green-700 dark:text-green-300">Block 2:</span>
                                                        < span className="text-muted-foreground"> Analytics, Metrics (items 4-5)</span>
                                                    </div >
                                                    < div className="p-2 rounded bg-purple-50 dark:bg-purple-950/20">
                                                        < span className="font-medium text-purple-700 dark:text-purple-300">Block 3:</span>
                                                        < span className="text-muted-foreground"> Security, Privacy (items 7-8)</span>
                                                    </div >
                                                </div >
                                            </>
                                        )}
                                    </div >
                                </div >
                            }
                        >
                            < ResponsiveBreadcrumb
                                items={
                                    grouping === "smart"
                                        ? [
                                            // Smart mode: All items collapsible, varying sizes for optimal multi-ellipsis
                                            { key: "home", label: "Home", href: "/", canCollapse: true },
                                            { key: "dashboard", label: "Enterprise Dashboard Platform", href: "/dashboard", canCollapse: true },
                                            { key: "reports", label: "Reports", href: "/dashboard/reports", canCollapse: true },
                                            { key: "analytics", label: "Advanced Analytics Suite", href: "/analytics", canCollapse: true },
                                            { key: "data", label: "Data", href: "/analytics/data", canCollapse: true },
                                            { key: "visualizations", label: "Interactive Visualizations Center", href: "/analytics/data/viz", canCollapse: true },
                                            { key: "charts", label: "Charts", href: "/analytics/data/viz/charts", canCollapse: true },
                                            { key: "settings", label: "Configuration & Settings Manager", href: "/settings", canCollapse: true },
                                            { key: "current", label: "Current Page View", canCollapse: true },
                                        ]
                                        : [
                                            // Free/Contiguous mode: Fixed non-collapsible splits
                                            { key: "home", label: "Home", href: "/", canCollapse: false, icon: <HomeIcon className="h-4 w-4" /> },
                                            { key: "dashboard", label: "Dashboard", href: "/dashboard", canCollapse: true },
                                            { key: "reports", label: "Reports", href: "/dashboard/reports", canCollapse: true },
                                            { key: "profile", label: "Profile", href: "/profile", canCollapse: false, icon: <Users className="h-4 w-4" /> },
                                            { key: "analytics", label: "Analytics", href: "/profile/analytics", canCollapse: true },
                                            { key: "metrics", label: "Metrics", href: "/profile/analytics/metrics", canCollapse: true },
                                            { key: "settings", label: "Settings", href: "/settings", canCollapse: false, icon: <Settings className="h-4 w-4" /> },
                                            { key: "security", label: "Security", href: "/settings/security", canCollapse: true },
                                            { key: "privacy", label: "Privacy Settings", canCollapse: true },
                                        ]
                                }
                                strategy="start"
                                preference={multiEllipsisPreference}
                                showHomeIcon={true}
                                allowMultipleEllipses={allowMultipleEllipses}
                                grouping={grouping}
                                onItemClick={(item) => console.log("Multi-ellipsis clicked:", item)}
                            />
                        </DemoLayout >

                        < div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < Target className="h-4 w-4 text-blue-600" />
                                    {grouping === "smart" ? "Smart Algorithm" : "How It Works"}
                                </h3 >
                                < div className="space-y-2 text-sm text-muted-foreground">
                                    {grouping === "smart" ? (
                                        <>
                                            < p >• Evaluates each item for collapse efficiency</p>
                                            < p >• Decides: expand existing or create new ellipsis?</p>
                                            < p >• Can create ellipses anywhere, not just at splits</p>
                                            < p >• Optimizes based on item sizes & preference</p>
                                        </>
                                    ) : (
                                        <>
                                            < p >• Detects contiguous collapsible regions</p>
                                            < p >• Separates blocks by non-collapsible items</p>
                                            < p >• Creates independent ellipsis for each block</p>
                                            < p >• Incremental collapse across all blocks</p>
                                        </>
                                    )}
                                </div >
                            </Card >

                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < Eye className="h-4 w-4 text-green-600" />
                                    Grouping Modes
                                </h3 >
                                < div className="space-y-2 text-sm text-muted-foreground">
                                    < p >• <span className="font-medium">Contiguous:</span> Single ellipsis block (original)</p>
                                    < p >• <span className="font-medium">Free:</span> Multiple ellipses split by canCollapse</p>
                                    < p >• <span className="font-medium">Smart:</span> Optimal multi-ellipsis anywhere</p>
                                    < p >• Smart ignores canCollapse, Free respects it</p>
                                </div >
                            </Card >

                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < Ruler className="h-4 w-4 text-purple-600" />
                                    {grouping === "smart" ? "Efficiency-Driven" : "Selection Strategy"}
                                </h3 >
                                < div className="space-y-2 text-sm text-muted-foreground">
                                    {grouping === "smart" ? (
                                        <>
                                            < p >• <span className="font-medium">Minimize-count:</span> Collapse biggest items</p>
                                            < p >• <span className="font-medium">Minimize-visibility:</span> Collapse smallest items</p>
                                            < p >• Creates new ellipsis if more efficient</p>
                                            < p >• Dynamic positioning for optimal space</p>
                                        </>
                                    ) : (
                                        <>
                                            < p >• Collapses one item at a time per block</p>
                                            < p >• Uses preference to pick next item</p>
                                            < p >• When block is full, moves to next block</p>
                                            < p >• Stops when total width fits</p>
                                        </>
                                    )}
                                </div >
                            </Card >
                        </div >

                        < div className="mt-4 grid gap-4 md:grid-cols-2">
                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < FileText className="h-4 w-4 text-orange-600" />
                                    {grouping === "smart" ? "Smart Mode Example" : "Free Mode Example"}
                                </h3 >
                                < div className="space-y-2">
                                    {grouping === "smart" ? (
                                        <>
                                            < p className="text-sm text-muted-foreground">
                                                With all items collapsible and varying sizes:
                                            </p >
                                            < div className="text-xs font-mono p-2 rounded bg-muted">
                                                Home &gt; <span className="text-red-600">Enterprise Dashboard</span> &gt; Reports &gt; <span className="text-red-600">Advanced Analytics</span> &gt; Data &gt; <span className="text-red-600">Interactive Visualizations</span> &gt; Charts
                                            </div >
                                            < p className="text-sm text-muted-foreground">
                                                Smart mode with minimize-count preference:
                                            </p >
                                            < div className="text-xs font-mono p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                Home &gt; <span className="text-yellow-600">...</span> &gt; Reports &gt; <span className="text-yellow-600">...</span> &gt; Data &gt; <span className="text-yellow-600">...</span> &gt; Charts
                                            </div >
                                            < Badge variant="outline" className="text-xs">
                                                Collapses 3 biggest items into separate ellipses
                                            </Badge >
                                        </>
                                    ) : (
                                        <>
                                            < p className="text-sm text-muted-foreground">
                                                With fixed non-collapsible waypoints (Home, Profile, Settings):
                                            </p >
                                            < div className="text-xs font-mono p-2 rounded bg-muted">
                                                <span className="text-blue-600 font-semibold">Home</span> &gt; A &gt; B &gt; <span className="text-blue-600 font-semibold">Profile</span> &gt; C &gt; D &gt; <span className="text-blue-600 font-semibold">Settings</span> &gt; E &gt; F
                                            </div >
                                            < p className="text-sm text-muted-foreground">
                                                Free mode creates three fixed blocks:
                                            </p >
                                            < div className="text-xs font-mono p-2 rounded bg-green-50 dark:bg-green-950/20">
                                                <span className="text-blue-600 font-semibold">Home</span> &gt; <span className="text-yellow-600">...</span> &gt; <span className="text-blue-600 font-semibold">Profile</span> &gt; <span className="text-yellow-600">...</span> &gt; <span className="text-blue-600 font-semibold">Settings</span> &gt; <span className="text-yellow-600">...</span>
                                            </div >
                                            < Badge variant="outline" className="text-xs">
                                                Three ellipses at predetermined positions
                                            </Badge >
                                        </>
                                    )}
                                </div >
                            </Card >

                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < Bug className="h-4 w-4 text-red-600" />
                                    Test Scenarios
                                </h3 >
                                < div className="space-y-2 text-sm text-muted-foreground">
                                    {grouping === "smart" ? (
                                        <>
                                            < p >• <span className="font-medium">Resize narrow:</span> Watch smart ellipsis placement</p>
                                            < p >• <span className="font-medium">Toggle preference:</span> See different items collapse</p>
                                            < p >• <span className="font-medium">Compare with Free:</span> Notice positioning difference</p>
                                            < p >• <span className="font-medium">Try minimize-visibility:</span> Small items collapse first</p>
                                        </>
                                    ) : (
                                        <>
                                            < p >• <span className="font-medium">Narrow container:</span> Watch multiple ellipses appear</p>
                                            < p >• <span className="font-medium">Toggle mode:</span> Switch between free and contiguous</p>
                                            < p >• <span className="font-medium">Change preference:</span> See different collapse order</p>
                                            < p >• <span className="font-medium">Disable feature:</span> Falls back to single ellipsis</p>
                                        </>
                                    )}
                                </div >
                            </Card >
                        </div >

                        < Card className="p-4 mt-4">
                            < h3 className="font-semibold mb-3 flex items-center gap-2">
                                < Settings className="h-4 w-4 text-teal-600" />
                                Implementation Details
                            </h3 >
                            < div className="grid gap-4 md:grid-cols-3 text-sm">
                                {grouping === "smart" ? (
                                    <>
                                        < div >
                                            < h4 className="font-medium mb-2">Efficiency Evaluation</h4>
                                            < div className="space-y-1 text-muted-foreground text-xs">
                                                < p >• No fixed block detection</p>
                                                < p >• Evaluates each uncollapsed item</p>
                                                < p >• Compares: expand vs create new</p>
                                                < p >• Chooses based on efficiency score</p>
                                            </div >
                                        </div >
                                        < div >
                                            < h4 className="font-medium mb-2">Dynamic Decisions</h4>
                                            < div className="space-y-1 text-muted-foreground text-xs">
                                                < p >• Expand if adjacent & efficient</p>
                                                < p >• New ellipsis if isolated item</p>
                                                < p >• Preference guides scoring</p>
                                                < p >• Iterates until width fits</p>
                                            </div >
                                        </div >
                                        < div >
                                            < h4 className="font-medium mb-2">Rendering</h4>
                                            < div className="space-y-1 text-muted-foreground text-xs">
                                                < p >• Dynamic ellipsis positioning</p>
                                                < p >• Can appear anywhere</p>
                                                < p >• Independent drawer/popover state</p>
                                                < p >• Ignores canCollapse boundaries</p>
                                            </div >
                                        </div >
                                    </>
                                ) : (
                                    <>
                                        < div >
                                            < h4 className="font-medium mb-2">Block Detection</h4>
                                            < div className="space-y-1 text-muted-foreground text-xs">
                                                < p >• O(n) single pass through items</p>
                                                < p >• Finds maximal contiguous regions</p>
                                                < p >• Splits on canCollapse=false items</p>
                                                < p >• Stores block boundaries [start, end]</p>
                                            </div >
                                        </div >
                                        < div >
                                            < h4 className="font-medium mb-2">Incremental Collapse</h4>
                                            < div className="space-y-1 text-muted-foreground text-xs">
                                                < p >• Collapses one item at a time</p>
                                                < p >• Uses preference to pick next item</p>
                                                < p >• Checks width after each addition</p>
                                                < p >• Returns when width fits</p>
                                            </div >
                                        </div >
                                        < div >
                                            < h4 className="font-medium mb-2">Rendering</h4>
                                            < div className="space-y-1 text-muted-foreground text-xs">
                                                < p >• Each block renders one ellipsis</p>
                                                < p >• Proper separator handling</p>
                                                < p >• Independent drawer/popover state</p>
                                                < p >• Respects canCollapse boundaries</p>
                                            </div >
                                        </div >
                                    </>
                                )}
                            </div >
                        </Card >
                    </TabsContent >

                    {/* Tree Navigation Demo */}
                    < TabsContent value="tree">
                        < DemoLayout
                            title="Tree Navigation & Forward Navigation"
                            description="Click on separators to navigate between same-level items and use the next arrow for forward navigation"
                        >
                            <ResponsiveBreadcrumb
                                items={scenarios.tree}
                                strategy="center"
                                preference="minimize-count"
                                showHomeIcon={true}
                                showNextArrow={true}
                                nextItems={
                                    [
                                        {
                                            key: "events", label: "Upcoming Events", href: "/regions/na/us/ca/sf/events", icon: <Calendar className="h-4 w-4" />
                                        },
                                        {
                                            key: "weather", label: "Weather Forecast", href: "/regions/na/us/ca/sf/weather", icon: <Globe className="h-4 w-4" />
                                        },
                                        {
                                            key: "businesses", label: "Local Businesses", href: "/regions/na/us/ca/sf/business", icon: <Building className="h-4 w-4" />
                                        },
                                    ]
                                }
                                separatorNavItems={treeNavigation}
                                onItemClick={(item) => console.log("Tree navigation clicked:", item)}
                            />
                        </DemoLayout >

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < ChevronDown className="h-4 w-4 text-blue-600" />
                                    Separator Navigation
                                </h3 >
                                <div className="space-y-2 text-sm">
                                    < p className="text-muted-foreground">
                                        Click on arrows between breadcrumb items to see same - level navigation options.
                                    </p >
                                    <div className="space-y-1">
                                        < p > <strong>Region →</strong> Europe, Asia Pacific, Africa</p >
                                        <p><strong>Country →</strong> Canada, Mexico</p>
                                        <p><strong>State →</strong> New York, Texas, Florida</p>
                                    </div >
                                </div >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < ChevronRight className="h-4 w-4 text-green-600" />
                                    Forward Navigation
                                </h3 >
                                <div className="space-y-2 text-sm">
                                    < p className="text-muted-foreground">
                                        The next arrow after the last item shows what you can navigate to next.
                                    </p >
                                    <div className="space-y-1">
                                        < p > <strong>Events:</strong> Upcoming city events</p >
                                        <p><strong>Weather:</strong> Local forecast</p>
                                        <p><strong>Business:</strong> Local directory</p>
                                    </div >
                                </div >
                            </Card >
                        </div >
                    </TabsContent >

                    {/* Focus Ring & Router Link Demo */}
                    < TabsContent value="focus-ring">
                        < DemoLayout
                            title="Focus Rings & Router Links"
                            description="Compare focus ring modes in constrained collapse layouts and verify custom router links with next/link render props."
                            controls={
                                < div className="grid gap-4 md:grid-cols-3">
                                    < div className="space-y-2">
                                        < Label htmlFor="focus-ring-mode">Focus Ring</Label>
                                        < Select value={focusRingDemo} onValueChange={(v: any) => setFocusRingDemo(v)}>
                                            <SelectTrigger id="focus-ring-mode">
                                                < SelectValue />
                                            </SelectTrigger >
                                            <SelectContent>
                                                <SelectItem value="inset">Inset - collapse default</SelectItem>
                                                <SelectItem value="outer">Outer - shadcn style</SelectItem>
                                                <SelectItem value="clip-margin">Clip Margin - progressive</SelectItem>
                                                <SelectItem value="none">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="focus-ring-overflow">Overflow Behavior</Label>
                                        <Select value={focusRingOverflow} onValueChange={(v: any) => setFocusRingOverflow(v)}>
                                            <SelectTrigger id="focus-ring-overflow">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="collapse">Collapse</SelectItem>
                                                <SelectItem value="scroll">Scroll</SelectItem>
                                                <SelectItem value="wrap">Wrap</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="focus-ring-width">
                                            Demo Width: {focusRingWidth}px
                                        </Label>
                                        <Slider
                                            id="focus-ring-width"
                                            min={240}
                                            max={720}
                                            step={20}
                                            value={[focusRingWidth]}
                                            onValueChange={(value) => setFocusRingWidth(value[0])}
                                        />
                                    </div>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <div
                                    className="rounded-md border bg-background p-3 shadow-xs"
                                    style={{ width: `${focusRingWidth}px`, maxWidth: "100%" }}
                                >
                                    <ResponsiveBreadcrumb
                                        items={scenarios.focusRing}
                                        strategy="center"
                                        preference="minimize-count"
                                        alwaysShow={{ head: 1, tail: 1 }}
                                        separatorNavItems={focusRingSeparatorNav}
                                        separatorNavSide="left"
                                        showHomeIcon={false}
                                        showCurrentInNav="with-others"
                                        showCollapsedCount
                                        enableTruncation
                                        truncateMinWidth={84}
                                        truncateThreshold={132}
                                        fallbackAtWidth={220}
                                        overflowBehavior={focusRingOverflow}
                                        focusRing={focusRingDemo}
                                        renderItemLink={renderDemoItemLink}
                                        renderMenuLink={renderDemoMenuLink}
                                        onItemClick={(item) => console.log("Focus ring demo clicked:", item)}
                                        schema="none"
                                        strings={{
                                            navigateTo: (label) => `Open ${label}`,
                                            showCollapsedItems: (count) =>
                                                count === 1
                                                    ? "Open collapsed breadcrumb item"
                                                    : `Open ${count} collapsed breadcrumb items`,
                                            moreOptions: "Collapsed path",
                                            nextItems: "Next entries",
                                            showSiblingItems: (label) => `Open sibling links for ${label}`,
                                            noItemsAvailable: "No links available",
                                            itemLabelFallback: "breadcrumb item",
                                            truncatedItemTooltip: (label) => label,
                                            measureEllipsis: "Measure collapsed path",
                                            measureNextItems: "Measure next entries",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => focusRingFirstLinkRef.current?.focus({ preventScroll: true })}
                                    >
                                        Focus first crumb
                                    </Button>
                                    <Badge variant="secondary">renderItemLink: next/link</Badge>
                                    <Badge variant="secondary">renderMenuLink: next/link</Badge>
                                    <Badge variant="outline">data-focus-ring="{focusRingDemo}"</Badge>
                                </div>
                            </div>
                        </DemoLayout>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <Card className="p-4">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-green-600" />
                                    Inset Ring
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    The production default for collapse mode. It keeps the shadcn ring color and transition while drawing inside the clipped breadcrumb.
                                </p>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Ruler className="h-4 w-4 text-blue-600" />
                                    Clip Margin
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Optional progressive mode using overflow clipping margin for browsers that support it.
                                </p>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-purple-600" />
                                    Router Links
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Item links and menu links are rendered through the public API, so app routers can provide prefetching without patching the component.
                                </p>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Display Modes Demo */}
                    <TabsContent value="display-modes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Display Modes</CardTitle>
                                <CardDescription>
                                    New rendering modes from the production API: path-aware truncation, compact hover/focus reveal, selected overlay ring, and renderer-only layout animation.
                                </CardDescription>
                                <Separator className="my-4" />
                                <div className="space-y-2">
                                    <Label htmlFor="display-modes-width">
                                        Demo Width: {displayModesWidth}px
                                    </Label>
                                    <Slider
                                        id="display-modes-width"
                                        min={260}
                                        max={760}
                                        step={20}
                                        value={[displayModesWidth]}
                                        onValueChange={(value) => setDisplayModesWidth(value[0])}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <Card className="p-4">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">Path Start/End Truncation</h3>
                                            <Badge variant="outline">truncationMode="path-start-end"</Badge>
                                        </div>
                                        <div
                                            className="rounded-md border bg-background p-3"
                                            style={{ width: `${displayModesWidth}px`, maxWidth: "100%" }}
                                        >
                                            <ResponsiveBreadcrumb
                                                items={scenarios.pathStartEnd}
                                                strategy="center"
                                                preference="minimize-count"
                                                showHomeIcon={false}
                                                enableTruncation
                                                truncationMode="path-start-end"
                                                truncateMinWidth={120}
                                                truncateThreshold={120}
                                                pathTruncation={{
                                                    preserveStartSegments: 1,
                                                    preserveEndSegments: 2,
                                                    minStartWidth: 40,
                                                    minEndWidth: 96,
                                                }}
                                                overflowBehavior="collapse"
                                                focusRing="inset"
                                                animateLayout={{ truncate: true, duration: 180 }}
                                                renderItemLink={renderDemoItemLink}
                                                schema="none"
                                            />
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Long path labels keep useful context from the beginning and the filename-oriented end instead of only clipping the tail.
                                        </p>
                                    </Card>

                                    <Card className="p-4">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">Compact Hover/Focus Reveal</h3>
                                            <Badge variant="outline">truncationMode="compact-reveal"</Badge>
                                            <Badge variant="secondary">token=".."</Badge>
                                        </div>
                                        <div
                                            className="rounded-md border bg-background p-3"
                                            style={{ width: `${displayModesWidth}px`, maxWidth: "100%" }}
                                        >
                                            <ResponsiveBreadcrumb
                                                items={scenarios.compactReveal}
                                                strategy="center"
                                                preference="minimize-count"
                                                showHomeIcon={false}
                                                enableTruncation
                                                truncationMode="compact-reveal"
                                                compactReveal={{
                                                    token: "..",
                                                    revealOn: "both",
                                                    controlledIndex: compactRevealIndex,
                                                    onControlledIndexChange: setCompactRevealIndex,
                                                    alwaysShowHead: 0,
                                                    alwaysShowTail: 1,
                                                }}
                                                overflowBehavior="collapse"
                                                focusRing="inset"
                                                animateLayout
                                                renderItemLink={renderDemoItemLink}
                                                schema="none"
                                            />
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {scenarios.compactReveal.slice(0, -1).map((item, index) => (
                                                <Button
                                                    key={item.key}
                                                    variant={compactRevealIndex === index ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCompactRevealIndex(compactRevealIndex === index ? null : index)}
                                                >
                                                    {item.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </Card>

                                    <Card className="p-4 lg:col-span-2">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">Selected Overlay Ring + Animation</h3>
                                            <Badge variant="outline">selectedRing="overlay"</Badge>
                                            <Badge variant="outline">animateLayout</Badge>
                                        </div>
                                        <div
                                            className="rounded-md border bg-background p-3"
                                            style={{ width: `${displayModesWidth}px`, maxWidth: "100%" }}
                                        >
                                            <ResponsiveBreadcrumb
                                                items={scenarios.compactReveal}
                                                strategy="center"
                                                preference="minimize-count"
                                                showHomeIcon={false}
                                                enableTruncation
                                                truncationMode="compact-reveal"
                                                compactReveal={{
                                                    token: "..",
                                                    revealOn: "both",
                                                    controlledIndex: compactRevealIndex,
                                                    onControlledIndexChange: setCompactRevealIndex,
                                                    alwaysShowHead: 0,
                                                    alwaysShowTail: 1,
                                                }}
                                                selectedRing="overlay"
                                                selectedKey={selectedOverlayKey}
                                                selectedRingClassName="ring-emerald-500/60"
                                                overflowBehavior="collapse"
                                                focusRing="inset"
                                                animateLayout={{ layout: true, presence: true, truncate: true, duration: 220 }}
                                                renderItemLink={renderDemoItemLink}
                                                schema="none"
                                            />
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {scenarios.compactReveal.map((item) => (
                                                <Button
                                                    key={item.key}
                                                    variant={selectedOverlayKey === item.key ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setSelectedOverlayKey(item.key)}
                                                >
                                                    {item.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Collapsible Control Demo */}
                    < TabsContent value="collapsible">
                        < DemoLayout
                            title="Collapsible Item Control"
                            description="Control which items can be collapsed to test different breadcrumb behaviors"
                            controls={
                                < div className="space-y-4">
                                    < p className="text-sm text-muted-foreground">
                                        Toggle which items can be collapsed.Non - collapsible items will always remain visible.
                                    </p >
                                    <div className="grid gap-2 md:grid-cols-3">
                                        {
                                            collapsibleItems.map((item, index) => (
                                                <div key={item.key} className="flex items-center space-x-2 p-2 border rounded">
                                                    < Checkbox
                                                        id={`collapsible-${index}`}
                                                        checked={item.canCollapse}
                                                        onCheckedChange={() => handleCollapsibleToggle(index)}
                                                    />
                                                    <Label htmlFor={`collapsible-${index}`} className="cursor-pointer text-sm">
                                                        {item.label}
                                                    </Label>
                                                    {!item.canCollapse && (
                                                        <Badge variant="secondary" className="text-xs">Protected</Badge>
                                                    )
                                                    }
                                                </div >
                                            ))}
                                    </div >
                                </div >
                            }
                        >
                            <ResponsiveBreadcrumb
                                items={collapsibleItems}
                                strategy="center"
                                preference="minimize-count"
                                showHomeIcon={true}
                                onItemClick={(item) => console.log("Clicked:", item)}
                            />
                        </DemoLayout >

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            < Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < FileText className="h-4 w-4 text-blue-600" />
                                    Collapsible Rules
                                </h3 >
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>• First and last items are protected by default</p >
                                    <p>• Items marked as non-collapsible will never be hidden</p>
                                    <p>• Algorithm respects these constraints when collapsing</p>
                                    <p>• Minimum of one item must always be visible</p>
                                </div >
                            </Card >

                            <Card className="p-4">
                                < h3 className="font-semibold mb-3 flex items-center gap-2">
                                    < Target className="h-4 w-4 text-green-600" />
                                    Test Scenarios
                                </h3 >
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>• Make only middle items collapsible</p >
                                    <p>• Protect important navigation points</p>
                                    <p>• Test extreme cases with all items protected</p>
                                    <p>• Verify graceful degradation</p>
                                </div >
                            </Card >
                        </div >
                    </TabsContent >

                    {/* Debug Mode */}
                    <TabsContent value="debug">
                        {/* Configuration Panel */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Full Configuration Panel
                                </CardTitle>
                                <CardDescription>
                                    Configure all breadcrumb settings and test with different scenarios or create your own custom breadcrumb
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Scenario Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="debug-scenario">Scenario</Label>
                                    <Select value={debugScenario} onValueChange={(v: any) => setDebugScenario(v)}>
                                        <SelectTrigger id="debug-scenario">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="documents">Documents (Preset)</SelectItem>
                                            <SelectItem value="custom">Custom Breadcrumb</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* Core Settings */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        Core Settings
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="debug-strategy">Collapse Strategy</Label>
                                            <Select value={debugStrategy} onValueChange={(v: any) => setDebugStrategy(v)}>
                                                <SelectTrigger id="debug-strategy">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="start">Start</SelectItem>
                                                    <SelectItem value="end">End</SelectItem>
                                                    <SelectItem value="none">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-preference">Collapse Preference</Label>
                                            <Select value={debugPreference} onValueChange={(v: any) => setDebugPreference(v)}>
                                                <SelectTrigger id="debug-preference">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="minimize-count">Minimize Count</SelectItem>
                                                    <SelectItem value="minimize-visibility">Minimize Visibility</SelectItem>
                                                    <SelectItem value="none">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-home-icon"
                                                    checked={debugShowHomeIcon}
                                                    onCheckedChange={(checked) => setDebugShowHomeIcon(checked === true)}
                                                />
                                                <Label htmlFor="debug-home-icon" className="cursor-pointer">
                                                    Show Home Icon
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-next-arrow"
                                                    checked={debugShowNextArrow}
                                                    onCheckedChange={(checked) => setDebugShowNextArrow(checked === true)}
                                                />
                                                <Label htmlFor="debug-next-arrow" className="cursor-pointer">
                                                    Show Next Arrow
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* New Features */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Monitor className="h-4 w-4 text-orange-600" />
                                        New Features
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-lock-overlay"
                                                    checked={debugLockOnOverlayOpen}
                                                    onCheckedChange={(checked) => setDebugLockOnOverlayOpen(checked === true)}
                                                />
                                                <Label htmlFor="debug-lock-overlay" className="cursor-pointer">
                                                    Lock on Overlay Open
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Lock measurements when drawers/popovers open
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-focus-ring">Focus Ring</Label>
                                            <Select value={debugFocusRing} onValueChange={(v: any) => setDebugFocusRing(v)}>
                                                <SelectTrigger id="debug-focus-ring">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="inset">Inset</SelectItem>
                                                    <SelectItem value="outer">Outer</SelectItem>
                                                    <SelectItem value="clip-margin">Clip Margin</SelectItem>
                                                    <SelectItem value="none">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Controls focus styling for links and triggers
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-overflow">Overflow Behavior</Label>
                                            <Select value={debugOverflowBehavior} onValueChange={(v: any) => setDebugOverflowBehavior(v)}>
                                                <SelectTrigger id="debug-overflow">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="collapse">Collapse (Smart)</SelectItem>
                                                    <SelectItem value="scroll">Scroll (Horizontal)</SelectItem>
                                                    <SelectItem value="wrap">Wrap (Multiline)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Choose how overflow is handled
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-fallback-width">
                                                Fallback At Width: {debugFallbackAtWidth ?? "Off"}px
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Slider
                                                    id="debug-fallback-width"
                                                    min={0}
                                                    max={800}
                                                    step={50}
                                                    value={[debugFallbackAtWidth ?? 0]}
                                                    onValueChange={(v) => setDebugFallbackAtWidth(v[0] === 0 ? undefined : v[0])}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDebugFallbackAtWidth(undefined)}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Force title-only mode below width
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-last-clickable"
                                                    checked={debugLastItemClickable}
                                                    onCheckedChange={(checked) => setDebugLastItemClickable(checked === true)}
                                                />
                                                <Label htmlFor="debug-last-clickable" className="cursor-pointer">
                                                    Last Item Clickable
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Make the last breadcrumb item clickable
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-schema">Schema.org SEO</Label>
                                            <Select value={debugSchema} onValueChange={(v: any) => setDebugSchema(v)}>
                                                <SelectTrigger id="debug-schema">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="json-ld">JSON-LD (Enabled)</SelectItem>
                                                    <SelectItem value="microdata">Microdata</SelectItem>
                                                    <SelectItem value="none">None (Disabled)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Structured data for search engines
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-collapsed-count"
                                                    checked={debugShowCollapsedCount}
                                                    onCheckedChange={(checked) => setDebugShowCollapsedCount(checked === true)}
                                                />
                                                <Label htmlFor="debug-collapsed-count" className="cursor-pointer">
                                                    Show Collapsed Count
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Display badge with count on ellipsis
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-clickable-left"
                                                    checked={debugClickableLeftOfEllipsis}
                                                    onCheckedChange={(checked) => setDebugClickableLeftOfEllipsis(checked === true)}
                                                />
                                                <Label htmlFor="debug-clickable-left" className="cursor-pointer">
                                                    Clickable Left of Ellipsis
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-6">
                                                Make separators before ellipsis clickable
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-direction">Text Direction</Label>
                                            <Select value={debugDirection} onValueChange={(v: any) => setDebugDirection(v)}>
                                                <SelectTrigger id="debug-direction">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="auto">Auto (Detect)</SelectItem>
                                                    <SelectItem value="ltr">LTR (Left-to-Right)</SelectItem>
                                                    <SelectItem value="rtl">RTL (Right-to-Left)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Separator icon direction
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-always-head">
                                                Always Show (Head): {debugAlwaysShowHead}
                                            </Label>
                                            <Slider
                                                id="debug-always-head"
                                                min={0}
                                                max={5}
                                                step={1}
                                                value={[debugAlwaysShowHead]}
                                                onValueChange={(v) => setDebugAlwaysShowHead(v[0])}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                First N items always visible
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-always-tail">
                                                Always Show (Tail): {debugAlwaysShowTail}
                                            </Label>
                                            <Slider
                                                id="debug-always-tail"
                                                min={0}
                                                max={5}
                                                step={1}
                                                value={[debugAlwaysShowTail]}
                                                onValueChange={(v) => setDebugAlwaysShowTail(v[0])}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Last M items always visible
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Multi-Ellipsis Settings */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-purple-600" />
                                        Multi-Ellipsis Settings
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-multi-ellipses"
                                                    checked={debugAllowMultipleEllipses}
                                                    onCheckedChange={(checked) => setDebugAllowMultipleEllipses(checked === true)}
                                                />
                                                <Label htmlFor="debug-multi-ellipses" className="cursor-pointer">
                                                    Allow Multiple Ellipses
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-grouping">Grouping Mode</Label>
                                            <Select
                                                value={debugGrouping}
                                                onValueChange={(v: any) => setDebugGrouping(v)}
                                                disabled={!debugAllowMultipleEllipses}
                                            >
                                                <SelectTrigger id="debug-grouping">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="contiguous">Contiguous</SelectItem>
                                                    <SelectItem value="free">Free</SelectItem>
                                                    <SelectItem value="smart">Smart</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Truncation Settings */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-green-600" />
                                        Truncation Settings
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-truncation"
                                                    checked={debugEnableTruncation}
                                                    onCheckedChange={(checked) => setDebugEnableTruncation(checked === true)}
                                                />
                                                <Label htmlFor="debug-truncation" className="cursor-pointer">
                                                    Enable Truncation
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-truncate-min">
                                                Min Width: {debugTruncateMinWidth}px
                                            </Label>
                                            <Slider
                                                id="debug-truncate-min"
                                                min={40}
                                                max={150}
                                                step={1}
                                                value={[debugTruncateMinWidth]}
                                                onValueChange={(value) => setDebugTruncateMinWidth(value[0])}
                                                disabled={!debugEnableTruncation}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-truncate-max">
                                                Max Width: {debugTruncateMaxWidth}px
                                            </Label>
                                            <Slider
                                                id="debug-truncate-max"
                                                min={100}
                                                max={400}
                                                step={1}
                                                value={[debugTruncateMaxWidth]}
                                                onValueChange={(value) => setDebugTruncateMaxWidth(value[0])}
                                                disabled={!debugEnableTruncation}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-truncate-threshold">
                                                Threshold: {debugTruncateThreshold}px
                                            </Label>
                                            <Slider
                                                id="debug-truncate-threshold"
                                                min={50}
                                                max={300}
                                                step={1}
                                                value={[debugTruncateThreshold]}
                                                onValueChange={(value) => setDebugTruncateThreshold(value[0])}
                                                disabled={!debugEnableTruncation}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-truncate-order">Truncate Order</Label>
                                            <Select
                                                value={debugTruncateOrder}
                                                onValueChange={(v: any) => setDebugTruncateOrder(v)}
                                                disabled={!debugEnableTruncation}
                                            >
                                                <SelectTrigger id="debug-truncate-order">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="biggest-first">Biggest First</SelectItem>
                                                    <SelectItem value="smallest-first">Smallest First</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Title-Only Fallback */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-orange-600" />
                                        Title-Only Fallback
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-title-only"
                                                    checked={debugShowTitleOnly}
                                                    onCheckedChange={(checked) => setDebugShowTitleOnly(checked === true)}
                                                />
                                                <Label htmlFor="debug-title-only" className="cursor-pointer">
                                                    Enable Title-Only Mode
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-title-text">Title Text</Label>
                                            <Input
                                                id="debug-title-text"
                                                type="text"
                                                value={debugTitleOnlyText}
                                                onChange={(e) => setDebugTitleOnlyText(e.target.value)}
                                                disabled={!debugShowTitleOnly}
                                                placeholder="Enter title text"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-title-icon">Title Icon</Label>
                                            <Select
                                                value={debugTitleOnlyIcon}
                                                onValueChange={(value) => setDebugTitleOnlyIcon(value)}
                                                disabled={!debugShowTitleOnly}
                                            >
                                                <SelectTrigger id="debug-title-icon">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Icon</SelectItem>
                                                    <SelectItem value="home">🏠 Home</SelectItem>
                                                    <SelectItem value="folder">📁 Folder</SelectItem>
                                                    <SelectItem value="file">📄 File</SelectItem>
                                                    <SelectItem value="fileText">📝 File Text</SelectItem>
                                                    <SelectItem value="settings">⚙️ Settings</SelectItem>
                                                    <SelectItem value="users">👥 Users</SelectItem>
                                                    <SelectItem value="shoppingCart">🛒 Shopping Cart</SelectItem>
                                                    <SelectItem value="package">📦 Package</SelectItem>
                                                    <SelectItem value="barChart">📊 Bar Chart</SelectItem>
                                                    <SelectItem value="database">🗄️ Database</SelectItem>
                                                    <SelectItem value="server">🖥️ Server</SelectItem>
                                                    <SelectItem value="globe">🌐 Globe</SelectItem>
                                                    <SelectItem value="building">🏢 Building</SelectItem>
                                                    <SelectItem value="mapPin">📍 Map Pin</SelectItem>
                                                    <SelectItem value="calendar">📅 Calendar</SelectItem>
                                                    <SelectItem value="clock">🕐 Clock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Debug Visualization */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Bug className="h-4 w-4 text-red-600" />
                                        Debug Visualization
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="debug-mode"
                                                checked={debugMode}
                                                onCheckedChange={(checked) => setDebugMode(checked === true)}
                                            />
                                            <Label htmlFor="debug-mode" className="cursor-pointer">
                                                Enable Debug Outlines
                                            </Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Show colored outlines: Red = Container, Green = Items, Blue = Separators, Yellow = Ellipsis, Pink = Next Arrow, Purple = Title-only
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Advanced Settings */}
                                <div>
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-indigo-600" />
                                        Advanced Settings
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="debug-tooltip-truncate"
                                                    checked={debugShowTooltipOnTruncate}
                                                    onCheckedChange={(checked) => setDebugShowTooltipOnTruncate(checked === true)}
                                                />
                                                <Label htmlFor="debug-tooltip-truncate" className="cursor-pointer">
                                                    Show Tooltip on Truncate
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-custom-separator">Custom Separator HTML (optional)</Label>
                                            <Textarea
                                                id="debug-custom-separator"
                                                value={debugCustomSeparator}
                                                onChange={(e) => setDebugCustomSeparator(e.target.value)}
                                                placeholder='<span class="text-xl">→</span> or <div class="mx-2">•</div>'
                                                rows={2}
                                                className="font-mono text-xs"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Custom HTML for separator (leave empty for default arrow)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-show-current-nav">Show Current Item in Navigation</Label>
                                            <Select
                                                value={debugShowCurrentInNav}
                                                onValueChange={(value: "never" | "with-others" | "always") => setDebugShowCurrentInNav(value)}
                                            >
                                                <SelectTrigger id="debug-show-current-nav">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="never">Never</SelectItem>
                                                    <SelectItem value="with-others">Only With Other Items</SelectItem>
                                                    <SelectItem value="always">Always</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Show current page as disabled item in separator navigation drawers
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-loading-fallback">Loading Fallback</Label>
                                            <Select
                                                value={debugLoadingFallback}
                                                onValueChange={(value: "title" | "custom" | "none") => setDebugLoadingFallback(value)}
                                            >
                                                <SelectTrigger id="debug-loading-fallback">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Invisible)</SelectItem>
                                                    <SelectItem value="title">Title Only</SelectItem>
                                                    <SelectItem value="custom">Custom Text</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                What to show while breadcrumb is calculating
                                            </p>
                                        </div>

                                        {debugLoadingFallback === "custom" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="debug-custom-loading">Custom Loading HTML</Label>
                                                <Textarea
                                                    id="debug-custom-loading"
                                                    value={debugCustomLoadingText}
                                                    onChange={(e) => setDebugCustomLoadingText(e.target.value)}
                                                    placeholder='<div class="flex items-center gap-2"><span>Loading...</span></div>'
                                                    rows={3}
                                                    className="font-mono text-xs"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Enter HTML to render during loading
                                                </p>
                                            </div>
                                        )}

                                        {debugLoadingFallback !== "none" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="debug-loading-delay">Loading Simulation Delay (ms)</Label>
                                                <Input
                                                    id="debug-loading-delay"
                                                    type="number"
                                                    value={debugLoadingDelay}
                                                    onChange={(e) => setDebugLoadingDelay(parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    min="0"
                                                    max="5000"
                                                    step="100"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Simulates data loading delay. Breadcrumb will show loading fallback until both data is ready AND calculations complete.
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-custom-ellipsis">Custom Ellipsis HTML (optional)</Label>
                                            <Textarea
                                                id="debug-custom-ellipsis"
                                                value={debugCustomEllipsis}
                                                onChange={(e) => setDebugCustomEllipsis(e.target.value)}
                                                placeholder='<span class="text-lg">•••</span>'
                                                rows={2}
                                                className="font-mono text-xs"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Custom HTML for ellipsis element (leave empty for default)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="debug-title-only-custom">Title-Only Custom HTML (optional)</Label>
                                            <Textarea
                                                id="debug-title-only-custom"
                                                value={debugTitleOnlyCustomElement}
                                                onChange={(e) => setDebugTitleOnlyCustomElement(e.target.value)}
                                                placeholder='<div class="flex items-center gap-2"><span class="font-bold">My App</span></div>'
                                                rows={3}
                                                className="font-mono text-xs"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Custom HTML for title-only fallback (overrides text + icon)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Breadcrumb Editor */}
                                {debugScenario === "custom" && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-teal-600" />
                                                Custom Breadcrumb Items
                                            </h4>
                                            <div className="space-y-3">
                                                {customBreadcrumbItems.map((item, index) => (
                                                    <Card key={index} className="p-4">
                                                        <div className="space-y-4">
                                                            {/* Main item configuration */}
                                                            <div className="flex items-start gap-2">
                                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                                    <div className="space-y-1">
                                                                        <Label htmlFor={`item-label-${index}`} className="text-xs">Label</Label>
                                                                        <Input
                                                                            id={`item-label-${index}`}
                                                                            type="text"
                                                                            value={item.label}
                                                                            onChange={(e) => {
                                                                                const newItems = [...customBreadcrumbItems];
                                                                                newItems[index].label = e.target.value;
                                                                                setCustomBreadcrumbItems(newItems);
                                                                            }}
                                                                            placeholder="Item label"
                                                                            className="text-sm h-9"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label htmlFor={`item-href-${index}`} className="text-xs">Href</Label>
                                                                        <Input
                                                                            id={`item-href-${index}`}
                                                                            type="text"
                                                                            value={item.href || ""}
                                                                            onChange={(e) => {
                                                                                const newItems = [...customBreadcrumbItems];
                                                                                newItems[index].href = e.target.value;
                                                                                setCustomBreadcrumbItems(newItems);
                                                                            }}
                                                                            placeholder="/path"
                                                                            className="text-sm h-9"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1 col-span-2">
                                                                        <Label htmlFor={`item-icon-${index}`} className="text-xs">Icon</Label>
                                                                        <Select
                                                                            value={item.icon || "none"}
                                                                            onValueChange={(value) => {
                                                                                const newItems = [...customBreadcrumbItems];
                                                                                newItems[index].icon = value;
                                                                                setCustomBreadcrumbItems(newItems);
                                                                            }}
                                                                        >
                                                                            <SelectTrigger id={`item-icon-${index}`} className="h-9">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none">No Icon</SelectItem>
                                                                                <SelectItem value="home">🏠 Home</SelectItem>
                                                                                <SelectItem value="folder">📁 Folder</SelectItem>
                                                                                <SelectItem value="file">📄 File</SelectItem>
                                                                                <SelectItem value="fileText">📝 File Text</SelectItem>
                                                                                <SelectItem value="settings">⚙️ Settings</SelectItem>
                                                                                <SelectItem value="users">👥 Users</SelectItem>
                                                                                <SelectItem value="shoppingCart">🛒 Shopping Cart</SelectItem>
                                                                                <SelectItem value="package">📦 Package</SelectItem>
                                                                                <SelectItem value="barChart">📊 Bar Chart</SelectItem>
                                                                                <SelectItem value="database">🗄️ Database</SelectItem>
                                                                                <SelectItem value="server">🖥️ Server</SelectItem>
                                                                                <SelectItem value="globe">🌐 Globe</SelectItem>
                                                                                <SelectItem value="building">🏢 Building</SelectItem>
                                                                                <SelectItem value="mapPin">📍 Map Pin</SelectItem>
                                                                                <SelectItem value="calendar">📅 Calendar</SelectItem>
                                                                                <SelectItem value="clock">🕐 Clock</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const newItems = customBreadcrumbItems.filter((_, i) => i !== index);
                                                                        // Also remove navigation tree for this item
                                                                        const newNav = { ...customSeparatorNav };
                                                                        delete newNav[item.key];
                                                                        setCustomSeparatorNav(newNav);
                                                                        setCustomBreadcrumbItems(newItems);
                                                                    }}
                                                                    disabled={customBreadcrumbItems.length <= 1}
                                                                    className="shrink-0"
                                                                >
                                                                    ✕
                                                                </Button>
                                                            </div>

                                                            {/* Options */}
                                                            <div className="flex items-center gap-4 flex-wrap">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`item-collapse-${index}`}
                                                                        checked={item.canCollapse}
                                                                        onCheckedChange={(checked) => {
                                                                            const newItems = [...customBreadcrumbItems];
                                                                            newItems[index].canCollapse = checked === true;
                                                                            setCustomBreadcrumbItems(newItems);
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`item-collapse-${index}`} className="cursor-pointer text-xs">
                                                                        Can Collapse
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`item-truncate-${index}`}
                                                                        checked={item.canTruncate}
                                                                        onCheckedChange={(checked) => {
                                                                            const newItems = [...customBreadcrumbItems];
                                                                            newItems[index].canTruncate = checked === true;
                                                                            setCustomBreadcrumbItems(newItems);
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`item-truncate-${index}`} className="cursor-pointer text-xs">
                                                                        Can Truncate
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`item-clickable-${index}`}
                                                                        checked={item.clickable !== false}
                                                                        onCheckedChange={(checked) => {
                                                                            const newItems = [...customBreadcrumbItems];
                                                                            newItems[index].clickable = checked === true;
                                                                            setCustomBreadcrumbItems(newItems);
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`item-clickable-${index}`} className="cursor-pointer text-xs">
                                                                        Clickable
                                                                    </Label>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    Item {index + 1}
                                                                </Badge>
                                                            </div>

                                                            {/* Custom HTML Element */}
                                                            <div className="border-t pt-3 space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`item-custom-html-${index}`}
                                                                        checked={!!item.customElement}
                                                                        onCheckedChange={(checked) => {
                                                                            const newItems = [...customBreadcrumbItems];
                                                                            if (checked) {
                                                                                newItems[index].customElement = '<div class="flex items-center gap-2"><span>Custom</span></div>';
                                                                            } else {
                                                                                delete newItems[index].customElement;
                                                                            }
                                                                            setCustomBreadcrumbItems(newItems);
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`item-custom-html-${index}`} className="cursor-pointer text-xs font-semibold">
                                                                        Use Custom HTML Element
                                                                    </Label>
                                                                </div>
                                                                {item.customElement !== undefined && (
                                                                    <div className="space-y-1">
                                                                        <Label htmlFor={`item-custom-html-text-${index}`} className="text-xs">Custom HTML</Label>
                                                                        <Textarea
                                                                            id={`item-custom-html-text-${index}`}
                                                                            value={item.customElement || ""}
                                                                            onChange={(e) => {
                                                                                const newItems = [...customBreadcrumbItems];
                                                                                newItems[index].customElement = e.target.value;
                                                                                setCustomBreadcrumbItems(newItems);
                                                                            }}
                                                                            placeholder='<div class="flex items-center gap-2"><span class="font-bold">Custom Item</span></div>'
                                                                            rows={3}
                                                                            className="font-mono text-xs"
                                                                        />
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Overrides label, href, and icon with custom HTML
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Navigation Tree Builder */}
                                                            <div className="border-t pt-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Label className="text-xs font-semibold">
                                                                        Separator Navigation (Same-level items)
                                                                    </Label>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newNav = { ...customSeparatorNav };
                                                                            if (!newNav[item.key]) {
                                                                                newNav[item.key] = [];
                                                                            }
                                                                            newNav[item.key].push({
                                                                                key: `nav-${item.key}-${newNav[item.key].length}`,
                                                                                label: `Alternative ${newNav[item.key].length + 1}`,
                                                                                href: `${item.href || ""}/alt-${newNav[item.key].length + 1}`,
                                                                                icon: "folder"
                                                                            });
                                                                            setCustomSeparatorNav(newNav);
                                                                        }}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        + Add Nav Item
                                                                    </Button>
                                                                </div>

                                                                {customSeparatorNav[item.key] && customSeparatorNav[item.key].length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {customSeparatorNav[item.key].map((navItem, navIndex) => (
                                                                            <div key={navIndex} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                                                <Input
                                                                                    value={navItem.label}
                                                                                    onChange={(e) => {
                                                                                        const newNav = { ...customSeparatorNav };
                                                                                        newNav[item.key][navIndex].label = e.target.value;
                                                                                        setCustomSeparatorNav(newNav);
                                                                                    }}
                                                                                    placeholder="Label"
                                                                                    className="flex-1 h-8 text-xs"
                                                                                />
                                                                                <Input
                                                                                    value={navItem.href}
                                                                                    onChange={(e) => {
                                                                                        const newNav = { ...customSeparatorNav };
                                                                                        newNav[item.key][navIndex].href = e.target.value;
                                                                                        setCustomSeparatorNav(newNav);
                                                                                    }}
                                                                                    placeholder="/path"
                                                                                    className="flex-1 h-8 text-xs"
                                                                                />
                                                                                <Select
                                                                                    value={navItem.icon}
                                                                                    onValueChange={(value) => {
                                                                                        const newNav = { ...customSeparatorNav };
                                                                                        newNav[item.key][navIndex].icon = value;
                                                                                        setCustomSeparatorNav(newNav);
                                                                                    }}
                                                                                >
                                                                                    <SelectTrigger className="w-32 h-8 text-xs">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="none">No Icon</SelectItem>
                                                                                        <SelectItem value="folder">📁 Folder</SelectItem>
                                                                                        <SelectItem value="file">📄 File</SelectItem>
                                                                                        <SelectItem value="globe">🌐 Globe</SelectItem>
                                                                                        <SelectItem value="building">🏢 Building</SelectItem>
                                                                                        <SelectItem value="users">👥 Users</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <div className="flex items-center space-x-1">
                                                                                    <Checkbox
                                                                                        id={`nav-clickable-${item.key}-${navIndex}`}
                                                                                        checked={navItem.clickable !== false}
                                                                                        onCheckedChange={(checked) => {
                                                                                            const newNav = { ...customSeparatorNav };
                                                                                            newNav[item.key][navIndex].clickable = checked === true;
                                                                                            setCustomSeparatorNav(newNav);
                                                                                        }}
                                                                                    />
                                                                                    <Label htmlFor={`nav-clickable-${item.key}-${navIndex}`} className="cursor-pointer text-xs whitespace-nowrap">
                                                                                        Click
                                                                                    </Label>
                                                                                </div>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        const newNav = { ...customSeparatorNav };
                                                                                        newNav[item.key] = newNav[item.key].filter((_, i) => i !== navIndex);
                                                                                        if (newNav[item.key].length === 0) {
                                                                                            delete newNav[item.key];
                                                                                        }
                                                                                        setCustomSeparatorNav(newNav);
                                                                                    }}
                                                                                    className="h-8 w-8 shrink-0"
                                                                                >
                                                                                    ✕
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground italic">
                                                                        No navigation items. Add items to enable separator navigation.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        const newKey = `item-${customBreadcrumbItems.length}`;
                                                        setCustomBreadcrumbItems([
                                                            ...customBreadcrumbItems,
                                                            {
                                                                key: newKey,
                                                                label: `Item ${customBreadcrumbItems.length + 1}`,
                                                                href: `/item-${customBreadcrumbItems.length + 1}`,
                                                                canCollapse: true,
                                                                canTruncate: true,
                                                                clickable: true,
                                                                icon: "folder",
                                                            },
                                                        ]);
                                                    }}
                                                    className="w-full"
                                                >
                                                    + Add Breadcrumb Item
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator className="my-6" />

                                        {/* Next Items (Forward Navigation) Builder */}
                                        <div>
                                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                                <ChevronRight className="h-4 w-4 text-indigo-600" />
                                                Forward Navigation (Next Items)
                                            </h4>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                Configure items that appear in the next arrow menu after the last breadcrumb item
                                            </p>
                                            <div className="space-y-2">
                                                {customNextItems.length > 0 ? (
                                                    <>
                                                        {customNextItems.map((nextItem, index) => (
                                                            <Card key={index} className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={nextItem.label}
                                                                        onChange={(e) => {
                                                                            const newNext = [...customNextItems];
                                                                            newNext[index].label = e.target.value;
                                                                            setCustomNextItems(newNext);
                                                                        }}
                                                                        placeholder="Label"
                                                                        className="flex-1 h-9 text-sm"
                                                                    />
                                                                    <Input
                                                                        value={nextItem.href}
                                                                        onChange={(e) => {
                                                                            const newNext = [...customNextItems];
                                                                            newNext[index].href = e.target.value;
                                                                            setCustomNextItems(newNext);
                                                                        }}
                                                                        placeholder="/path"
                                                                        className="flex-1 h-9 text-sm"
                                                                    />
                                                                    <Select
                                                                        value={nextItem.icon}
                                                                        onValueChange={(value) => {
                                                                            const newNext = [...customNextItems];
                                                                            newNext[index].icon = value;
                                                                            setCustomNextItems(newNext);
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="w-40 h-9 text-xs">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="none">No Icon</SelectItem>
                                                                            <SelectItem value="folder">📁 Folder</SelectItem>
                                                                            <SelectItem value="file">📄 File</SelectItem>
                                                                            <SelectItem value="settings">⚙️ Settings</SelectItem>
                                                                            <SelectItem value="users">👥 Users</SelectItem>
                                                                            <SelectItem value="calendar">📅 Calendar</SelectItem>
                                                                            <SelectItem value="globe">🌐 Globe</SelectItem>
                                                                            <SelectItem value="building">🏢 Building</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="flex items-center space-x-1">
                                                                        <Checkbox
                                                                            id={`next-clickable-${index}`}
                                                                            checked={nextItem.clickable !== false}
                                                                            onCheckedChange={(checked) => {
                                                                                const newNext = [...customNextItems];
                                                                                newNext[index].clickable = checked === true;
                                                                                setCustomNextItems(newNext);
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={`next-clickable-${index}`} className="cursor-pointer text-xs whitespace-nowrap">
                                                                            Click
                                                                        </Label>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            const newNext = customNextItems.filter((_, i) => i !== index);
                                                                            setCustomNextItems(newNext);
                                                                        }}
                                                                        className="h-9 w-9 shrink-0"
                                                                    >
                                                                        ✕
                                                                    </Button>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic p-4 border-2 border-dashed rounded">
                                                        No forward navigation items. Add items to enable the next arrow.
                                                    </p>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setCustomNextItems([
                                                            ...customNextItems,
                                                            {
                                                                key: `next-${customNextItems.length}`,
                                                                label: `Next Item ${customNextItems.length + 1}`,
                                                                href: `/next-${customNextItems.length + 1}`,
                                                                icon: "folder"
                                                            },
                                                        ]);
                                                    }}
                                                    className="w-full"
                                                >
                                                    + Add Next Item
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <DemoLayout
                            title="Debug Mode & Live Measurements"
                            description="Visual debugging tools with colored outlines showing each element type. Resize to see measurements update in real-time."
                        >
                            <ResponsiveBreadcrumb
                                items={
                                    debugScenario === "documents"
                                        ? scenarios.documents
                                        : customBreadcrumbItems.map(item => ({
                                            ...item,
                                            icon: getIconComponent(item.icon || "none"),
                                            customElement: item.customElement ? renderTextElement(item.customElement) : undefined
                                        }))
                                }
                                strategy={debugStrategy}
                                preference={debugPreference}
                                showHomeIcon={debugShowHomeIcon}
                                showNextArrow={debugShowNextArrow || (debugScenario === "custom" && customNextItems.length > 0)}
                                nextItems={
                                    debugScenario === "custom" && customNextItems.length > 0
                                        ? customNextItems.map(item => ({
                                            ...item,
                                            icon: getIconComponent(item.icon)
                                        }))
                                        : debugShowNextArrow
                                            ? nextItems
                                            : undefined
                                }
                                separatorNavItems={
                                    debugScenario === "custom"
                                        ? Object.fromEntries(
                                            Object.entries(customSeparatorNav).map(([key, items]) => [
                                                key,
                                                items.map(item => ({
                                                    ...item,
                                                    icon: getIconComponent(item.icon)
                                                }))
                                            ])
                                        )
                                        : undefined
                                }
                                allowMultipleEllipses={debugAllowMultipleEllipses}
                                grouping={debugGrouping}
                                enableTruncation={debugEnableTruncation}
                                truncateMinWidth={debugTruncateMinWidth}
                                truncateMaxWidth={debugTruncateMaxWidth}
                                truncateThreshold={debugTruncateThreshold}
                                truncateOrder={debugTruncateOrder}
                                showTooltipOnTruncate={debugShowTooltipOnTruncate}
                                renderSeparator={debugCustomSeparator ? () => <span>{debugCustomSeparator}</span> : undefined}
                                titleOnlyFallback={debugShowTitleOnly ? debugTitleOnlyText : undefined}
                                titleOnlyIcon={debugShowTitleOnly ? getIconComponent(debugTitleOnlyIcon) : undefined}
                                titleOnlyCustomElement={debugTitleOnlyCustomElement ? renderTextElement(debugTitleOnlyCustomElement) : undefined}
                                customEllipsisElement={debugCustomEllipsis ? renderTextElement(debugCustomEllipsis) : undefined}
                                showCurrentInNav={debugShowCurrentInNav}
                                loadingFallback={debugLoadingFallback}
                                customLoadingFallback={debugLoadingFallback === "custom" && debugCustomLoadingText ? renderTextElement(debugCustomLoadingText) : undefined}
                                isLoading={isSimulatingLoading}
                                onItemClick={(item) => console.log("Debug clicked:", item)}
                                debug={debugMode}
                                onDebugStateChange={pushDebug}
                                lockOnOverlayOpen={debugLockOnOverlayOpen}
                                overflowBehavior={debugOverflowBehavior}
                                focusRing={debugFocusRing}
                                fallbackAtWidth={debugFallbackAtWidth}
                                lastItemClickable={debugLastItemClickable}
                                schema={debugSchema}
                                showCollapsedCount={debugShowCollapsedCount}
                                clickableLeftOfEllipsis={debugClickableLeftOfEllipsis}
                                direction={debugDirection}
                                alwaysShow={{ head: debugAlwaysShowHead, tail: debugAlwaysShowTail }}
                            />
                        </DemoLayout>

                        <DebugPanel scenarios={scenarios} />
                    </TabsContent>
                </Tabs >

                {/* Footer */}
                < Card className="mt-8">
                    < CardHeader >
                        <CardTitle>Implementation Summary</CardTitle>
                        <CardDescription>
                            Key technical achievements of this breadcrumb component
                        </CardDescription>
                    </CardHeader >
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-blue-600" />
                                    Responsive Design
                                </h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>✓ Automatic desktop / mobile detection</p >
                                    <p>✓ Popover to drawer transitions</p>
                                    <p>✓ Preserved state across breakpoints</p>
                                    <p>✓ Touch-friendly mobile interface</p>
                                </div >
                            </div >

                            <div className="space-y-3">
                                < h3 className="font-semibold flex items-center gap-2">
                                    < Target className="h-4 w-4 text-green-600" />
                                    Smart Collapsing
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>✓ Three collapse strategies</p >
                                    <p>✓ Two preference algorithms</p>
                                    <p>✓ Configurable item protection</p>
                                    <p>✓ Precise width calculations</p>
                                </div >
                            </div >

                            <div className="space-y-3">
                                < h3 className="font-semibold flex items-center gap-2">
                                    < Globe className="h-4 w-4 text-purple-600" />
                                    Advanced Navigation
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>✓ Tree navigation via separators</p >
                                    <p>✓ Forward navigation arrows</p>
                                    <p>✓ Custom icons and styling</p>
                                    <p>✓ Fallback modes for extreme cases</p>
                                </div >
                            </div >

                            <div className="space-y-3">
                                < h3 className="font-semibold flex items-center gap-2">
                                    < Ruler className="h-4 w-4 text-orange-600" />
                                    Precision Measurement
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>✓ DOM - based width calculations</p >
                                    <p>✓ No hardcoded dimensions</p>
                                    <p>✓ Accounts for fonts and styles</p>
                                    <p>✓ Real-time responsive updates</p>
                                </div >
                            </div >

                            <div className="space-y-3">
                                < h3 className="font-semibold flex items-center gap-2">
                                    < Clock className="h-4 w-4 text-red-600" />
                                    Performance
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>✓ Single - pass rendering</p >
                                    <p>✓ Optimized state management</p>
                                    <p>✓ Prevents animation glitches</p>
                                    <p>✓ Efficient ResizeObserver usage</p>
                                </div >
                            </div >

                            <div className="space-y-3">
                                < h3 className="font-semibold flex items-center gap-2">
                                    < FileText className="h-4 w-4 text-teal-600" />
                                    Developer Experience
                                </h3 >
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>✓ TypeScript support</p >
                                    <p>✓ Comprehensive prop interface</p>
                                    <p>✓ Debug mode for troubleshooting</p>
                                    <p>✓ Modular and extensible design</p>
                                </div >
                            </div >
                        </div >
                    </CardContent >
                </Card >
            </div >
        </div >
    );
}
