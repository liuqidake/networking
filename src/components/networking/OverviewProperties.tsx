import { useState } from "react";
import { Badge, Tooltip } from "@fluentui/react-components";
import {
  ChevronDown16Regular,
  ChevronUp16Regular,
  Globe16Regular,
  Info16Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type { NetworkingState } from "./types";

interface NetworkAddressesCardProps {
  state: NetworkingState;
}

const IP_DISPLAY_LIMIT = 3;

function ExpandableIpList({
  ips,
  styles,
}: {
  ips: string[];
  styles: ReturnType<typeof useNetworkingStyles>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? ips : ips.slice(0, IP_DISPLAY_LIMIT);
  const hasMore = ips.length > IP_DISPLAY_LIMIT;

  return (
    <div className={styles.ipList}>
      {visible.map((ip) => (
        <Badge key={ip} appearance="outline" size="small">
          {ip}
        </Badge>
      ))}
      {hasMore && (
        <button
          className={styles.showMoreButton}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Show Less <ChevronUp16Regular />
            </>
          ) : (
            <>
              +{ips.length - IP_DISPLAY_LIMIT} more <ChevronDown16Regular />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function NetworkAddressesCard({ state }: NetworkAddressesCardProps) {
  const styles = useNetworkingStyles();
  const props = state.site.properties;
  const { vnetIntegration, subnet, natGateway } = state;

  // App assigned address: dedicated IP via IP-based SSL
  // "Not supported" only for SKUs that can't do it (Free/Shared);
  // otherwise "Not configured" when IP-based SSL isn't enabled.
  const hasIpBasedSsl = props.hostNameSslStates.some(
    (s) => s.sslState === "IpBasedEnabled"
  );
  const appAssignedAddress = hasIpBasedSsl
    ? props.inboundIpAddress
    : "Not configured";

  // Aggregate inbound IPv4: PE IPs + site inbound VIP
  const inboundIpv4: string[] = [];
  for (const pe of props.privateEndpointConnections) {
    for (const ip of pe.ipAddresses) {
      inboundIpv4.push(ip);
    }
  }
  if (props.inboundIpAddress) {
    inboundIpv4.push(props.inboundIpAddress);
  }

  // Parse outbound IPs
  const outboundIpv4 = props.possibleOutboundIpAddresses
    ? props.possibleOutboundIpAddresses.split(",")
    : [];
  const outboundIpv6 = props.possibleOutboundIpv6Addresses
    ? props.possibleOutboundIpv6Addresses.split(",")
    : [];

  return (
    <div className={styles.sectionCard}>
      <div className={styles.addressesHeader}>
        <div className={styles.postureTitle}>
          <Globe16Regular />
          Network Addresses
          <Tooltip
            content="IP addresses used by your app for inbound and outbound traffic"
            relationship="description"
          >
            <Info16Regular style={{ color: "#9CA3AF", cursor: "help" }} />
          </Tooltip>
        </div>
      </div>

      <div className={styles.addressesGrid}>
        {/* Inbound */}
        <div>
          <div className={styles.sectionLabel}>Inbound</div>
          <div className={styles.propRow}>
            <span className={styles.propLabel}>App assigned address</span>
            <span className={styles.propValue}>{appAssignedAddress}</span>
          </div>
          <div className={styles.addressRow}>
            <span className={styles.addressRowLabel}>IPv4</span>
            {inboundIpv4.length > 0 ? (
              <ExpandableIpList ips={inboundIpv4} styles={styles} />
            ) : (
              <span className={styles.propValue}>N/A</span>
            )}
          </div>
          <div className={styles.addressRow}>
            <span className={styles.addressRowLabel}>IPv6</span>
            <div className={styles.ipList}>
              <Badge appearance="outline" size="small">
                {props.inboundIpv6Address || "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Outbound */}
        <div>
          <div className={styles.sectionLabel}>Outbound</div>
          <div className={styles.addressRow}>
            <span className={styles.addressRowLabel}>IPv4</span>
            {outboundIpv4.length > 0 ? (
              <ExpandableIpList ips={outboundIpv4} styles={styles} />
            ) : (
              <span className={styles.propValue}>N/A</span>
            )}
          </div>
          <div className={styles.addressRow}>
            <span className={styles.addressRowLabel}>IPv6</span>
            {outboundIpv6.length > 0 ? (
              <ExpandableIpList ips={outboundIpv6} styles={styles} />
            ) : (
              <span className={styles.propValue}>N/A</span>
            )}
          </div>
        </div>
      </div>

      {/* Integration subnet configuration */}
      <div className={styles.separator} />
      <div className={styles.sectionLabel}>Integration Subnet Configuration</div>
      <div className={styles.propRow}>
        <span className={styles.propLabel}>NAT gateway</span>
        <span className={styles.propValue}>
          {vnetIntegration && natGateway ? natGateway.name : "N/A"}
        </span>
      </div>
      <div className={styles.propRow}>
        <span className={styles.propLabel}>Network security group</span>
        <span className={styles.propValue}>
          {vnetIntegration && subnet?.properties.networkSecurityGroup
            ? subnet.properties.networkSecurityGroup.id.split("/").pop()
            : "N/A"}
        </span>
      </div>
      <div className={styles.propRow}>
        <span className={styles.propLabel}>User defined route</span>
        <span className={styles.propValue}>
          {vnetIntegration && subnet?.properties.routeTable
            ? subnet.properties.routeTable.id.split("/").pop()
            : "N/A"}
        </span>
      </div>
    </div>
  );
}
