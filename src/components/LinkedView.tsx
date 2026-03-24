import {
  makeStyles,
  tokens,
  shorthands,
  Card,
  Text,
  Button,
  Divider,
  Link,
} from "@fluentui/react-components";
import {
  Checkmark16Filled,
  ClipboardTextLtr20Regular,
  DataBarVertical20Regular,
  Key20Regular,
  Globe20Regular,
  BeakerSettings20Regular,
  Document20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  card: {
    marginBottom: "16px",
    padding: "20px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  stepBadgeDone: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
    color: tokens.colorPaletteGreenForeground1,
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: "11.5px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  item: {
    padding: "14px",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  itemLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "4px",
  },
  itemValue: {
    fontSize: "13px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    wordBreak: "break-all",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  connected: {
    color: tokens.colorPaletteGreenForeground1,
  },
  copyBtn: {
    fontSize: "11px",
  },
  sectionTitle: {
    fontSize: "12.5px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "4px",
  },
  sectionSubtitle: {
    fontSize: "11.5px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "12px",
  },
  quickLinksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "8px",
  },
  quickLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: "12.5px",
    color: tokens.colorBrandForeground1,
    textDecoration: "none",
    cursor: "pointer",
    transitionProperty: "all",
    transitionDuration: "0.15s",
    "&:hover": {
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      backgroundColor: tokens.colorBrandBackground2,
    },
  },
});

interface LinkedViewProps {
  apimInstance: string;
  apiName: string;
}

export function LinkedView({ apimInstance, apiName }: LinkedViewProps) {
  const styles = useStyles();
  const gatewayUrl = `https://${apimInstance}.azure-api.net`;
  const devPortalUrl = `https://${apimInstance}.developer.azure-api.net`;

  const copyToClipboard = async (text: string, btnId: string) => {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById(btnId);
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = orig;
      }, 1500);
    }
  };

  const quickLinks = [
    { icon: <ClipboardTextLtr20Regular />, label: "API Policies" },
    { icon: <DataBarVertical20Regular />, label: "Analytics Dashboard" },
    { icon: <Key20Regular />, label: "Subscriptions & Keys" },
    { icon: <Globe20Regular />, label: "Developer Portal" },
    { icon: <BeakerSettings20Regular />, label: "Test Console" },
    { icon: <Document20Regular />, label: "API Documentation" },
  ];

  return (
    <Card className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.stepBadgeDone}>
          <Checkmark16Filled />
        </div>
        <div>
          <Text className={styles.title} block>
            API Management — Connected
          </Text>
          <Text className={styles.subtitle} block>
            Your App Service is linked to an API Management instance
          </Text>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.item}>
          <div className={styles.itemLabel}>APIM Instance</div>
          <div className={styles.itemValue}>
            <Link href="#">{apimInstance}</Link>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.itemLabel}>API</div>
          <div className={styles.itemValue}>{apiName}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.itemLabel}>Gateway URL</div>
          <div className={styles.itemValue}>
            <span>{gatewayUrl}</span>
            <Button
              id="copy-gateway"
              appearance="outline"
              size="small"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(gatewayUrl, "copy-gateway")}
            >
              Copy
            </Button>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.itemLabel}>Status</div>
          <div className={`${styles.itemValue} ${styles.connected}`}>
            &#9679; Connected
          </div>
        </div>
      </div>

      <Divider style={{ margin: "18px 0" }} />

      <div className={styles.sectionTitle}>Management</div>
      <div className={styles.sectionSubtitle}>
        Quick access to your API Management resources
      </div>

      <div className={styles.grid} style={{ marginBottom: "16px" }}>
        <div className={styles.item}>
          <div className={styles.itemLabel}>Gateway URL</div>
          <div className={styles.itemValue}>
            <span>{gatewayUrl}</span>
            <Button
              id="copy-mgmt-gateway"
              appearance="outline"
              size="small"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(gatewayUrl, "copy-mgmt-gateway")}
            >
              Copy
            </Button>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.itemLabel}>Developer Portal</div>
          <div className={styles.itemValue}>
            <span>{devPortalUrl}</span>
            <Button
              id="copy-dev-portal"
              appearance="outline"
              size="small"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(devPortalUrl, "copy-dev-portal")}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle} style={{ marginBottom: "10px" }}>
        Quick links
      </div>
      <div className={styles.quickLinksGrid}>
        {quickLinks.map((link) => (
          <a key={link.label} href="#" className={styles.quickLink}>
            {link.icon} {link.label}
          </a>
        ))}
      </div>
    </Card>
  );
}
