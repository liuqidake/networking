import { useState, useCallback } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Dropdown,
  Option,
  Switch,
  Button,
  Badge,
  Spinner,
  Link,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Checkmark16Filled,
  Open16Regular,
  ShieldCheckmark20Regular,
  Flash20Regular,
  DataBarVertical20Regular,
  Globe20Regular,
  ArrowSync20Regular,
  DocumentText20Regular,
  ClipboardTextLtr20Regular,
  Key20Regular,
  BeakerSettings20Regular,
  Document20Regular,
  Copy16Regular,
  LinkDismiss20Regular,
  PlugConnected20Regular,
  ArrowRight16Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    maxWidth: "820px",
  },
  // Hero section with gradient
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("28px", "32px"),
    marginBottom: "28px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  },
  heroPattern: {
    position: "absolute",
    top: "0",
    right: "0",
    bottom: "0",
    width: "40%",
    opacity: "0.1",
    backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 60% 80%, #fff 1px, transparent 1px)",
    backgroundSize: "60px 60px, 80px 80px, 40px 40px",
  },
  heroTitle: {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "8px",
    position: "relative",
    letterSpacing: "-0.02em",
  },
  heroDesc: {
    fontSize: "14px",
    opacity: 0.9,
    lineHeight: "22px",
    maxWidth: "520px",
    position: "relative",
  },
  heroLink: {
    color: "#fff",
    fontSize: "13px",
    marginTop: "12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    opacity: 0.85,
    textDecoration: "none",
    position: "relative",
    "&:hover": {
      opacity: 1,
    },
  },
  // Features
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "14px",
    display: "block",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "32px",
  },
  featureCard: {
    padding: "16px",
    backgroundColor: "#fff",
    ...shorthands.borderWidth("1px"),
    ...shorthands.borderStyle("solid"),
    ...shorthands.borderColor("rgba(0,0,0,0.06)"),
    ...shorthands.borderRadius("12px"),
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    },
  },
  featureIconWrap: {
    width: "36px",
    height: "36px",
    ...shorthands.borderRadius("10px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
    fontSize: "18px",
  },
  featureTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "4px",
  },
  featureDesc: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    lineHeight: "17px",
  },
  // Card
  card: {
    backgroundColor: "#fff",
    ...shorthands.borderWidth("1px"),
    ...shorthands.borderStyle("solid"),
    ...shorthands.borderColor("rgba(0,0,0,0.06)"),
    ...shorthands.borderRadius("14px"),
    ...shorthands.padding("24px"),
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardIcon: {
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("12px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "20px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    letterSpacing: "-0.01em",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
  },
  // Form
  formRow: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "8px",
    color: tokens.colorNeutralForeground1,
  },
  required: {
    color: tokens.colorPaletteRedForeground1,
    marginLeft: "2px",
  },
  hint: {
    fontWeight: 400,
    color: tokens.colorNeutralForeground3,
    fontSize: "12px",
    marginLeft: "4px",
  },
  dropdown: {
    width: "100%",
    maxWidth: "400px",
  },
  separator: {
    height: "1px",
    background: "linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.02))",
    ...shorthands.margin("24px", "0"),
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 18px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
  },
  toggleLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  toggleDesc: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "3px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "24px",
    gap: "10px",
  },
  // Progress
  progressContainer: {
    maxWidth: "480px",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 0",
  },
  stepLine: {
    width: "2px",
    height: "16px",
    marginLeft: "15px",
    backgroundColor: tokens.colorNeutralStroke2,
  },
  stepLineDone: {
    backgroundColor: tokens.colorPaletteGreenBorder1,
  },
  stepIndicator: {
    width: "32px",
    height: "32px",
    ...shorthands.borderRadius("50%"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    flexShrink: 0,
    fontWeight: 600,
    transitionProperty: "all",
    transitionDuration: "0.3s",
  },
  indicatorPending: {
    backgroundColor: "#f1f3f5",
    color: tokens.colorNeutralForeground4,
  },
  indicatorRunning: {
    backgroundColor: "#eef2ff",
    color: "#667eea",
    boxShadow: "0 0 0 3px rgba(102,126,234,0.15)",
  },
  indicatorDone: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
  },
  stepTitle: {
    fontSize: "14px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  stepLabel: {
    fontSize: "12px",
    marginTop: "1px",
  },
  // Success
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    marginTop: "20px",
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    ...shorthands.borderRadius("12px"),
    color: "#059669",
    fontSize: "14px",
    fontWeight: 500,
  },
  // Linked view
  linkedHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  linkedTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  linkedActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "24px",
  },
  summaryItem: {
    padding: "16px 18px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
  },
  summaryLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
  },
  summaryValue: {
    fontSize: "14px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    wordBreak: "break-all",
  },
  urlText: {
    fontSize: "12px",
    fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace",
    color: tokens.colorNeutralForeground2,
    flex: 1,
  },
  subsectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "14px",
    display: "block",
  },
  quickLinksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  quickLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
    fontSize: "13px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground2,
    textDecoration: "none",
    cursor: "pointer",
    transitionProperty: "all",
    transitionDuration: "0.2s",
    "&:hover": {
      backgroundColor: "#eef2ff",
      color: "#667eea",
      transform: "translateY(-1px)",
    },
  },
});

