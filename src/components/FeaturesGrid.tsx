import { makeStyles, tokens, shorthands, Card, Text } from "@fluentui/react-components";
import {
  ShieldCheckmark20Regular,
  Flash20Regular,
  DataBarVertical20Regular,
  Globe20Regular,
  ArrowSync20Regular,
  DocumentText20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  card: {
    marginBottom: "16px",
    padding: "20px",
  },
  header: {
    marginBottom: "16px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
  },
  featureCard: {
    padding: "14px",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    transitionProperty: "border-color, box-shadow",
    transitionDuration: "0.15s",
    "&:hover": {
      ...shorthands.borderColor(tokens.colorNeutralStroke1Hover),
      boxShadow: tokens.shadow4,
    },
  },
  featureIcon: {
    fontSize: "18px",
    marginBottom: "6px",
    color: tokens.colorBrandForeground1,
  },
  featureTitle: {
    fontSize: "12.5px",
    fontWeight: 600,
    marginBottom: "3px",
  },
  featureDesc: {
    fontSize: "11.5px",
    color: tokens.colorNeutralForeground3,
    lineHeight: "1.5",
  },
});

const features = [
  { icon: <ShieldCheckmark20Regular />, title: "Security & Auth", desc: "OAuth 2.0, API keys, JWT validation, IP filtering" },
  { icon: <Flash20Regular />, title: "Rate Limiting", desc: "Per-consumer throttle and quota policies" },
  { icon: <DataBarVertical20Regular />, title: "Analytics", desc: "Track requests, latency, errors in real time" },
  { icon: <Globe20Regular />, title: "Developer Portal", desc: "Auto-generated portal for API discovery" },
  { icon: <ArrowSync20Regular />, title: "Transformations", desc: "Modify requests/responses, rewrite URLs" },
  { icon: <DocumentText20Regular />, title: "OpenAPI Support", desc: "Import directly from your OpenAPI spec" },
];

export function FeaturesGrid() {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text className={styles.title} block>What you'll get</Text>
        <Text className={styles.subtitle} block>Capabilities unlocked after linking</Text>
      </div>
      <div className={styles.grid}>
        {features.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div className={styles.featureTitle}>{f.title}</div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
