import { useState, useCallback } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  TabList,
  Tab,
  type SelectTabData,
} from "@fluentui/react-components";
import {
  Link16Regular,
  Document16Regular,
  ShieldCheckmark16Regular,
} from "@fluentui/react-icons";
import { ApiManagementTab } from "./ApiManagementTab";
import { ApiDefinitionTab } from "./ApiDefinitionTab";
import { CorsTab } from "./CorsTab";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#fafbfc",
  },
  tabStrip: {
    ...shorthands.padding("0", "32px"),
    paddingTop: "20px",
    flexShrink: 0,
    backgroundColor: "#fff",
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },
  tabContent: {
    flex: 1,
    overflowY: "auto",
    ...shorthands.padding("32px", "32px", "48px"),
  },
});

export type ApiTabId = "api-management" | "api-definition" | "cors";

export function ApiHub() {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<ApiTabId>("api-management");

  const handleTabChange = useCallback((_: unknown, data: SelectTabData) => {
    setActiveTab(data.value as ApiTabId);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.tabStrip}>
        <TabList
          selectedValue={activeTab}
          onTabSelect={handleTabChange}
          size="large"
        >
          <Tab value="api-management" icon={<Link16Regular />}>
            API Management
          </Tab>
          <Tab value="api-definition" icon={<Document16Regular />}>
            API Definition
          </Tab>
          <Tab value="cors" icon={<ShieldCheckmark16Regular />}>
            CORS
          </Tab>
        </TabList>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "api-management" && <ApiManagementTab />}
        {activeTab === "api-definition" && <ApiDefinitionTab />}
        {activeTab === "cors" && <CorsTab />}
      </div>
    </div>
  );
}
