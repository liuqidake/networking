import { useState, useCallback } from "react";
import {
  Badge,
  Button,
  Switch,
  Dropdown,
  Option,
  Spinner,
  Tooltip,
} from "@fluentui/react-components";
import {
  PlugConnected20Regular,
  PlugDisconnected20Regular,
  ArrowRouting20Regular,
  Info16Regular,
  Warning16Regular,
  Copy16Regular,
  ShieldCheckmark20Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type { NetworkingState } from "./types";

interface VnetIntegrationPanelProps {
  state: NetworkingState;
}

const AVAILABLE_VNETS = [
  { id: "my-vnet", name: "my-vnet", region: "East US", addressSpace: "10.0.0.0/16" },
  { id: "prod-vnet", name: "prod-vnet", region: "East US", addressSpace: "10.1.0.0/16" },
  { id: "staging-vnet", name: "staging-vnet", region: "West US", addressSpace: "172.16.0.0/16" },
];

const AVAILABLE_SUBNETS: Record<string, { id: string; name: string; prefix: string; available: boolean }[]> = {
  "my-vnet": [
    { id: "app-subnet", name: "app-subnet", prefix: "10.0.0.0/24", available: false },
    { id: "db-subnet", name: "db-subnet", prefix: "10.0.1.0/24", available: true },
    { id: "cache-subnet", name: "cache-subnet", prefix: "10.0.2.0/24", available: true },
  ],
  "prod-vnet": [
    { id: "web-subnet", name: "web-subnet", prefix: "10.1.0.0/24", available: true },
    { id: "api-subnet", name: "api-subnet", prefix: "10.1.1.0/24", available: true },
  ],
  "staging-vnet": [
    { id: "default", name: "default", prefix: "172.16.0.0/24", available: true },
  ],
};

export function VnetIntegrationPanel({ state }: VnetIntegrationPanelProps) {
  const styles = useNetworkingStyles();
  const { site, vnetIntegration, subnet, natGateway } = state;
  const isConnected = !!vnetIntegration;
  const props = site.properties;

  // State for connect form
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [selectedVnet, setSelectedVnet] = useState("");
  const [selectedSubnet, setSelectedSubnet] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Routing toggles (local state mirroring site properties)
  const [routeAll, setRouteAll] = useState(props.vnetRouteAllEnabled);
  const [imagePull, setImagePull] = useState(props.vnetImagePullEnabled);
  const [contentShare, setContentShare] = useState(props.vnetContentShareEnabled);

  // NAT gateway warning: route-all disabled but NAT gateway present
  const showNatWarning = !routeAll && !!natGateway;

  const subnets = selectedVnet ? AVAILABLE_SUBNETS[selectedVnet] || [] : [];

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsConnecting(false);
    setShowConnectForm(false);
  }, []);

  const handleDisconnect = useCallback(async () => {
    setIsDisconnecting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsDisconnecting(false);
  }, []);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const outboundIps = props.possibleOutboundIpAddresses.split(",").filter(Boolean);

  return (
    <>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <div
              className={styles.sectionIcon}
              style={{
                backgroundColor: isConnected ? "#ECFDF5" : "#F1F3F5",
                color: isConnected ? "#059669" : "#9CA3AF",
              }}
            >
              {isConnected ? <PlugConnected20Regular /> : <PlugDisconnected20Regular />}
            </div>
            <div>
              <div className={styles.sectionTitle}>VNet Integration</div>
              <div className={styles.sectionSubtitle}>
                {isConnected
                  ? "Your app routes outbound traffic through a virtual network"
                  : "Connect your app to an Azure Virtual Network for private outbound access"}
              </div>
            </div>
          </div>
          <Badge
            appearance="filled"
            color={isConnected ? "success" : "informative"}
            size="medium"
          >
            {isConnected ? "Connected" : "Not connected"}
          </Badge>
        </div>

        {/* NAT Gateway Warning */}
        {showNatWarning && (
          <div className={styles.warningBar}>
            <Warning16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>NAT Gateway not active.</strong> A NAT gateway ({natGateway?.name}) is configured on the
              subnet, but "Route All" is disabled. Enable Route All to route outbound traffic through the NAT
              gateway.
            </div>
          </div>
        )}

        {isConnected && subnet && (
          <>
            {/* Connection details */}
            <div className={styles.sectionLabel}>Connection Details</div>
            <div className={styles.propRow}>
              <span className={styles.propLabel}>Virtual Network</span>
              <span className={styles.propValue}>
                my-vnet
                <Button
                  icon={<Copy16Regular />}
                  appearance="subtle"
                  size="small"
                  onClick={() => copyText("my-vnet")}
                />
              </span>
            </div>
            <div className={styles.propRow}>
              <span className={styles.propLabel}>Subnet</span>
              <span className={styles.propValue}>
                {subnet.name} ({subnet.properties.addressPrefix})
              </span>
            </div>
            {natGateway && (
              <div className={styles.propRow}>
                <span className={styles.propLabel}>NAT Gateway</span>
                <span className={styles.propValue}>{natGateway.name}</span>
              </div>
            )}
            {subnet.properties.networkSecurityGroup && (
              <div className={styles.propRow}>
                <span className={styles.propLabel}>Network Security Group</span>
                <span className={styles.propValue}>
                  {subnet.properties.networkSecurityGroup.id.split("/").pop()}
                </span>
              </div>
            )}
            <div className={styles.propRow}>
              <span className={styles.propLabel}>User Defined Route</span>
              <span className={styles.propValue}>
                {subnet.properties.routeTable
                  ? subnet.properties.routeTable.id.split("/").pop()
                  : "N/A"}
              </span>
            </div>
            {subnet.properties.serviceEndpoints.length > 0 && (
              <div className={styles.propRow}>
                <span className={styles.propLabel}>Service Endpoints</span>
                <span className={styles.propValue}>
                  {subnet.properties.serviceEndpoints.map((se) => se.service.split(".").pop()).join(", ")}
                </span>
              </div>
            )}

            <div className={styles.separator} />

            {/* Routing Configuration */}
            <div className={styles.sectionLabel}>Routing Configuration</div>
            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>
                  Route All
                  <Tooltip
                    content="Route all outbound traffic through the VNet instead of only RFC1918 traffic"
                    relationship="description"
                  >
                    <Info16Regular style={{ marginLeft: "6px", color: "#9CA3AF" }} />
                  </Tooltip>
                </div>
                <div className={styles.toggleDesc}>
                  Send all outbound traffic through the virtual network
                </div>
              </div>
              <Switch checked={routeAll} onChange={(_, data) => setRouteAll(data.checked)} />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>VNet Image Pull</div>
                <div className={styles.toggleDesc}>
                  Pull container images from registry over VNet
                </div>
              </div>
              <Switch checked={imagePull} onChange={(_, data) => setImagePull(data.checked)} />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>VNet Content Share</div>
                <div className={styles.toggleDesc}>
                  Access content share storage over VNet
                </div>
              </div>
              <Switch checked={contentShare} onChange={(_, data) => setContentShare(data.checked)} />
            </div>

            <div className={styles.separator} />

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button
                appearance="subtle"
                icon={<PlugDisconnected20Regular />}
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </>
        )}

        {/* Not connected state */}
        {!isConnected && !showConnectForm && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <PlugDisconnected20Regular />
            </div>
            <div className={styles.emptyTitle}>No VNet integration configured</div>
            <div className={styles.emptyDesc}>
              Connect your app to a virtual network to access private resources and control outbound traffic routing.
            </div>
            <Button
              appearance="primary"
              icon={<PlugConnected20Regular />}
              onClick={() => setShowConnectForm(true)}
              shape="circular"
            >
              Add VNet Integration
            </Button>
          </div>
        )}

        {/* Connect form */}
        {!isConnected && showConnectForm && (
          <>
            <div className={styles.infoBar}>
              <Info16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                Select a virtual network and a subnet delegated to <code>Microsoft.Web/serverFarms</code>.
                The subnet must have at least a /28 address space.
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className={styles.toggleLabel} style={{ display: "block", marginBottom: "8px" }}>
                Virtual Network
              </label>
              <Dropdown
                placeholder="Select a virtual network..."
                style={{ width: "100%", maxWidth: "400px" }}
                value={selectedVnet || undefined}
                selectedOptions={selectedVnet ? [selectedVnet] : []}
                onOptionSelect={(_, data) => {
                  setSelectedVnet(data.optionValue ?? "");
                  setSelectedSubnet("");
                }}
              >
                {AVAILABLE_VNETS.map((v) => (
                  <Option key={v.id} value={v.id} text={`${v.name} (${v.region} · ${v.addressSpace})`}>
                    {v.name} ({v.region} &middot; {v.addressSpace})
                  </Option>
                ))}
              </Dropdown>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className={styles.toggleLabel} style={{ display: "block", marginBottom: "8px" }}>
                Subnet
              </label>
              <Dropdown
                placeholder={selectedVnet ? "Select a subnet..." : "Select a VNet first..."}
                disabled={!selectedVnet}
                style={{ width: "100%", maxWidth: "400px" }}
                value={selectedSubnet || undefined}
                selectedOptions={selectedSubnet ? [selectedSubnet] : []}
                onOptionSelect={(_, data) => setSelectedSubnet(data.optionValue ?? "")}
              >
                {subnets.map((s) => (
                  <Option key={s.id} value={s.id} disabled={!s.available} text={`${s.name} (${s.prefix})${!s.available ? " — in use" : ""}`}>
                    {s.name} ({s.prefix}){!s.available ? " — in use" : ""}
                  </Option>
                ))}
              </Dropdown>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button appearance="secondary" onClick={() => setShowConnectForm(false)} shape="circular">
                Cancel
              </Button>
              <Button
                appearance="primary"
                disabled={!selectedVnet || !selectedSubnet || isConnecting}
                onClick={handleConnect}
                shape="circular"
                icon={isConnecting ? <Spinner size="tiny" /> : <PlugConnected20Regular />}
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Outbound IPs card */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <div className={styles.sectionIcon} style={{ backgroundColor: "#EEF2FF", color: "#667EEA" }}>
              <ArrowRouting20Regular />
            </div>
            <div>
              <div className={styles.sectionTitle}>Outbound Addresses</div>
              <div className={styles.sectionSubtitle}>
                IPs used by your app for outbound connections
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionLabel}>Possible Outbound IPs</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {outboundIps.map((ip) => (
            <Badge
              key={ip}
              appearance="outline"
              color="informative"
              size="large"
              style={{ fontFamily: "'SF Mono', 'Cascadia Code', monospace", cursor: "pointer" }}
              onClick={() => copyText(ip)}
            >
              {ip}
            </Badge>
          ))}
        </div>

        <div className={styles.separator} />

        <div className={styles.sectionLabel}>Inbound IP</div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Virtual IP (VIP)</span>
          <span className={styles.propValue}>
            {props.inboundIpAddress}
            <Button
              icon={<Copy16Regular />}
              appearance="subtle"
              size="small"
              onClick={() => copyText(props.inboundIpAddress)}
            />
          </span>
        </div>
      </div>

      {/* Features note */}
      {isConnected && (
        <div className={styles.infoBar}>
          <ShieldCheckmark20Regular style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            VNet Integration is active. Outbound traffic from your app routes through <strong>{subnet?.name}</strong>{" "}
            ({subnet?.properties.addressPrefix}). To access on-premises resources, configure{" "}
            <strong>Hybrid Connections</strong> or a VPN gateway.
          </div>
        </div>
      )}
    </>
  );
}
