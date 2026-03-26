import { Badge, Button, Tooltip } from "@fluentui/react-components";
import {
  PlugConnected20Regular,
  Copy16Regular,
  Open16Regular,
  Add16Regular,
  Delete16Regular,
  Server20Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type { NetworkingState } from "./types";

interface HybridConnectionsPanelProps {
  state: NetworkingState;
}

export function HybridConnectionsPanel({ state }: HybridConnectionsPanelProps) {
  const styles = useNetworkingStyles();
  const connections = state.hybridConnections;

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <div
            className={styles.sectionIcon}
            style={{
              backgroundColor: connections.length > 0 ? "#FCE7F3" : "#F1F3F5",
              color: connections.length > 0 ? "#DB2777" : "#9CA3AF",
            }}
          >
            <PlugConnected20Regular />
          </div>
          <div>
            <div className={styles.sectionTitle}>Hybrid Connections</div>
            <div className={styles.sectionSubtitle}>
              {connections.length > 0
                ? `${connections.length} hybrid connection${connections.length > 1 ? "s" : ""} configured`
                : "Connect to on-premises resources through Azure Relay"}
            </div>
          </div>
        </div>
        <Button appearance="primary" size="small" icon={<Add16Regular />} shape="circular">
          Add connection
        </Button>
      </div>

      {connections.length > 0 && (
        <>
          <div className={styles.infoBar} style={{ backgroundColor: "#FDF2F8", borderColor: "#FBCFE8", color: "#9D174D" }}>
            <Server20Regular style={{ flexShrink: 0, marginTop: "2px" }} />
            Hybrid Connections use Azure Relay to provide access to on-premises resources without
            requiring firewall changes or a VPN. Install the Hybrid Connection Manager on your on-premises server.
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHead}>Relay Name</th>
                <th className={styles.tableHead}>Endpoint (Host:Port)</th>
                <th className={styles.tableHead}>Service Bus Namespace</th>
                <th className={styles.tableHead} style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((hc) => (
                <tr key={hc.name} className={styles.tableRow}>
                  <td className={styles.tableCell} style={{ fontWeight: 500 }}>
                    {hc.properties.relayName}
                  </td>
                  <td className={styles.tableCell}>
                    <span
                      style={{
                        fontFamily: "'SF Mono', 'Cascadia Code', monospace",
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {hc.properties.hostname}:{hc.properties.port}
                      <Tooltip content="Copy endpoint" relationship="label">
                        <Button
                          icon={<Copy16Regular />}
                          appearance="subtle"
                          size="small"
                          onClick={() =>
                            copyText(`${hc.properties.hostname}:${hc.properties.port}`)
                          }
                        />
                      </Tooltip>
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <Badge appearance="outline" color="informative" size="small">
                      {hc.properties.serviceBusNamespace}
                    </Badge>
                  </td>
                  <td className={styles.tableCell}>
                    <div style={{ display: "flex", gap: "2px" }}>
                      <Tooltip content="View in portal" relationship="label">
                        <Button icon={<Open16Regular />} appearance="subtle" size="small" />
                      </Tooltip>
                      <Tooltip content="Remove" relationship="label">
                        <Button icon={<Delete16Regular />} appearance="subtle" size="small" />
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.separator} />

          <div className={styles.propRow}>
            <span className={styles.propLabel}>Connections used</span>
            <span className={styles.propValue}>
              {connections.length} / 5
              <Badge
                appearance="outline"
                color={connections.length >= 5 ? "danger" : "informative"}
                size="small"
              >
                {connections.length >= 5 ? "Limit reached" : `${5 - connections.length} remaining`}
              </Badge>
            </span>
          </div>
        </>
      )}

      {connections.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <PlugConnected20Regular />
          </div>
          <div className={styles.emptyTitle}>No hybrid connections</div>
          <div className={styles.emptyDesc}>
            Hybrid Connections provide access to on-premises application resources from your app.
            Each connection correlates to a single TCP host:port combination.
          </div>
        </div>
      )}
    </div>
  );
}
