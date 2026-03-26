import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Badge,
  Button,
  Input,
  Dropdown,
  Option,
  Spinner,
  Tooltip,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Radio,
  RadioGroup,
  Link,
  MessageBar,
  MessageBarBody,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import {
  LockClosed20Regular,
  Dismiss16Regular,
  Add16Regular,
  ArrowClockwise16Regular,
  CheckmarkCircle16Regular,
  DismissCircle16Regular,
  Delete16Regular,
  Search16Regular,
  Warning16Regular,
  Info16Regular,
  Filter16Regular,
  ChevronDown16Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type {
  NetworkingState,
  PrivateEndpointConnectionProperties,
  PrivateEndpointConnectionStatus,
} from "./types";

// ── Constants ────────────────────────────────────────────
const MAX_CONNECTIONS = 100;
const PE_NAME_REGEX = /^[^_\W]([\w-.]{0,78}[\w])?$/;
const PE_NAME_MAX_LENGTH = 80;

const RESTRICTED_SUBNETS = [
  "GatewaySubnet",
  "AzureFirewallSubnet",
  "AzureBastionSubnet",
  "AzureFirewallManagementSubnet",
  "RouteServerSubnet",
];

const CONNECTION_STATES: PrivateEndpointConnectionStatus[] = [
  "Pending",
  "Approved",
  "Approving",
  "Rejected",
  "Rejecting",
  "Disconnected",
  "Disconnecting",
];

// Mock data for the add dialog dropdowns
const MOCK_SUBSCRIPTIONS = [
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Visual Studio Enterprise" },
  { id: "f1e2d3c4-b5a6-7890-abcd-ef1234567890", name: "Pay-As-You-Go" },
];
const MOCK_VNETS = [
  { name: "my-vnet", resourceGroup: "my-app-rg", subnets: ["default", "app-subnet", "pe-subnet"] },
  { name: "hub-vnet", resourceGroup: "networking-rg", subnets: ["default", "endpoints-subnet"] },
];

// ── Styles ───────────────────────────────────────────────
const useLocalStyles = makeStyles({
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "12px",
    marginLeft: "-8px",
  },
  toolbarSeparator: {
    width: "1px",
    height: "20px",
    backgroundColor: tokens.colorNeutralStroke2,
    ...shorthands.margin("0", "4px"),
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  searchInput: {
    flex: 1,
    maxWidth: "260px",
  },
  stateFilter: {
    minWidth: "180px",
  },
  quotaText: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginLeft: "auto",
  },
  selectedRow: {
    backgroundColor: "#EEF2FF !important",
  },
  connectionNameLink: {
    color: tokens.colorBrandForeground1,
    fontWeight: 500,
    cursor: "pointer",
    "&:hover": {
      textDecorationLine: "underline",
    },
  },
  statusCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dialogField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "16px",
  },
  dialogFieldLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  dialogFieldRequired: {
    color: "#DC2626",
    marginLeft: "2px",
  },
  dialogFieldHint: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
  dialogFieldError: {
    fontSize: "12px",
    color: "#DC2626",
  },
  dialogSectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "12px",
    marginTop: "8px",
  },
  noResults: {
    ...shorthands.padding("24px"),
    textAlign: "center",
    fontSize: "13px",
    color: tokens.colorNeutralForeground3,
  },
  scenarioSelector: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  scenarioLabel: {
    fontSize: "12px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    whiteSpace: "nowrap",
  },
});

// ── Helpers ──────────────────────────────────────────────

function getConnectionName(pe: PrivateEndpointConnectionProperties): string {
  // ARM resource ID: .../privateEndpointConnections/{connectionName}
  // The connection name is typically the PE name + a random suffix
  // We derive a friendly name from the private endpoint resource ID
  const peId = pe.privateEndpoint.id;
  return peId.split("/").pop() ?? "unknown";
}

function getPrivateEndpointName(pe: PrivateEndpointConnectionProperties): string {
  return pe.privateEndpoint.id.split("/").pop() ?? "unknown";
}