const APIM_APIS: Record<string, string[]> = {
  "apim-prod": ["Payments API v2", "User Service API", "Inventory API"],
  "apim-staging": ["Payments API v1 (staging)", "Auth API (staging)"],
};

const FEATURES = [
  { icon: <ShieldCheckmark20Regular />, title: "Security & Auth", desc: "OAuth 2.0, API keys, JWT validation", bg: "#eef2ff", color: "#667eea" },
  { icon: <Flash20Regular />, title: "Rate Limiting", desc: "Throttle and quota policies", bg: "#fef3c7", color: "#d97706" },
  { icon: <DataBarVertical20Regular />, title: "Analytics", desc: "Requests, latency, errors", bg: "#ecfdf5", color: "#059669" },
  { icon: <Globe20Regular />, title: "Developer Portal", desc: "Auto-generated API portal", bg: "#fce7f3", color: "#db2777" },
  { icon: <ArrowSync20Regular />, title: "Transformations", desc: "Rewrite requests & responses", bg: "#f0f9ff", color: "#0284c7" },
  { icon: <DocumentText20Regular />, title: "OpenAPI Import", desc: "Import from your spec", bg: "#f5f3ff", color: "#7c3aed" },
];

const QUICK_LINKS = [
  { icon: <ClipboardTextLtr20Regular />, label: "API Policies" },
  { icon: <DataBarVertical20Regular />, label: "Analytics" },
  { icon: <Key20Regular />, label: "Subscriptions" },
  { icon: <Globe20Regular />, label: "Developer Portal" },
  { icon: <BeakerSettings20Regular />, label: "Test Console" },
  { icon: <Document20Regular />, label: "Documentation" },
];

type LinkState = "not-linked" | "linking" | "linked";
type StepState = "pending" | "running" | "done";

interface Step {
  title: string;
  state: StepState;
  label: string;
}

