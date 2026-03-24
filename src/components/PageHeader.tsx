import { makeStyles, tokens, Button, Badge } from "@fluentui/react-components";
import { Link20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
    gap: "16px",
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    width: "42px",
    height: "42px",
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke2Contrast}`,
    borderRadius: tokens.borderRadiusLarge,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
    color: tokens.colorBrandForeground1,
  },
  h1: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: "12.5px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
  },
  badgeLinked: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  badgeNotLinked: {
    backgroundColor: tokens.colorPaletteYellowBackground1,
    color: tokens.colorPaletteDarkOrangeForeground1,
    border: `1px solid ${tokens.colorPaletteYellowBorder1}`,
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    display: "inline-block",
    marginRight: "5px",
  },
  badgeInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11.5px",
    fontWeight: 500,
  },
});

interface PageHeaderProps {
  isLinked: boolean;
  onUnlink: () => void;
}

export function PageHeader({ isLinked, onUnlink }: PageHeaderProps) {
  const styles = useStyles();

  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <div className={styles.icon}>
          <Link20Regular />
        </div>
        <div>
          <h1 className={styles.h1}>API Management</h1>
          <div className={styles.subtitle}>
            Expose, protect, and publish your APIs through Azure API Management
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Badge
          appearance="filled"
          size="medium"
          className={isLinked ? styles.badgeLinked : styles.badgeNotLinked}
        >
          <span className={styles.dot} />
          {isLinked ? "Linked" : "Not linked"}
        </Badge>
        <Button
          appearance="outline"
          size="small"
          disabled={!isLinked}
          onClick={() => window.open("#", "_blank")}
        >
          Go to APIM &#8599;
        </Button>
        <Button
          appearance="outline"
          size="small"
          disabled={!isLinked}
          onClick={onUnlink}
          style={
            isLinked
              ? { color: tokens.colorPaletteRedForeground1, borderColor: tokens.colorPaletteRedBorder1 }
              : undefined
          }
        >
          Unlink API
        </Button>
        <Button appearance="outline" size="small">
          Send feedback
        </Button>
      </div>
    </div>
  );
}
