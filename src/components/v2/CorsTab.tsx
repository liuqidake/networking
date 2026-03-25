import { useState, useCallback } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Input,
  Button,
  Checkbox,
  Link,
  Spinner,
  Tooltip,
} from "@fluentui/react-components";
import {
  Add16Regular,
  Delete16Regular,
  ShieldCheckmark20Regular,
  Warning16Regular,
  Save16Regular,
  Checkmark16Filled,
  ArrowRight16Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    maxWidth: "720px",
  },
  // Hero
  hero: {
    background: "linear-gradient(135deg, #059669 0%, #0ea5e9 100%)",
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
    backgroundImage: "radial-gradient(circle at 25% 60%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 30%, #fff 1px, transparent 1px)",
    backgroundSize: "55px 55px, 75px 75px",
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
  // Notice
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 18px",
    marginBottom: "24px",
    backgroundColor: "#fffbeb",
    ...shorthands.borderRadius("10px"),
    fontSize: "13px",
    color: "#92400e",
    lineHeight: "20px",
  },
  noticeIcon: {
    color: "#d97706",
    flexShrink: 0,
    marginTop: "2px",
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
    marginBottom: "20px",
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
  // Origins
  originCount: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "12px",
  },
  originsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "14px",
  },
  originRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  originIndex: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground4,
    minWidth: "20px",
    textAlign: "right",
    flexShrink: 0,
    fontWeight: 500,
  },
  originInput: {
    flex: 1,
    maxWidth: "420px",
  },
  validationError: {
    fontSize: "11px",
    color: tokens.colorPaletteRedForeground1,
    marginTop: "2px",
    marginLeft: "28px",
  },
  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: tokens.colorNeutralForeground4,
    fontSize: "13px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
    marginBottom: "14px",
    lineHeight: "20px",
  },
  addButton: {
    marginTop: "4px",
  },
  saveArea: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "16px",
  },
  // Credentials
  subsectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "4px",
    letterSpacing: "-0.01em",
  },
  subsectionDesc: {
    fontSize: "13px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "16px",
    lineHeight: "20px",
  },
  credentialsBox: {
    padding: "16px 18px",
    backgroundColor: "#f8f9fb",
    ...shorthands.borderRadius("10px"),
  },
  credentialsRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
  },
  credentialLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  credentialDesc: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "3px",
    lineHeight: "18px",
  },
  warningBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 14px",
    marginTop: "12px",
    backgroundColor: "#fef2f2",
    ...shorthands.borderRadius("8px"),
    fontSize: "12px",
    color: "#991b1b",
    lineHeight: "18px",
  },
  warningIcon: {
    color: "#dc2626",
    flexShrink: 0,
    marginTop: "1px",
  },
  // Save status
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
  savingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    fontSize: "13px",
    color: tokens.colorNeutralForeground3,
  },
});

