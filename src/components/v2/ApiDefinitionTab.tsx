import { useState, useCallback } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Input,
  Button,
  Link,
  Spinner,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Checkmark16Filled,
  Info16Regular,
  DocumentText20Regular,
  Save16Regular,
  ArrowRight16Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    maxWidth: "720px",
  },
  // Hero
  hero: {
    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
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
    backgroundImage: "radial-gradient(circle at 30% 40%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 70%, #fff 1px, transparent 1px)",
    backgroundSize: "50px 50px, 70px 70px",
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
    maxWidth: "500px",
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
    gap: "12px",
    marginBottom: "24px",
  },
  cardIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: "#eef2ff",
    color: "#6366f1",
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
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "8px",
    color: tokens.colorNeutralForeground1,
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    maxWidth: "480px",
  },
  hint: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "6px",
    lineHeight: "18px",
    display: "block",
  },
  validationError: {
    fontSize: "12px",
    color: tokens.colorPaletteRedForeground1,
    marginTop: "4px",
  },
  // Status
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px 18px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
    marginTop: "20px",
  },
  statusIcon: {
    width: "36px",
    height: "36px",
    ...shorthands.borderRadius("50%"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "16px",
  },
  statusConnected: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
  },
  statusDisconnected: {
    backgroundColor: "#f1f3f5",
    color: tokens.colorNeutralForeground4,
  },
  statusTitle: {
    fontSize: "14px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  statusDesc: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
  },
  // Preview
  previewCard: {
    padding: "14px 18px",
    marginTop: "16px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
  },
  previewLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "6px",
  },
  previewUrl: {
    fontSize: "13px",
    fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace",
    color: "#6366f1",
    wordBreak: "break-all",
  },
  // Saved toast
  savedToast: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 18px",
    marginTop: "16px",
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    ...shorthands.borderRadius("10px"),
    color: "#059669",
    fontSize: "13px",
    fontWeight: 500,
  },
  // Tip
  tipBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 18px",
    backgroundColor: "#fffbeb",
    ...shorthands.borderRadius("10px"),
    fontSize: "13px",
    color: "#92400e",
    lineHeight: "20px",
  },
  tipIcon: {
    color: "#d97706",
    flexShrink: 0,
    marginTop: "2px",
  },
});

export function ApiDefinitionTab() {
  const styles = useStyles();
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = url !== savedUrl;
  const isValidUrl = !url || /^https?:\/\/.+/.test(url);
  const canSave = isDirty && url && isValidUrl;
  const hasDefinition = !!savedUrl;

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavedUrl(url);
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  }, [url]);

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={styles.heroTitle}>API Definition</div>
        <div className={styles.heroDesc}>
          Provide your OpenAPI specification URL for richer imports, auto-generated documentation, and client SDK generation.
        </div>
        <Link className={styles.heroLink} href="#" target="_blank">
          Learn more <ArrowRight16Regular />
        </Link>
      </div>

      {/* Main form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <DocumentText20Regular />
          </div>
          <div>
            <div className={styles.cardTitle}>OpenAPI Specification URL</div>
            <div className={styles.cardSubtitle}>Point to your API's OpenAPI/Swagger definition endpoint</div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>API definition location</label>
          <div className={styles.inputRow}>
            <Input
              className={styles.input}
              placeholder="https://myapp.azurewebsites.net/swagger/v1/swagger.json"
              value={url}
              onChange={(_, data) => setUrl(data.value)}
              appearance="outline"
            />
            <Button
              appearance="primary"
              icon={saving ? <Spinner size="tiny" /> : <Save16Regular />}
              disabled={!canSave || saving}
              onClick={handleSave}
              shape="circular"
            >
              Save
            </Button>
          </div>
          <span className={styles.hint}>
            Full URL to your OpenAPI 2.0 or 3.x JSON/YAML definition
          </span>
          {url && !isValidUrl && (
            <div className={styles.validationError}>
              URL must start with http:// or https://
            </div>
          )}
        </div>

        {/* Status */}
        <div className={styles.statusRow}>
          <div
            className={mergeClasses(
              styles.statusIcon,
              hasDefinition ? styles.statusConnected : styles.statusDisconnected
            )}
          >
            {hasDefinition ? <Checkmark16Filled /> : <Info16Regular />}
          </div>
          <div>
            <div className={styles.statusTitle}>
              {hasDefinition ? "Definition configured" : "No definition configured"}
            </div>
            <div className={styles.statusDesc}>
              {hasDefinition
                ? "API Management will use this spec for rich imports"
                : "Without a definition, API Management will create wildcard operations"}
            </div>
          </div>
        </div>

        {/* Saved URL preview */}
        {savedUrl && (
          <div className={styles.previewCard}>
            <div className={styles.previewLabel}>Current definition URL</div>
            <div className={styles.previewUrl}>{savedUrl}</div>
          </div>
        )}

        {justSaved && (
          <div className={styles.savedToast}>
            <Checkmark16Filled />
            API definition URL saved successfully.
          </div>
        )}
      </div>

      {/* Tip */}
      <div className={styles.tipBox}>
        <Info16Regular className={styles.tipIcon} />
        <div>
          <strong>Tip:</strong> Configure your API definition URL before linking to API Management. Without it, APIM will only generate wildcard operations instead of strongly-typed API paths.
        </div>
      </div>
    </div>
  );
}