export function ApiManagementTab() {
  const styles = useStyles();
  const [linkState, setLinkState] = useState<LinkState>("not-linked");
  const [apimInstance, setApimInstance] = useState("");
  const [apiName, setApiName] = useState("");
  const [openApiEnabled, setOpenApiEnabled] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { title: "Connecting to API Management", state: "pending", label: "Waiting..." },
    { title: "Registering API", state: "pending", label: "Waiting..." },
    { title: "Linking to App Service", state: "pending", label: "Waiting..." },
  ]);
  const [linkFinished, setLinkFinished] = useState(false);

  const apis = apimInstance ? APIM_APIS[apimInstance] || [] : [];
  const canLink = !!(apimInstance && apiName);

  const startLinking = useCallback(async () => {
    setLinkState("linking");
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    setSteps((s) => s.map((st, i) => (i === 0 ? { ...st, state: "running", label: "Connecting..." } : st)));
    await delay(1400);
    setSteps((s) => s.map((st, i) => (i === 0 ? { ...st, state: "done", label: "Connected" } : st)));

    setSteps((s) => s.map((st, i) => (i === 1 ? { ...st, state: "running", label: "Registering..." } : st)));
    await delay(1800);
    setSteps((s) => s.map((st, i) => (i === 1 ? { ...st, state: "done", label: "API registered" } : st)));

    setSteps((s) => s.map((st, i) => (i === 2 ? { ...st, state: "running", label: "Linking..." } : st)));
    await delay(1400);
    setSteps((s) => s.map((st, i) => (i === 2 ? { ...st, state: "done", label: "Linked" } : st)));

    setLinkFinished(true);
  }, []);

  const showLinked = useCallback(() => {
    setLinkState("linked");
    setLinkFinished(false);
  }, []);

  const handleUnlink = useCallback(() => {
    setLinkState("not-linked");
    setApimInstance("");
    setApiName("");
    setOpenApiEnabled(false);
    setSteps([
      { title: "Connecting to API Management", state: "pending", label: "Waiting..." },
      { title: "Registering API", state: "pending", label: "Waiting..." },
      { title: "Linking to App Service", state: "pending", label: "Waiting..." },
    ]);
  }, []);

  const gatewayUrl = apimInstance ? `https://${apimInstance}.azure-api.net` : "";
  const devPortalUrl = apimInstance ? `https://${apimInstance}.developer.azure-api.net` : "";

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={styles.heroTitle}>API Management</div>
        <div className={styles.heroDesc}>
          Manage, secure, and publish your APIs at scale with rate limiting, auth policies, analytics, and an auto-generated developer portal.
        </div>
        <Link className={styles.heroLink} href="https://go.microsoft.com/fwlink/?linkid=854023" target="_blank">
          Learn more <ArrowRight16Regular />
        </Link>
      </div>

      {/* Features */}
      <div className={styles.sectionLabel}>Capabilities</div>
      <div className={styles.featuresGrid}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIconWrap} style={{ backgroundColor: f.bg, color: f.color }}>
              {f.icon}
            </div>
            <div className={styles.featureTitle}>{f.title}</div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Not linked: form */}
      {linkState === "not-linked" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <div className={styles.cardIcon} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff" }}>
                <PlugConnected20Regular />
              </div>
              <div>
                <div className={styles.cardTitle}>Link an API Management instance</div>
                <div className={styles.cardSubtitle}>Select an instance and API to connect with this App Service</div>
              </div>
            </div>
            <Badge appearance="outline" color="warning" size="medium">
              Not linked
            </Badge>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>
              API Management instance<span className={styles.required}>*</span>
            </label>
            <Dropdown
              className={styles.dropdown}
              placeholder="Select an instance..."
              value={apimInstance || undefined}
              selectedOptions={apimInstance ? [apimInstance] : []}
              onOptionSelect={(_, data) => {
                setApimInstance(data.optionValue ?? "");
                setApiName("");
              }}
            >
              <Option value="apim-prod">apim-prod (East US)</Option>
              <Option value="apim-staging">apim-staging (West US)</Option>
            </Dropdown>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>
              API<span className={styles.required}>*</span>
              <span className={styles.hint}>The API to link with this App Service</span>
            </label>
            <Dropdown
              className={styles.dropdown}
              placeholder={apimInstance ? "Select an API..." : "Select an instance first..."}
              disabled={!apimInstance}
              value={apiName || undefined}
              selectedOptions={apiName ? [apiName] : []}
              onOptionSelect={(_, data) => setApiName(data.optionValue ?? "")}
            >
              {apis.map((api) => (
                <Option key={api} value={api}>{api}</Option>
              ))}
            </Dropdown>
          </div>

          <div className={styles.separator} />

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Use OpenAPI Specification</div>
              <div className={styles.toggleDesc}>
                Import schema from <code>/openapi.json</code> automatically
              </div>
            </div>
            <Switch
              checked={openApiEnabled}
              onChange={(_, data) => setOpenApiEnabled(data.checked)}
            />
          </div>

          <div className={styles.footer}>
            <Button appearance="secondary" onClick={handleUnlink} shape="circular">
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!canLink}
              onClick={startLinking}
              shape="circular"
              icon={<PlugConnected20Regular />}
            >
              Link API
            </Button>
          </div>
        </div>
      )}

      {/* Linking: progress */}
      {linkState === "linking" && (
        <div className={styles.card}>
          <div className={styles.cardTitleRow} style={{ marginBottom: "24px" }}>
            <div className={styles.cardIcon} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff" }}>
              <Spinner size="tiny" style={{ color: "#fff" }} />
            </div>
            <div>
              <div className={styles.cardTitle}>Linking in progress</div>
              <div className={styles.cardSubtitle}>
                Connecting {apiName} to {apimInstance}
              </div>
            </div>
          </div>

          <div className={styles.progressContainer}>
            {steps.map((step, i) => (
              <div key={i}>
                {i > 0 && (
                  <div className={mergeClasses(
                    styles.stepLine,
                    steps[i - 1].state === "done" && styles.stepLineDone
                  )} />
                )}
                <div className={styles.stepRow}>
                  <div
                    className={mergeClasses(
                      styles.stepIndicator,
                      step.state === "pending" && styles.indicatorPending,
                      step.state === "running" && styles.indicatorRunning,
                      step.state === "done" && styles.indicatorDone
                    )}
                  >
                    {step.state === "running" ? (
                      <Spinner size="tiny" />
                    ) : step.state === "done" ? (
                      <Checkmark16Filled />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <div
                      className={styles.stepLabel}
                      style={{
                        color:
                          step.state === "running"
                            ? "#667eea"
                            : step.state === "done"
                              ? "#059669"
                              : tokens.colorNeutralForeground4,
                      }}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {linkFinished && (
            <>
              <div className={styles.successBox}>
                <Checkmark16Filled />
                API linked successfully — your app is now connected.
              </div>
              <div className={styles.footer}>
                <Button appearance="secondary" onClick={handleUnlink} shape="circular">
                  Back
                </Button>
                <Button appearance="primary" onClick={showLinked} shape="circular">
                  View Connection
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Linked: summary */}
      {linkState === "linked" && (
        <div className={styles.card}>
          <div className={styles.linkedHeader}>
            <div className={styles.linkedTitleRow}>
              <div className={styles.cardIcon} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                <Checkmark16Filled />
              </div>
              <div>
                <div className={styles.cardTitle}>Connected to API Management</div>
                <div className={styles.cardSubtitle}>Your App Service is linked and receiving traffic through APIM</div>
              </div>
            </div>
            <div className={styles.linkedActions}>
              <Badge appearance="filled" color="success" size="medium">
                Active
              </Badge>
              <Button
                appearance="primary"
                size="small"
                icon={<Open16Regular />}
                shape="circular"
                onClick={() => window.open("#", "_blank")}
              >
                Open in APIM
              </Button>
              <Button
                appearance="subtle"
                size="small"
                icon={<LinkDismiss20Regular />}
                onClick={handleUnlink}
              >
                Unlink
              </Button>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>APIM Instance</div>
              <div className={styles.summaryValue}>
                <Link href="#">{apimInstance}</Link>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>API</div>
              <div className={styles.summaryValue}>{apiName}</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Gateway URL</div>
              <div className={styles.summaryValue}>
                <span className={styles.urlText}>{gatewayUrl}</span>
                <Button
                  icon={<Copy16Regular />}
                  appearance="subtle"
                  size="small"
                  onClick={() => copyText(gatewayUrl)}
                />
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Developer Portal</div>
              <div className={styles.summaryValue}>
                <span className={styles.urlText}>{devPortalUrl}</span>
                <Button
                  icon={<Copy16Regular />}
                  appearance="subtle"
                  size="small"
                  onClick={() => copyText(devPortalUrl)}
                />
              </div>
            </div>
          </div>

          <div className={styles.subsectionTitle}>Quick links</div>
          <div className={styles.quickLinksGrid}>
            {QUICK_LINKS.map((ql) => (
              <a key={ql.label} href="#" className={styles.quickLink}>
                {ql.icon} {ql.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
