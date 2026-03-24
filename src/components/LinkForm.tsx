import {
  makeStyles,
  tokens,
  Card,
  Text,
  Dropdown,
  Option,
  Switch,
  Button,
  Divider,
} from "@fluentui/react-components";
import { useState } from "react";

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
  stepBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke2Contrast}`,
    color: tokens.colorBrandForeground1,
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
  formGroup: {
    marginBottom: "18px",
    maxWidth: "400px",
  },
  label: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    marginBottom: "6px",
  },
  required: {
    color: tokens.colorPaletteRedForeground1,
    marginLeft: "3px",
  },
  hint: {
    fontWeight: 400,
    color: tokens.colorNeutralForeground3,
    fontSize: "11.5px",
    marginLeft: "6px",
  },
  dropdown: {
    width: "100%",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "12px 14px",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  toggleLabel: {
    fontSize: "12.5px",
    fontWeight: 500,
  },
  toggleDesc: {
    fontSize: "11.5px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
    lineHeight: "1.45",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    gap: "8px",
  },
  footerNote: {
    fontSize: "11.5px",
    color: tokens.colorNeutralForeground3,
    marginRight: "auto",
  },
});

const APIM_APIS: Record<string, string[]> = {
  "apim-prod": ["Payments API v2", "User Service API", "Inventory API"],
  "apim-staging": ["Payments API v1 (staging)", "Auth API (staging)"],
};

interface LinkFormProps {
  onLink: (apimInstance: string, apiName: string) => void;
}

export function LinkForm({ onLink }: LinkFormProps) {
  const styles = useStyles();
  const [apimInstance, setApimInstance] = useState("");
  const [apiName, setApiName] = useState("");
  const [openApiEnabled, setOpenApiEnabled] = useState(false);

  const apis = apimInstance ? APIM_APIS[apimInstance] || [] : [];
  const canLink = apimInstance && apiName;

  const reset = () => {
    setApimInstance("");
    setApiName("");
    setOpenApiEnabled(false);
  };

  return (
    <Card className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.stepBadge}>1</div>
        <div>
          <Text className={styles.title} block>
            Link an API Management instance
          </Text>
          <Text className={styles.subtitle} block>
            Select an instance and API to connect with this App Service
          </Text>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          API Management instance<span className={styles.required}>*</span>
        </label>
        <Dropdown
          className={styles.dropdown}
          placeholder="Select an instance..."
          value={apimInstance ? apimInstance : undefined}
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

      <div className={styles.formGroup}>
        <label className={styles.label}>
          API<span className={styles.required}>*</span>
          <span className={styles.hint}>The API to link with this App Service</span>
        </label>
        <Dropdown
          className={styles.dropdown}
          placeholder={apimInstance ? "Select an API..." : "Select an instance first..."}
          disabled={!apimInstance}
          value={apiName ? apiName : undefined}
          selectedOptions={apiName ? [apiName] : []}
          onOptionSelect={(_, data) => setApiName(data.optionValue ?? "")}
        >
          {apis.map((api) => (
            <Option key={api} value={api}>
              {api}
            </Option>
          ))}
        </Dropdown>
      </div>

      <Divider style={{ margin: "18px 0" }} />

      <div className={styles.toggleRow}>
        <div>
          <div className={styles.toggleLabel}>Use OpenAPI Specification</div>
          <div className={styles.toggleDesc}>
            Import schema from <code>/openapi.json</code> automatically.
          </div>
        </div>
        <Switch
          checked={openApiEnabled}
          onChange={(_, data) => setOpenApiEnabled(data.checked)}
        />
      </div>

      <div className={styles.footer}>
        <span className={styles.footerNote}>
          Linking connects this App Service to the selected APIM instance.
        </span>
        <Button appearance="outline" size="small" onClick={reset}>
          Cancel
        </Button>
        <Button
          appearance="primary"
          size="small"
          disabled={!canLink}
          onClick={() => onLink(apimInstance, apiName)}
        >
          Link API
        </Button>
      </div>
    </Card>
  );
}
