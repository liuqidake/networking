import { Badge, Button, Tooltip } from "@fluentui/react-components";
import {
  ShieldCheckmark20Regular,
  LockClosed20Regular,
  Globe20Regular,
  PlugConnected20Regular,
  ArrowRouting20Regular,
  ArrowRight16Regular,
  Info16Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type { NetworkingState, PostureItem, FeatureStatus } from "./types";

function getStatusColor(status: FeatureStatus): string {
  switch (status) {
    case "configured":
      return "#059669";
    case "not-configured":
      return "#9CA3AF";
    case "warning":
      return "#D97706";
    case "error":
      return "#DC2626";
  }
}

function getPostureItems(state: NetworkingState): PostureItem[] {
  const { site, siteConfig, vnetIntegration, frontDoor, dnsConfig } = state;
  const props = site.properties;

  const hasPublicAccess = props.publicNetworkAccess !== "Disabled";
  const hasAccessRestrictions =
    siteConfig.properties.ipSecurityRestrictions.length > 0;
  const hasVnet = !!vnetIntegration;
  const peCount = props.privateEndpointConnections?.length ?? 0;
  const hasFrontDoor = !!frontDoor;
  const hasCustomDns = !!dnsConfig && dnsConfig.dnsServers.length > 0;

  const publicAccessDetail = !hasPublicAccess
    ? "Disabled"
    : hasAccessRestrictions
      ? "Enabled with access restrictions"
      : "Enabled";

  return [
    {
      label: "Public Access",
      status: hasPublicAccess ? "warning" : "configured",
      detail: publicAccessDetail,
    },
    {
      label: "VNet Integration",
      status: hasVnet ? "configured" : "not-configured",
      detail: hasVnet ? "Connected" : "Not configured",
    },
    {
      label: "Private Endpoints",
      status: peCount > 0 ? "configured" : "not-configured",
      detail: peCount > 0 ? `${peCount} endpoint${peCount > 1 ? "s" : ""}` : "None",
    },
    {
      label: "Azure Front Door",
      status: hasFrontDoor ? "configured" : "not-configured",
      detail: hasFrontDoor ? frontDoor.name : "Not configured",
    },
    {
      label: "Outbound DNS",
      status: hasCustomDns ? "configured" : "not-configured",
      detail: hasCustomDns ? "Custom DNS" : "Azure-provided",
    },
    {
      label: "Hybrid Connections",
      status: state.hybridConnections.length > 0 ? "configured" : "not-configured",
      detail: state.hybridConnections.length > 0
        ? `${state.hybridConnections.length} connection${state.hybridConnections.length > 1 ? "s" : ""}`
        : "Not configured",
    },
  ];
}

interface SecurityPostureCardProps {
  state: NetworkingState;
  onNavigate: (section: string) => void;
}

export function SecurityPostureCard({ state, onNavigate }: SecurityPostureCardProps) {
  const styles = useNetworkingStyles();
  const items = getPostureItems(state);

  const configuredCount = items.filter((i) => i.status === "configured").length;
  const warningCount = items.filter((i) => i.status === "warning").length;

  const overallBadge =
    warningCount > 0 ? (
      <Badge appearance="filled" color="warning" size="medium">
        {warningCount} warning{warningCount > 1 ? "s" : ""}
      </Badge>
    ) : configuredCount === items.length ? (
      <Badge appearance="filled" color="success" size="medium">
        All secured
      </Badge>
    ) : (
      <Badge appearance="filled" color="informative" size="medium">
        {configuredCount}/{items.length} configured
      </Badge>
    );

  const sectionMap: Record<string, string> = {
    "Public Access": "access-restrictions",
    "VNet Integration": "vnet-integration",
    "Private Endpoints": "private-endpoints",
    "Azure Front Door": "access-restrictions",
    "Outbound DNS": "vnet-integration",
    "Hybrid Connections": "hybrid-connections",
  };

  return (
    <div className={styles.postureCard}>
      <div className={styles.postureHeader}>
        <div className={styles.postureTitle}>
          <ShieldCheckmark20Regular />
          Security Posture
          <Tooltip content="Overview of your app's network security configuration" relationship="description">
            <Info16Regular style={{ color: "#9CA3AF", cursor: "help" }} />
          </Tooltip>
        </div>
        {overallBadge}
      </div>
      <div className={styles.postureGrid}>
        {items.map((item) => (
          <div
            key={item.label}
            className={styles.postureItem}
            onClick={() => onNavigate(sectionMap[item.label] || "overview")}
          >
            <div className={styles.postureItemLabel}>{item.label}</div>
            <div className={styles.postureItemValue}>
              <div
                className={styles.postureStatusDot}
                style={{ backgroundColor: getStatusColor(item.status) }}
              />
              {item.detail}
              <ArrowRight16Regular style={{ marginLeft: "auto", color: "#D1D5DB", fontSize: "12px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Topology Diagram ─────────────────────────────────

interface TopologyDiagramProps {
  state: NetworkingState;
  onNodeClick: (section: string) => void;
}

/** Small reusable arrow between nodes */
function FlowArrow({
  label,
  long,
  styles,
}: {
  label: string;
  long?: boolean;
  styles: ReturnType<typeof useNetworkingStyles>;
}) {
  return (
    <div className={long ? styles.topologyArrowLong : styles.topologyArrow}>
      <div className={styles.topologyArrowLabel}>{label}</div>
      <div className={long ? styles.topologyArrowLineLong : styles.topologyArrowLine} />
    </div>
  );
}

/** Reusable topology node */
function FlowNode({
  icon,
  label,
  sub,
  bg,
  color,
  large,
  standalone,
  onClick,
  styles,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  bg: string;
  color: string;
  large?: boolean;
  standalone?: boolean;
  onClick?: () => void;
  styles: ReturnType<typeof useNetworkingStyles>;
}) {
  return (
    <div className={standalone ? styles.topologyNodeStandalone : styles.topologyNode}>
      <div
        className={large ? styles.topologyNodeBoxLarge : styles.topologyNodeBox}
        style={{ background: bg, color }}
        onClick={onClick}
      >
        {icon}
      </div>
      <div className={standalone ? styles.topologyNodeLabelAbs : styles.topologyNodeLabel}>{label}</div>
      {sub && <div className={standalone ? styles.topologyNodeSubAbs : styles.topologyNodeSub}>{sub}</div>}
    </div>
  );
}

export function TopologyDiagram({ state, onNodeClick }: TopologyDiagramProps) {
  const styles = useNetworkingStyles();
  const { site, vnetIntegration, subnet, frontDoor, dnsConfig } = state;
  const props = site.properties;
  const peCount = props.privateEndpointConnections?.length ?? 0;
  const hasVnet = !!vnetIntegration;
  const hasFrontDoor = !!frontDoor;
  const hcCount = state.hybridConnections.length;
  const hasCustomDns = !!dnsConfig && dnsConfig.dnsServers.length > 0;
  const ruleCount = state.siteConfig.properties.ipSecurityRestrictions.length;
  const publicAccessEnabled = props.publicNetworkAccess !== "Disabled";

  return (
    <div className={styles.topologyCard}>
      <div className={styles.topologyTitle}>Network Traffic Flow</div>

      <div className={styles.topologyLayout}>
        {/* ═══ Inbound group: Front Door + Inbound section ═══ */}
        <div className={styles.topologyInboundGroup}>
          {hasFrontDoor && (
            <>
              <FlowNode
                icon={<ShieldCheckmark20Regular />}
                label="Front Door"
                sub={frontDoor.name}
                bg="#DBEAFE"
                color="#2563EB"
                standalone
                onClick={() => onNodeClick("access-restrictions")}
                styles={styles}
              />
              <FlowArrow label="via AFD" styles={styles} />
            </>
          )}

          {/* ═══ INBOUND SECTION ═══ */}
          <div className={styles.topologySection}>
            <div className={styles.topologySectionLabel}>Inbound</div>

            <div className={styles.topologyPathRow}>
              <FlowNode
                icon={<ShieldCheckmark20Regular />}
                label="Access Restrictions"
                sub={`${publicAccessEnabled ? "Public" : "Disabled"} · ${ruleCount} rules`}
                bg="#FEF3C7"
                color="#D97706"
                onClick={() => onNodeClick("access-restrictions")}
                styles={styles}
              />
            </div>

            <div className={styles.topologyPathSeparator} />

            <div className={styles.topologyPathRow}>
              <FlowNode
                icon={<LockClosed20Regular />}
                label="Private Endpoints"
                sub={peCount > 0 ? `${peCount} endpoint${peCount > 1 ? "s" : ""}` : "None"}
                bg={peCount > 0 ? "#F3E8FF" : "#F1F3F5"}
                color={peCount > 0 ? "#7C3AED" : "#9CA3AF"}
                onClick={() => onNodeClick("private-endpoints")}
                styles={styles}
              />
            </div>
          </div>
        </div>

        {/* ═══ CENTER: arrows + App ═══ */}
        <div className={styles.topologyCenter}>
          <FlowArrow label="" long styles={styles} />
          <FlowNode
            icon={<span style={{ fontSize: "16px", fontWeight: 700 }}>App</span>}
            label={site.name}
            sub={`${props.sku} · ${site.location}`}
            bg="linear-gradient(135deg, #667EEA, #764BA2)"
            color="#fff"
            large
            standalone
            styles={styles}
          />
          <FlowArrow label="" long styles={styles} />
        </div>

        {/* ═══ OUTBOUND SECTION ═══ */}
        <div className={styles.topologySection}>
          <div className={styles.topologySectionLabel}>Outbound</div>

          <div className={styles.topologyPathRow}>
            <FlowNode
              icon={<PlugConnected20Regular />}
              label="VNet Integration"
              sub={hasVnet ? `${subnet?.name ?? "Connected"} (${subnet?.properties.addressPrefix ?? ""})` : "Not configured"}
              bg={hasVnet ? "#ECFDF5" : "#F1F3F5"}
              color={hasVnet ? "#059669" : "#9CA3AF"}
              onClick={() => onNodeClick("vnet-integration")}
              styles={styles}
            />
          </div>

          <div className={styles.topologyPathSeparator} />

          <div className={styles.topologyPathRow}>
            <FlowNode
              icon={<ArrowRouting20Regular />}
              label="Hybrid Connections"
              sub={hcCount > 0 ? `${hcCount} connection${hcCount > 1 ? "s" : ""} · Azure Relay` : "None"}
              bg={hcCount > 0 ? "#FCE7F3" : "#F1F3F5"}
              color={hcCount > 0 ? "#DB2777" : "#9CA3AF"}
              onClick={() => onNodeClick("hybrid-connections")}
              styles={styles}
            />
          </div>

          <div className={styles.topologyPathSeparator} />

          <div className={styles.topologyPathRow}>
            <FlowNode
              icon={<Globe20Regular />}
              label="DNS Resolution"
              sub={hasCustomDns ? `Custom (${dnsConfig.dnsServers.length} servers)` : "Azure-provided"}
              bg={hasCustomDns ? "#EEF2FF" : "#F1F3F5"}
              color={hasCustomDns ? "#667EEA" : "#9CA3AF"}
              onClick={() => onNodeClick("vnet-integration")}
              styles={styles}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quick Setup Wizards ──────────────────────────────

interface QuickSetupProps {
  onNavigate: (section: string) => void;
}

export function QuickSetup({ onNavigate }: QuickSetupProps) {
  const styles = useNetworkingStyles();

  const wizards = [
    {
      icon: <LockClosed20Regular />,
      bg: "#FEF3C7",
      color: "#D97706",
      title: "Make my app private",
      desc: "Disable public access, configure VNet integration and private endpoints",
      target: "vnet-integration",
    },
    {
      icon: <ShieldCheckmark20Regular />,
      bg: "#EEF2FF",
      color: "#667EEA",
      title: "Restrict to corporate network",
      desc: "Set up IP restrictions and access rules for your organization",
      target: "access-restrictions",
    },
    {
      icon: <PlugConnected20Regular />,
      bg: "#ECFDF5",
      color: "#059669",
      title: "Connect to private database",
      desc: "Configure VNet integration with subnet delegation for private resources",
      target: "vnet-integration",
    },
    {
      icon: <Globe20Regular />,
      bg: "#FCE7F3",
      color: "#DB2777",
      title: "Set up hybrid connectivity",
      desc: "Connect to on-premises resources through Azure Relay hybrid connections",
      target: "hybrid-connections",
    },
  ];

  return (
    <>
      <div className={styles.sectionLabel}>Quick Setup</div>
      <div className={styles.wizardGrid}>
        {wizards.map((w) => (
          <div key={w.title} className={styles.wizardCard} onClick={() => onNavigate(w.target)}>
            <div className={styles.wizardIcon} style={{ backgroundColor: w.bg, color: w.color }}>
              {w.icon}
            </div>
            <div className={styles.wizardTitle}>{w.title}</div>
            <div className={styles.wizardDesc}>{w.desc}</div>
            <Button
              appearance="transparent"
              size="small"
              icon={<ArrowRight16Regular />}
              iconPosition="after"
              style={{ marginTop: "12px", padding: 0, minWidth: 0 }}
            >
              Configure
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
