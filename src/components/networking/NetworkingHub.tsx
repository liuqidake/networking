import { useState, useCallback, useEffect } from "react";
import {
  TabList,
  Tab,
  Spinner,
  Badge,
  Button,
  Link,
  type SelectTabData,
} from "@fluentui/react-components";
import {
  Globe20Regular,
  PlugConnected20Regular,
  LockClosed20Regular,
  ShieldCheckmark20Regular,
  ArrowRouting20Regular,
  ArrowSync16Regular,
  Wrench20Regular,
  ChatMultiple20Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import {
  SecurityPostureCard,
  TopologyDiagram,
  QuickSetup,
} from "./SecurityPosture";
import { VnetIntegrationPanel } from "./VnetIntegrationPanel";
import { AccessRestrictionsPanel } from "./AccessRestrictionsPanel";
import { PrivateEndpointsPanel } from "./PrivateEndpointsPanel";
import { HybridConnectionsPanel } from "./HybridConnectionsPanel";
import { NetworkAddressesCard } from "./OverviewProperties";
import { getMockNetworkingState } from "./mockData";
import type { NetworkingState } from "./types";

type NetworkingSection =
  | "overview"
  | "access-restrictions"
  | "private-endpoints"
  | "vnet-integration"
  | "hybrid-connections";

export function NetworkingHub() {
  const styles = useNetworkingStyles();
  const [activeSection, setActiveSection] = useState<NetworkingSection>("overview");
  const [state, setState] = useState<NetworkingState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(getMockNetworkingState());
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setState(getMockNetworkingState());
    setIsRefreshing(false);
  }, []);

  const handleTabChange = useCallback((_: unknown, data: SelectTabData) => {
    setActiveSection(data.value as NetworkingSection);
  }, []);

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section as NetworkingSection);
  }, []);

  // Loading state
  if (!state) {
    return (
      <div className={styles.root}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Spinner size="large" />
          <div style={{ fontSize: "14px", color: "#6B7280" }}>Loading networking configuration...</div>
        </div>
      </div>
    );
  }

  const peCount = state.site.properties.privateEndpointConnections?.length ?? 0;
  const hcCount = state.hybridConnections.length;

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitle}>Networking</div>
          <div className={styles.headerSubtitle}>
            Configure inbound and outbound network access for{" "}
            <strong>{state.site.name}</strong>
          </div>
        </div>

        {/* Tab navigation: intent-based (inbound/outbound) */}
        <TabList
          selectedValue={activeSection}
          onTabSelect={handleTabChange}
          size="medium"
          style={{ marginTop: "4px" }}
        >
          <Tab value="overview" icon={<Globe20Regular />}>
            Overview
          </Tab>
          <Tab value="access-restrictions" icon={<ShieldCheckmark20Regular />}>
            Access Restrictions
          </Tab>
          <Tab value="private-endpoints" icon={<LockClosed20Regular />}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Private Endpoints
              {peCount > 0 && (
                <Badge appearance="tint" color="brand" size="small">
                  {peCount}
                </Badge>
              )}
            </span>
          </Tab>
          <Tab value="vnet-integration" icon={<PlugConnected20Regular />}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Outbound (VNet)
              {state.vnetIntegration && (
                <Badge appearance="tint" color="success" size="small">
                  Connected
                </Badge>
              )}
            </span>
          </Tab>
          <Tab value="hybrid-connections" icon={<ArrowRouting20Regular />}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Hybrid Connections
              {hcCount > 0 && (
                <Badge appearance="tint" color="severe" size="small">
                  {hcCount}
                </Badge>
              )}
            </span>
          </Tab>
        </TabList>
      </div>

      {/* Content */}
      <div className={styles.scrollArea}>
        <div className={styles.content}>
          {activeSection === "overview" && (
            <>
              <div className={styles.toolbarContainer}>
                <Button
                  appearance="subtle"
                  icon={isRefreshing ? <Spinner size="tiny" /> : <ArrowSync16Regular />}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  size="small"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  appearance="subtle"
                  icon={<Wrench20Regular />}
                  size="small"
                >
                  Troubleshoot
                </Button>
                <Button
                  appearance="subtle"
                  icon={<ChatMultiple20Regular />}
                  size="small"
                >
                  Send us your feedback
                </Button>
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: "20px" }}>
                Check your network configuration. Select any of the features listed below to change your network setup.{" "}
                <Link href="https://go.microsoft.com/fwlink/?linkid=2157461" target="_blank" inline>
                  Learn more
                </Link>
              </div>
              <SecurityPostureCard state={state} onNavigate={handleNavigate} />
              <TopologyDiagram state={state} onNodeClick={handleNavigate} />
              <NetworkAddressesCard state={state} />
              <QuickSetup onNavigate={handleNavigate} />
            </>
          )}

          {activeSection === "access-restrictions" && (
            <AccessRestrictionsPanel state={state} />
          )}

          {activeSection === "private-endpoints" && (
            <PrivateEndpointsPanel state={state} />
          )}

          {activeSection === "vnet-integration" && (
            <VnetIntegrationPanel state={state} />
          )}

          {activeSection === "hybrid-connections" && (
            <HybridConnectionsPanel state={state} />
          )}
        </div>
      </div>
    </div>
  );
}