function canApprove(status: PrivateEndpointConnectionStatus): boolean {
  return status === "Pending";
}

function canReject(status: PrivateEndpointConnectionStatus): boolean {
  return status === "Pending";
}

function canRemove(status: PrivateEndpointConnectionStatus): boolean {
  return status === "Pending" || status === "Approved" || status === "Rejected";
}

function isTransitioning(status: PrivateEndpointConnectionStatus): boolean {
  return status === "Approving" || status === "Rejecting" || status === "Disconnecting";
}

function hasIpBasedSsl(state: NetworkingState): boolean {
  return state.site.properties.hostNameSslStates.some(
    (s) => s.sslState === "IpBasedEnabled"
  );
}

function validatePeName(
  name: string,
  existingNames: string[]
): string | null {
  if (!name) return "Name is required.";
  if (name.length > PE_NAME_MAX_LENGTH)
    return `Name must be ${PE_NAME_MAX_LENGTH} characters or fewer.`;
  if (!PE_NAME_REGEX.test(name))
    return "Name must start with a letter or number and contain only letters, numbers, hyphens, underscores, or periods.";
  if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase()))
    return "A private endpoint with this name already exists.";
  return null;
}

function isProvisioningFailed(pe: PrivateEndpointConnectionProperties): boolean {
  return pe.provisioningState === "Failed";
}

// ── Component ────────────────────────────────────────────

interface PrivateEndpointsPanelProps {
  state: NetworkingState;
}

type Scenario = "regular" | "public-access" | "no-endpoints";