const ORIGIN_REGEX = /^(https?):\/\/(www\.)?(\*\.)?[^ */\"]+$/;

interface OriginEntry {
  id: number;
  value: string;
}

let nextId = 1;

export function CorsTab() {
  const styles = useStyles();
  const [origins, setOrigins] = useState<OriginEntry[]>([]);
  const [savedOrigins, setSavedOrigins] = useState<string[]>([]);
  const [supportCredentials, setSupportCredentials] = useState(false);
  const [savedSupportCredentials, setSavedSupportCredentials] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const hasWildcard = origins.some((o) => o.value === "*");
  const credentialWildcardConflict = supportCredentials && hasWildcard;

  const currentOriginValues = origins.map((o) => o.value).sort().join(",");
  const savedOriginValues = [...savedOrigins].sort().join(",");
  const isDirty =
    currentOriginValues !== savedOriginValues ||
    supportCredentials !== savedSupportCredentials;

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const vals = origins.map((o) => o.value);
    setSavedOrigins(vals);
    setSavedSupportCredentials(supportCredentials);
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  }, [origins, supportCredentials]);

  const addOrigin = useCallback(() => {
    setOrigins((prev) => [...prev, { id: nextId++, value: "" }]);
  }, []);

  const removeOrigin = useCallback((id: number) => {
    setOrigins((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const updateOrigin = useCallback((id: number, value: string) => {
    setOrigins((prev) =>
      prev.map((o) => (o.id === id ? { ...o, value } : o))
    );
  }, []);

  const isOriginValid = (value: string): boolean => {
    if (!value) return false;
    if (value === "*") return true;
    return ORIGIN_REGEX.test(value);
  };

  const allOriginsValid = (): boolean => {
    return origins.every((o) => isOriginValid(o.value));
  };

  const canSave = isDirty && !credentialWildcardConflict && allOriginsValid();

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={styles.heroTitle}>Cross-Origin Resource Sharing</div>
        <div className={styles.heroDesc}>
          Configure which origins can make cross-origin requests to your API. Platform-level CORS runs before your application code.
        </div>
        <Link className={styles.heroLink} href="https://go.microsoft.com/fwlink/?linkid=870118" target="_blank">
          Learn more <ArrowRight16Regular />
        </Link>
      </div>

      {/* Platform notice */}
      <div className={styles.notice}>
        <Warning16Regular className={styles.noticeIcon} />
        <div>
          Platform-level CORS configured here <strong>overrides</strong> any in-code CORS middleware. If you need per-route control, remove all origins here and configure CORS in your application code instead.
        </div>
      </div>

      {/* Allowed Origins */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <ShieldCheckmark20Regular />
          </div>
          <div>
            <div className={styles.cardTitle}>Allowed Origins</div>
            <div className={styles.cardSubtitle}>Specify which origins can make cross-origin requests</div>
          </div>
        </div>

        <div className={styles.originCount}>
          {origins.length} origin{origins.length !== 1 ? "s" : ""} configured
        </div>

        {origins.length === 0 ? (
          <div className={styles.emptyState}>
            No allowed origins configured.<br />
            Add an origin or use <strong>*</strong> to allow all.
          </div>
        ) : (
          <div className={styles.originsList}>
            {origins.map((origin, idx) => {
              const valid = !origin.value || isOriginValid(origin.value);
              return (
                <div key={origin.id}>
                  <div className={styles.originRow}>
                    <span className={styles.originIndex}>{idx + 1}.</span>
                    <Input
                      className={styles.originInput}
                      placeholder="https://example.com or *"
                      value={origin.value}
                      onChange={(_, data) => updateOrigin(origin.id, data.value)}
                      appearance="outline"
                      size="small"
                    />
                    <Tooltip content="Remove origin" relationship="label">
                      <Button
                        icon={<Delete16Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={() => removeOrigin(origin.id)}
                      />
                    </Tooltip>
                  </div>
                  {origin.value && !valid && (
                    <div className={styles.validationError}>
                      Invalid format. Use: https://example.com or * for wildcard
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Button
          icon={<Add16Regular />}
          appearance="outline"
          size="small"
          onClick={addOrigin}
          shape="circular"
        >
          Add origin
        </Button>
      </div>

      {/* Credentials */}
      <div className={styles.card}>
        <div className={styles.subsectionTitle}>Request Credentials</div>
        <div className={styles.subsectionDesc}>
          Controls the <code>Access-Control-Allow-Credentials</code> response header.
        </div>

        <div className={styles.credentialsBox}>
          <div className={styles.credentialsRow}>
            <div>
              <div className={styles.credentialLabel}>
                Enable Access-Control-Allow-Credentials
              </div>
              <div className={styles.credentialDesc}>
                When enabled, browsers can include cookies and authentication tokens in cross-origin requests. Cannot be used with wildcard (*) origins.
              </div>
            </div>
            <Checkbox
              checked={supportCredentials}
              onChange={(_, data) =>
                setSupportCredentials(data.checked === true)
              }
            />
          </div>

          {credentialWildcardConflict && (
            <div className={styles.warningBox}>
              <Warning16Regular className={styles.warningIcon} />
              <div>
                <strong>Invalid configuration:</strong> Cannot enable credentials with wildcard (*) origin. Remove the wildcard and specify explicit origins, or disable credentials.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save area — below all fields */}
      <div className={styles.saveArea}>
        <Button
          appearance="primary"
          icon={saving ? <Spinner size="tiny" /> : <Save16Regular />}
          disabled={!canSave || saving}
          onClick={handleSave}
          shape="circular"
        >
          Save changes
        </Button>
      </div>

      {saving && (
        <div className={styles.savingRow}>
          <Spinner size="tiny" />
          Saving CORS configuration...
        </div>
      )}

      {justSaved && (
        <div className={styles.savedToast}>
          <Checkmark16Filled />
          CORS configuration saved successfully.
        </div>
      )}
    </div>
  );
}
