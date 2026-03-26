import { useState, useMemo } from "react";
import {
  makeStyles,
  tokens,
  mergeClasses,
  Input,
  shorthands,
} from "@fluentui/react-components";
import {
  Home20Regular,
  ClipboardTextLtr20Regular,
  LockClosed20Regular,
  Rocket20Regular,
  Box20Regular,
  Settings20Regular,
  DataBarVertical20Regular,
  Link20Regular,
  Document20Regular,
  Globe20Regular,
  Heart20Regular,
  Lightbulb20Regular,
  NetworkCheck20Regular,
  Search16Regular,
  Star20Regular,
  MoreHorizontal20Regular,
  ChevronRight12Regular,
  ChevronDown12Regular,
  TagMultiple20Regular,
  ShieldCheckmark20Regular,
  AppGeneric20Regular,
  SlideSearch20Regular,
  CloudLink20Regular,
  CalendarClock20Regular,
} from "@fluentui/react-icons";
import type { ActiveView } from "../App";

const useStyles = makeStyles({
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontSize: "13px",
  },

  // ── Header ──
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ...shorthands.padding("10px", "14px"),
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },
  headerIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: tokens.colorBrandForeground1,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerName: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  headerType: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    flexShrink: 0,
  },
  headerActionBtn: {
    cursor: "pointer",
    color: tokens.colorNeutralForeground3,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      color: tokens.colorNeutralForeground1,
    },
  },

  // ── Search ──
  searchBox: {
    ...shorthands.padding("6px", "10px"),
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },

  // ── Nav ──
  nav: {
    flex: 1,
    overflowY: "auto",
    paddingTop: "2px",
    paddingBottom: "8px",
  },

  // ── Section header (collapsible) ──
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    ...shorthands.padding("6px", "14px"),
    marginTop: "4px",
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      color: tokens.colorNeutralForeground1,
    },
  },
  sectionChevron: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  // ── Nav item ──
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ...shorthands.padding("5px", "14px"),
    paddingLeft: "16px",
    fontSize: "13px",
    color: tokens.colorNeutralForeground2,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderLeft: "3px solid transparent",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
  },
  navItemActive: {
    borderLeftColor: tokens.colorBrandBackground,
    backgroundColor: tokens.colorNeutralBackground1Hover,
    color: tokens.colorNeutralForeground1,
    fontWeight: 500,
  },
  navIcon: {
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& > svg": {
      width: "16px",
      height: "16px",
    },
  },

  // ── Top items (no section header, flat list) ──
  topItems: {
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
    paddingBottom: "4px",
    paddingTop: "2px",
  },

  // ── Footer ──
  footer: {
    ...shorthands.padding("8px", "14px"),
    fontSize: "10px",
    color: tokens.colorNeutralForeground4,
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke2),
  },
});

interface NavEntry {
  icon: React.ReactNode;
  label: string;
  view?: ActiveView;
}

// Top-level items (no collapsible section header, like portal's Overview/Activity log etc.)
const topItems: NavEntry[] = [
  { icon: <Home20Regular />, label: "Overview" },
  { icon: <ClipboardTextLtr20Regular />, label: "Activity log" },
  { icon: <LockClosed20Regular />, label: "Access control (IAM)" },
  { icon: <TagMultiple20Regular />, label: "Tags" },
  { icon: <SlideSearch20Regular />, label: "Diagnose and solve problems" },
  { icon: <ShieldCheckmark20Regular />, label: "Microsoft Defender for Cloud" },
  { icon: <CalendarClock20Regular />, label: "Events (preview)" },
  { icon: <CloudLink20Regular />, label: "Resource visualizer" },
];

