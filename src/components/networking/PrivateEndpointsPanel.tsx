import { Badge, Button, Tooltip } from "@fluentui/react-components";
import {
  LockClosed20Regular,
  Checkmark16Filled,
  Dismiss16Regular,
  Clock16Regular,
  Copy16Regular,
  Open16Regular,
  Add16Regular,
  Info16Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type { NetworkingState } from "./types";

interface PrivateEndpointsPanelProps {
  state: NetworkingState;
}

export function PrivateEndpointsPanel({ state }: PrivateEndpointsPanelProps) {
  const styles = useNetworkingStyles();
  const connections = state.site.properties.privateEndpointConnections;

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge appearance="filled" color="success" size="small" icon={<Checkmark16Filled />}>
            Approved
          </Badge>
        );
      case "Pending":
        return (
          <Badge appearance="filled" color="warning" size="small" icon={<Clock16Regular />}>
            Pending
          </Badge>
        );
      case "Rejected":
        return (
          <Badge appearance="filled" color="danger" size="small" icon={<Dismiss16Regular />}>
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge appearance="outline" color="informative" size="small">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <div
            className={styles.sectionIcon}
            style={{
              backgroundColor: connections.length > 0 ? "#F3E8FF" : "#F1F3F5",
              color: connections.length > 0 ? "#7C3AED" : "#9CA3AF",
            }}
          >
            <LockClosed20Regular />
          </div>
          <div>
            <div className={styles.sectionTitle}>Private Endpoints</div>
            <div className={styles.sectionSubtitle}>
              {connections.length > 0
                ? `${connections.length} private endpoint connection${connections.length > 1 ? "s" : ""}`
                : "No private endpoints configured"}
            </div>
          </div>
        </div>
        <Button appearance="primary" size="small" icon={<Add16Regular />} shape="circular">
          Add private endpoint
        </Button>
      </div>

      {connections.length > 0 && (
        <>
          <div className={styles.infoBar}>
            <Info16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
            Private endpoints allow resources in your virtual network to connect to your app over a private IP address,
            eliminating exposure to the public internet.
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHead}>Name</th>
                <th className={styles.tableHead}>Private IP</th>
                <th className={styles.tableHead}>Connection Status</th>
                <th className={styles.tableHead}>Provisioning</th>
                <th className={styles.tableHead} style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((pe, index) => {
                const name = pe.privateEndpoint.id.split("/").pop() ?? "unknown";
                return (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.tableCell} style={{ fontWeight: 500 }}>
                      {name}
                    </td>
                    <td className={styles.tableCell}>
                      <span
                        style={{
                          fontFamily: "'SF Mono', 'Cascadia Code', monospace",
                          fontSize: "12px",
                        }}
                      >
                        {pe.ipAddresses?.[0] ?? "—"}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(pe.privateLinkServiceConnectionState.status)}
                      {pe.privateLinkServiceConnectionState.description && (
                        <span
                          style={{ marginLeft: "8px", fontSize: "12px", color: "#6B7280" }}
                        >
                          {pe.privateLinkServiceConnectionState.description}
                        </span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <Badge
                        appearance="outline"
                        color={pe.provisioningState === "Succeeded" ? "success" : "warning"}
                        size="small"
                      >
                        {pe.provisioningState}
                      </Badge>
                    </td>
                    <td className={styles.tableCell}>
                      <div style={{ display: "flex", gap: "2px" }}>
                        <Tooltip content="Copy resource ID" relationship="label">
                          <Button
                            icon={<Copy16Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => copyText(pe.privateEndpoint.id)}
                          />
                        </Tooltip>
                        <Tooltip content="Open in portal" relationship="label">
                          <Button
                            icon={<Open16Regular />}
                            appearance="subtle"
                            size="small"
                          />
                        </Tooltip>
                        {pe.privateLinkServiceConnectionState.status === "Pending" && (
                          <Tooltip content="Approve connection" relationship="label">
                            <Button
                              icon={<Checkmark16Filled />}
                              appearance="subtle"
                              size="small"
                              style={{ color: "#059669" }}
                            />
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {connections.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <LockClosed20Regular />
          </div>
          <div className={styles.emptyTitle}>No private endpoints</div>
          <div className={styles.emptyDesc}>
            Create a private endpoint to allow resources in your virtual network to access your app through a
            private IP address.
          </div>
        </div>
      )}
    </div>
  );
}
