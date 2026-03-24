import { useState } from "react";
import { makeStyles, tokens, mergeClasses } from "@fluentui/react-components";
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
} from "@fluentui/react-icons";
import { ChatWidget } from "./ChatWidget";

const useStyles = makeStyles({
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    flexDirection: "column",
    paddingTop: "20px",
    paddingBottom: "20px",
    flexShrink: 0,
    transitionProperty: "width",
    transitionDuration: "0.35s",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  sidebarExpanded: {
    width: "420px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 18px 20px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  logoIcon: {
    width: "30px",
    height: "30px",
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground}, #818cf8)`,
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  logoSub: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
  },
  nav: {
    padding: "12px 10px",
    flex: 1,
    overflowY: "auto",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.colorNeutralForeground4,
    padding: "0 8px",
    marginTop: "14px",
    marginBottom: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 10px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: "12.5px",
    color: tokens.colorNeutralForeground3,
    cursor: "pointer",
    transitionProperty: "all",
    transitionDuration: "0.15s",
    userSelect: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: 500,
  },
  navIcon: {
    width: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

interface NavEntry {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const navSections: { label: string; items: NavEntry[] }[] = [
  {
    label: "Overview",
    items: [
      { icon: <Home20Regular />, label: "Overview" },
      { icon: <ClipboardTextLtr20Regular />, label: "Activity log" },
      { icon: <LockClosed20Regular />, label: "Access control" },
    ],
  },
  {
    label: "Deploy",
    items: [
      { icon: <Rocket20Regular />, label: "Deployment slots" },
      { icon: <Box20Regular />, label: "Deployment Center" },
    ],
  },
  {
    label: "Settings",
    items: [
      { icon: <Settings20Regular />, label: "Configuration" },
      { icon: <DataBarVertical20Regular />, label: "Performance" },
    ],
  },
  {
    label: "API",
    items: [
      { icon: <Link20Regular />, label: "API Management", active: true },
      { icon: <Document20Regular />, label: "API definition" },
      { icon: <Globe20Regular />, label: "CORS" },
    ],
  },
  {
    label: "Support",
    items: [
      { icon: <Heart20Regular />, label: "Resource health" },
      { icon: <Lightbulb20Regular />, label: "Advisor" },
    ],
  },
];

export function Sidebar() {
  const styles = useStyles();
  const [chatExpanded, setChatExpanded] = useState(false);

  return (
    <aside
      className={mergeClasses(
        styles.sidebar,
        chatExpanded && styles.sidebarExpanded
      )}
    >
      <div className={styles.logo}>
        <div className={styles.logoIcon}>&#9889;</div>
        <div>
          <div className={styles.logoText}>adadasd</div>
          <div className={styles.logoSub}>App Service</div>
        </div>
      </div>

      <ChatWidget onExpandChange={setChatExpanded} />

      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.label}>
            <div className={styles.sectionLabel}>{section.label}</div>
            {section.items.map((item) => (
              <div
                key={item.label}
                className={mergeClasses(
                  styles.navItem,
                  item.active && styles.navItemActive
                )}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