// Collapsible sections (matching portal screenshot)
const navSections: { label: string; items: NavEntry[]; defaultExpanded?: boolean }[] = [
  {
    label: "Favorites",
    defaultExpanded: true,
    items: [
      { icon: <AppGeneric20Regular />, label: "Environment variables" },
      { icon: <Rocket20Regular />, label: "Deployment" },
    ],
  },
  {
    label: "Settings",
    defaultExpanded: true,
    items: [
      { icon: <AppGeneric20Regular />, label: "Environment variables" },
      { icon: <Settings20Regular />, label: "Configuration" },
      { icon: <Box20Regular />, label: "Instances" },
      { icon: <LockClosed20Regular />, label: "Authentication" },
      { icon: <LockClosed20Regular />, label: "Identity" },
      { icon: <Box20Regular />, label: "Backups" },
      { icon: <Globe20Regular />, label: "Custom domains" },
      { icon: <LockClosed20Regular />, label: "Certificates" },
      { icon: <NetworkCheck20Regular />, label: "Networking", view: "networking" },
      { icon: <Box20Regular />, label: "WebJobs" },
      { icon: <DataBarVertical20Regular />, label: "MySQL In App" },
      { icon: <Link20Regular />, label: "Service Connector" },
      { icon: <Document20Regular />, label: "Properties" },
      { icon: <LockClosed20Regular />, label: "Locks" },
    ],
  },
  {
    label: "Performance",
    items: [],
  },
  {
    label: "App Service plan",
    items: [],
  },
  {
    label: "Development Tools",
    items: [],
  },
  {
    label: "API",
    items: [
      { icon: <Link20Regular />, label: "API Management", view: "api-management" },
      { icon: <Document20Regular />, label: "API definition" },
      { icon: <Globe20Regular />, label: "CORS" },
    ],
  },
  {
    label: "Monitoring",
    items: [],
  },
  {
    label: "Automation",
    items: [],
  },
  {
    label: "Support + troubleshooting",
    items: [
      { icon: <Heart20Regular />, label: "Resource health" },
      { icon: <Lightbulb20Regular />, label: "Advisor" },
    ],
  },
];

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    const collapsed = new Set<string>();
    navSections.forEach((s) => {
      if (!s.defaultExpanded) collapsed.add(s.label);
    });
    return collapsed;
  });

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const query = searchQuery.toLowerCase().trim();

  const filteredTopItems = useMemo(
    () => (query ? topItems.filter((i) => i.label.toLowerCase().includes(query)) : topItems),
    [query],
  );

  const filteredSections = useMemo(
    () =>
      navSections
        .map((section) => ({
          ...section,
          items: query
            ? section.items.filter((i) => i.label.toLowerCase().includes(query))
            : section.items,
        }))
        .filter((section) => (query ? section.items.length > 0 : true)),
    [query],
  );

  const renderNavItem = (item: NavEntry) => (
    <div
      key={item.label}
      className={mergeClasses(
        styles.navItem,
        item.view === activeView && styles.navItemActive,
      )}
      onClick={() => item.view && onNavigate(item.view)}
    >
      <span className={styles.navIcon}>{item.icon}</span>
      {item.label}
    </div>
  );

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Globe20Regular />
        </div>
        <div className={styles.headerText}>
          <div className={styles.headerName}>my-app-service</div>
          <div className={styles.headerType}>Web App</div>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.headerActionBtn}>
            <Star20Regular />
          </span>
          <span className={styles.headerActionBtn}>
            <MoreHorizontal20Regular />
          </span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <Input
          value={searchQuery}
          onChange={(_, data) => setSearchQuery(data.value)}
          placeholder="Search"
          contentBefore={<Search16Regular />}
          size="small"
          style={{ width: "100%" }}
          appearance="underline"
        />
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {/* Top-level items (no section header) */}
        {filteredTopItems.length > 0 && (
          <div className={styles.topItems}>
            {filteredTopItems.map(renderNavItem)}
          </div>
        )}

        {/* Collapsible sections */}
        {filteredSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.label) && !query;
          return (
            <div key={section.label}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection(section.label)}
              >
                <span className={styles.sectionChevron}>
                  {isCollapsed ? <ChevronRight12Regular /> : <ChevronDown12Regular />}
                </span>
                {section.label}
              </div>
              {!isCollapsed && section.items.map(renderNavItem)}
            </div>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className={styles.footer}>
        Add or remove favorites by pressing Ctrl+Shift+F
      </div>
    </aside>
  );
}