export function PrivateEndpointsPanel({ state }: PrivateEndpointsPanelProps) {
  const styles = useNetworkingStyles();
  const localStyles = useLocalStyles();

  // ── Scenario selector ───────────────────────────────
  const [scenario, setScenario] = useState<Scenario>("regular");

  // ── State ──────────────────────────────────────────
  const [connections, setConnections] = useState<PrivateEndpointConnectionProperties[]>(
    () => [...state.site.properties.privateEndpointConnections]
  );

  // Reset connections when scenario changes
  useEffect(() => {
    if (scenario === "no-endpoints") {
      setConnections([]);
    } else {
      setConnections([...state.site.properties.privateEndpointConnections]);
    }
    setSelectedIds(new Set());
    setSearchQuery("");
    setStateFilter([]);
  }, [scenario, state]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSubscription, setAddSubscription] = useState(MOCK_SUBSCRIPTIONS[0].id);
  const [addVnet, setAddVnet] = useState("");
  const [addSubnet, setAddSubnet] = useState("");
  const [addDnsIntegration, setAddDnsIntegration] = useState(true);
  const [addNameTouched, setAddNameTouched] = useState(false);
  const [addCreating, setAddCreating] = useState(false);

  // Action state
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const createTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (createTimerRef.current) clearTimeout(createTimerRef.current);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, []);

  // ── Derived data ───────────────────────────────────
  const existingNames = useMemo(
    () => connections.map((c) => getPrivateEndpointName(c)),
    [connections]
  );

  const query = searchQuery.toLowerCase().trim();

  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      const name = getConnectionName(c).toLowerCase();
      const peName = getPrivateEndpointName(c).toLowerCase();
      const matchesSearch =
        !query || name.includes(query) || peName.includes(query);
      const matchesState =
        stateFilter.length === 0 ||
        stateFilter.includes(c.privateLinkServiceConnectionState.status);
      return matchesSearch && matchesState;
    });
  }, [connections, query, stateFilter]);

  const isAtQuota = connections.length >= MAX_CONNECTIONS;

  const ipSslConflict = hasIpBasedSsl(state);
  const publicNetworkAccessEnabled = scenario === "regular"
    ? false // "regular" = public access disabled (secure state, no warning)
    : scenario === "public-access"
    ? true  // public access enabled — show warning
    : false; // no endpoints — no warning

  // ── Selected connection helpers ────────────────────
  const selectedConnections = useMemo(
    () => filteredConnections.filter((c) => selectedIds.has(c.privateEndpoint.id)),
    [filteredConnections, selectedIds]
  );

  const hasSelection = selectedConnections.length > 0;

  // Approve enabled only if ALL selected are Pending (can approve)
  const canBulkApprove =
    hasSelection &&
    !actionInProgress &&
    selectedConnections.every((c) => canApprove(c.privateLinkServiceConnectionState.status));

  // Reject enabled only if ALL selected are Pending (can reject)
  const canBulkReject =
    hasSelection &&
    !actionInProgress &&
    selectedConnections.every((c) => canReject(c.privateLinkServiceConnectionState.status));

  // Remove enabled if ALL selected can be removed
  const canBulkRemove =
    hasSelection &&
    !actionInProgress &&
    selectedConnections.every(
      (c) => canRemove(c.privateLinkServiceConnectionState.status) && !isTransitioning(c.privateLinkServiceConnectionState.status)
    );

  // Select-all checkbox state
  const allSelected =
    filteredConnections.length > 0 &&
    filteredConnections.every((c) => selectedIds.has(c.privateEndpoint.id));
  const someSelected =
    filteredConnections.some((c) => selectedIds.has(c.privateEndpoint.id)) && !allSelected;

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredConnections.map((c) => c.privateEndpoint.id)));
    }
  }, [allSelected, filteredConnections]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Handlers ───────────────────────────────────────

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setConnections([...state.site.properties.privateEndpointConnections]);
      setIsRefreshing(false);
      setSelectedIds(new Set());
    }, 800);
  }, [state]);

  const handleApprove = useCallback(() => {
    if (!canBulkApprove) return;
    const ids = new Set(selectedConnections.map((c) => c.privateEndpoint.id));
    setActionInProgress(`Approving ${ids.size} connection${ids.size > 1 ? "s" : ""}...`);

    setConnections((prev) =>
      prev.map((c) =>
        ids.has(c.privateEndpoint.id)
          ? {
              ...c,
              privateLinkServiceConnectionState: {
                ...c.privateLinkServiceConnectionState,
                status: "Approving" as const,
              },
            }
          : c
      )
    );

    actionTimerRef.current = setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) =>
          ids.has(c.privateEndpoint.id) &&
          c.privateLinkServiceConnectionState.status === "Approving"
            ? {
                ...c,
                privateLinkServiceConnectionState: {
                  status: "Approved" as const,
                  description: "Approved by user",
                },
              }
            : c
        )
      );
      setActionInProgress(null);
    }, 1500);
  }, [canBulkApprove, selectedConnections]);

  const handleReject = useCallback(() => {
    if (!canBulkReject) return;
    const ids = new Set(selectedConnections.map((c) => c.privateEndpoint.id));
    setActionInProgress(`Rejecting ${ids.size} connection${ids.size > 1 ? "s" : ""}...`);

    setConnections((prev) =>
      prev.map((c) =>
        ids.has(c.privateEndpoint.id)
          ? {
              ...c,
              privateLinkServiceConnectionState: {
                ...c.privateLinkServiceConnectionState,
                status: "Rejecting" as const,
              },
            }
          : c
      )
    );

    actionTimerRef.current = setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) =>
          ids.has(c.privateEndpoint.id) &&
          c.privateLinkServiceConnectionState.status === "Rejecting"
            ? {
                ...c,
                privateLinkServiceConnectionState: {
                  status: "Rejected" as const,
                  description: "Rejected by user",
                },
              }
            : c
        )
      );
      setActionInProgress(null);
    }, 1500);
  }, [canBulkReject, selectedConnections]);

  const handleRemove = useCallback(() => {
    if (!canBulkRemove) return;
    const ids = new Set(selectedConnections.map((c) => c.privateEndpoint.id));
    setActionInProgress(`Removing ${ids.size} connection${ids.size > 1 ? "s" : ""}...`);

    setConnections((prev) =>
      prev.map((c) =>
        ids.has(c.privateEndpoint.id)
          ? {
              ...c,
              privateLinkServiceConnectionState: {
                ...c.privateLinkServiceConnectionState,
                status: "Disconnecting" as const,
              },
            }
          : c
      )
    );

    actionTimerRef.current = setTimeout(() => {
      setConnections((prev) =>
        prev.filter((c) => !ids.has(c.privateEndpoint.id))
      );
      setSelectedIds(new Set());
      setActionInProgress(null);
    }, 1500);
  }, [canBulkRemove, selectedConnections]);

  // ── Add dialog ─────────────────────────────────────

  const openAddDialog = useCallback(() => {
    setAddName("");
    setAddSubscription(MOCK_SUBSCRIPTIONS[0].id);
    setAddVnet("");
    setAddSubnet("");
    setAddDnsIntegration(true);
    setAddNameTouched(false);
    setAddCreating(false);
    setAddDialogOpen(true);
  }, []);

  const selectedVnetObj = MOCK_VNETS.find((v) => v.name === addVnet);
  const availableSubnets = selectedVnetObj
    ? selectedVnetObj.subnets.filter((s) => !RESTRICTED_SUBNETS.includes(s))
    : [];

  const addNameError = addNameTouched ? validatePeName(addName, existingNames) : null;

  const addFormValid =
    addName.length > 0 &&
    !validatePeName(addName, existingNames) &&
    addVnet.length > 0 &&
    addSubnet.length > 0;

  const handleCreate = useCallback(() => {
    if (!addFormValid) return;
    setAddCreating(true);

    createTimerRef.current = setTimeout(() => {
      const subId = addSubscription;
      const newConnection: PrivateEndpointConnectionProperties = {
        provisioningState: "Succeeded",
        privateEndpoint: {
          id: `/subscriptions/${subId}/resourceGroups/${selectedVnetObj?.resourceGroup ?? "my-app-rg"}/providers/Microsoft.Network/privateEndpoints/${addName}`,
        },
        privateLinkServiceConnectionState: {
          status: "Approved",
          description: "Auto-approved",
        },
        ipAddresses: [`10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`],
      };
      setConnections((prev) => [...prev, newConnection]);
      setAddDialogOpen(false);
      setAddCreating(false);
    }, 2000);
  }, [addFormValid, addName, addSubscription, selectedVnetObj]);

  // ── Status badge ───────────────────────────────────

  const getStatusBadge = (status: PrivateEndpointConnectionStatus) => {
    switch (status) {
      case "Approved":
        return (
          <Badge appearance="tint" color="success">
            Approved
          </Badge>
        );
      case "Pending":
        return (
          <Badge appearance="tint" color="warning">
            Pending
          </Badge>
        );
      case "Approving":
        return (
          <Badge appearance="tint" color="warning">
            Approving…
          </Badge>
        );
      case "Rejected":
        return (
          <Badge appearance="tint" color="danger">
            Rejected
          </Badge>
        );
      case "Rejecting":
        return (
          <Badge appearance="tint" color="danger">
            Rejecting…
          </Badge>
        );
      case "Disconnected":
        return (
          <Badge appearance="tint" color="informative">
            Disconnected
          </Badge>
        );
      case "Disconnecting":
        return (
          <Badge appearance="tint" color="informative">
            Disconnecting…
          </Badge>
        );
      default:
        return (
          <Badge appearance="tint" color="informative">
            {status}
          </Badge>
        );
    }
  };

  // ── Render ─────────────────────────────────────────

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
        <div className={localStyles.scenarioSelector}>
          <span className={localStyles.scenarioLabel}>Scenarios</span>
          <Dropdown
            size="small"
            value={
              scenario === "regular"
                ? "Regular"
                : scenario === "public-access"
                ? "Public network access enabled"
                : "No private endpoints"
            }
            selectedOptions={[scenario]}
            onOptionSelect={(_, data) => {
              if (data.optionValue) setScenario(data.optionValue as Scenario);
            }}
            style={{ minWidth: "220px" }}
          >
            <Option value="regular">Regular</Option>
            <Option value="public-access">Public network access enabled</Option>
            <Option value="no-endpoints">No private endpoints</Option>
          </Dropdown>
        </div>
      </div>

      {/* Status warnings */}
      {ipSslConflict && (
        <div className={styles.warningBar}>
          <Warning16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            IP-based SSL is enabled for this app. Private endpoints cannot be
            created while IP-based SSL bindings exist. Remove all IP-based SSL
            bindings before adding private endpoints.
          </span>
        </div>
      )}

      {publicNetworkAccessEnabled && (
        <div className={styles.warningBar}>
          <Warning16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            Access restriction settings allow access from public networks. The
            security provided by private endpoints will not be satisfied.
          </span>
        </div>
      )}

      {isAtQuota && (
        <div className={styles.warningBar}>
          <Warning16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            This app has reached the maximum of {MAX_CONNECTIONS} private
            endpoint connections. Remove existing connections before adding new
            ones.
          </span>
        </div>
      )}

      {actionInProgress && (
        <MessageBar intent="info" style={{ marginBottom: "12px" }}>
          <MessageBarBody style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Spinner size="tiny" />
            {actionInProgress}
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Command bar */}
      <div className={localStyles.toolbar}>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Tooltip content={ipSslConflict ? "Remove IP-based SSL bindings first" : isAtQuota ? `Maximum ${MAX_CONNECTIONS} connections reached` : "Add private endpoint"} relationship="label">
              <Button
                icon={<Add16Regular />}
                appearance="subtle"
                size="small"
                disabled={ipSslConflict || isAtQuota || !!actionInProgress}
              >
                Add
                <ChevronDown16Regular style={{ marginLeft: "2px" }} />
              </Button>
            </Tooltip>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem onClick={openAddDialog}>
                Express
              </MenuItem>
              <MenuItem disabled>
                Advanced
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>

        <div className={localStyles.toolbarSeparator} />

        <Tooltip content="Refresh" relationship="label">
          <Button
            icon={<ArrowClockwise16Regular />}
            appearance="subtle"
            size="small"
            disabled={isRefreshing}
            onClick={handleRefresh}
          />
        </Tooltip>

        <div className={localStyles.toolbarSeparator} />

        <Tooltip
          content={
            !hasSelection
              ? "Select one or more connections"
              : !canBulkApprove
              ? "All selected connections must be in Pending state"
              : "Approve selected connections"
          }
          relationship="label"
        >
          <Button
            icon={<CheckmarkCircle16Regular />}
            appearance="subtle"
            size="small"
            disabled={!canBulkApprove}
            onClick={handleApprove}
          >
            Approve
          </Button>
        </Tooltip>

        <Tooltip
          content={
            !hasSelection
              ? "Select one or more connections"
              : !canBulkReject
              ? "All selected connections must be in Pending state"
              : "Reject selected connections"
          }
          relationship="label"
        >
          <Button
            icon={<DismissCircle16Regular />}
            appearance="subtle"
            size="small"
            disabled={!canBulkReject}
            onClick={handleReject}
          >
            Reject
          </Button>
        </Tooltip>

        <Tooltip
          content={
            !hasSelection
              ? "Select one or more connections"
              : !canBulkRemove
              ? "Selected connections cannot be removed in their current state"
              : "Remove selected connections"
          }
          relationship="label"
        >
          <Button
            icon={<Delete16Regular />}
            appearance="subtle"
            size="small"
            disabled={!canBulkRemove}
            onClick={handleRemove}
          >
            Remove
          </Button>
        </Tooltip>

        <span className={localStyles.quotaText}>
          {connections.length} / {MAX_CONNECTIONS} connections
        </span>
      </div>

      {/* Search + filter row */}
      <div className={localStyles.filterRow}>
        <Input
          className={localStyles.searchInput}
          contentBefore={<Search16Regular />}
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(_, data) => setSearchQuery(data.value)}
          size="small"
        />
        <Dropdown
          className={localStyles.stateFilter}
          placeholder="Filter by state"
          size="small"
          multiselect
          selectedOptions={stateFilter}
          onOptionSelect={(_, data) => {
            setStateFilter(data.selectedOptions);
          }}
        >
          {CONNECTION_STATES.map((s) => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Dropdown>
        {stateFilter.length > 0 && (
          <Button
            icon={<Dismiss16Regular />}
            appearance="subtle"
            size="small"
            onClick={() => setStateFilter([])}
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Data table */}
      {filteredConnections.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHead} style={{ width: "30px" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                  style={{ margin: 0, cursor: "pointer" }}
                />
              </th>
              <th className={styles.tableHead}>Connection Name</th>
              <th className={styles.tableHead}>Connection State</th>
              <th className={styles.tableHead}>Action</th>
              <th className={styles.tableHead}>Private Endpoint</th>
              <th className={styles.tableHead}>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map((pe) => {
              const connectionName = getConnectionName(pe);
              const peName = getPrivateEndpointName(pe);
              const peId = pe.privateEndpoint.id;
              const isSelected = selectedIds.has(peId);
              const status = pe.privateLinkServiceConnectionState.status;
              return (
                <tr
                  key={peId}
                  className={`${styles.tableRow} ${isSelected ? localStyles.selectedRow : ""}`}
                  onClick={() => toggleSelect(peId)}
                  style={{ cursor: "pointer" }}
                >
                  <td className={styles.tableCell}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(peId)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ margin: 0, cursor: "pointer" }}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <Link
                      style={{ fontWeight: 500 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: open PE connection blade
                      }}
                    >
                      {connectionName}
                    </Link>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={localStyles.statusCell}>
                      {isProvisioningFailed(pe) ? (
                        <Tooltip content={pe.privateLinkServiceConnectionState.description} relationship="label">
                          <Badge appearance="tint" color="danger">
                            Failed
                          </Badge>
                        </Tooltip>
                      ) : (
                        <>
                          {getStatusBadge(status)}
                          {isTransitioning(status) && <Spinner size="tiny" />}
                        </>
                      )}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    {status === "Pending" ? (
                      <span style={{ fontSize: "12px", color: tokens.colorNeutralForeground3 }}>
                        Awaiting approval
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    {peName}
                  </td>
                  <td className={styles.tableCell} style={{ color: tokens.colorNeutralForeground3 }}>
                    {pe.privateLinkServiceConnectionState.description || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : connections.length > 0 ? (
        <div className={localStyles.noResults}>
          <Filter16Regular style={{ marginBottom: "8px", fontSize: "20px" }} />
          <div>No connections match the current filters.</div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <LockClosed20Regular />
          </div>
          <div className={styles.emptyTitle}>No private endpoints</div>
          <div className={styles.emptyDesc}>
            Create a private endpoint to allow resources in your virtual network
            to access your app through a private IP address.
          </div>
          <Button
            appearance="primary"
            size="small"
            icon={<Add16Regular />}
            disabled={ipSslConflict}
            onClick={openAddDialog}
          >
            Add private endpoint
          </Button>
        </div>
      )}

      {/* ── Add Private Endpoint Dialog ─────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={(_, data) => setAddDialogOpen(data.open)}>
        <DialogSurface style={{ maxWidth: "520px" }}>
          <DialogTitle>Add Private Endpoint (Express)</DialogTitle>
          <DialogBody>
            <DialogContent>
              <div className={styles.infoBar} style={{ marginBottom: "16px" }}>
                <Info16Regular style={{ flexShrink: 0, marginTop: "2px" }} />
                This will create a private endpoint in your virtual network and
                connect it to this app. Traffic will flow through the private
                endpoint over the virtual network.
              </div>

              {/* Name */}
              <div className={localStyles.dialogField}>
                <label className={localStyles.dialogFieldLabel}>
                  Name<span className={localStyles.dialogFieldRequired}>*</span>
                </label>
                <Input
                  value={addName}
                  onChange={(_, data) => {
                    setAddName(data.value);
                    if (!addNameTouched) setAddNameTouched(true);
                  }}
                  onBlur={() => setAddNameTouched(true)}
                  placeholder="Enter a name for the private endpoint"
                  size="small"
                  maxLength={PE_NAME_MAX_LENGTH}
                />
                {addNameError && (
                  <span className={localStyles.dialogFieldError}>{addNameError}</span>
                )}
                <span className={localStyles.dialogFieldHint}>
                  1-{PE_NAME_MAX_LENGTH} characters. Letters, numbers, hyphens, underscores,
                  or periods.
                </span>
              </div>

              {/* Subscription */}
              <div className={localStyles.dialogField}>
                <label className={localStyles.dialogFieldLabel}>
                  Subscription<span className={localStyles.dialogFieldRequired}>*</span>
                </label>
                <Dropdown
                  size="small"
                  value={MOCK_SUBSCRIPTIONS.find((s) => s.id === addSubscription)?.name ?? ""}
                  selectedOptions={[addSubscription]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) setAddSubscription(data.optionValue);
                  }}
                >
                  {MOCK_SUBSCRIPTIONS.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Dropdown>
              </div>

              <div className={localStyles.dialogSectionLabel}>Networking</div>

              {/* Virtual Network */}
              <div className={localStyles.dialogField}>
                <label className={localStyles.dialogFieldLabel}>
                  Virtual Network<span className={localStyles.dialogFieldRequired}>*</span>
                </label>
                <Dropdown
                  size="small"
                  placeholder="Select a virtual network"
                  value={addVnet}
                  selectedOptions={addVnet ? [addVnet] : []}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      setAddVnet(data.optionValue);
                      setAddSubnet("");
                    }
                  }}
                >
                  {MOCK_VNETS.map((v) => (
                    <Option key={v.name} value={v.name} text={`${v.name} (${v.resourceGroup})`}>
                      {v.name} ({v.resourceGroup})
                    </Option>
                  ))}
                </Dropdown>
              </div>

              {/* Subnet */}
              <div className={localStyles.dialogField}>
                <label className={localStyles.dialogFieldLabel}>
                  Subnet<span className={localStyles.dialogFieldRequired}>*</span>
                </label>
                <Dropdown
                  size="small"
                  placeholder={addVnet ? "Select a subnet" : "Select a virtual network first"}
                  disabled={!addVnet}
                  value={addSubnet}
                  selectedOptions={addSubnet ? [addSubnet] : []}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) setAddSubnet(data.optionValue);
                  }}
                >
                  {availableSubnets.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Dropdown>
                {addVnet && availableSubnets.length === 0 && (
                  <span className={localStyles.dialogFieldError}>
                    No eligible subnets in this virtual network.
                  </span>
                )}
              </div>

              <div className={localStyles.dialogSectionLabel}>Private DNS Integration</div>

              {/* DNS Integration */}
              <div className={localStyles.dialogField}>
                <label className={localStyles.dialogFieldLabel}>
                  Integrate with private DNS zone
                </label>
                <RadioGroup
                  value={addDnsIntegration ? "yes" : "no"}
                  onChange={(_, data) =>
                    setAddDnsIntegration(data.value === "yes")
                  }
                  layout="horizontal"
                >
                  <Radio value="yes" label="Yes" />
                  <Radio value="no" label="No" />
                </RadioGroup>
                <span className={localStyles.dialogFieldHint}>
                  {addDnsIntegration
                    ? "A private DNS zone (privatelink.azurewebsites.net) will be created and linked to the virtual network."
                    : "You will need to manually configure DNS to resolve the app's hostname to the private endpoint IP address."}
                </span>
              </div>
            </DialogContent>
          </DialogBody>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={() => setAddDialogOpen(false)}
              disabled={addCreating}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!addFormValid || addCreating}
              onClick={handleCreate}
              icon={addCreating ? <Spinner size="tiny" /> : undefined}
            >
              {addCreating ? "Creating..." : "OK"}
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
