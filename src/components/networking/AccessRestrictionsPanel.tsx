import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Switch,
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
  TabList,
  Tab,
  Radio,
  RadioGroup,
  Link,
  MessageBar,
  MessageBarBody,
  ProgressBar,
  makeStyles,
  tokens,
  shorthands,
  type SelectTabData,
} from "@fluentui/react-components";
import {
  Add16Regular,
  Delete16Regular,
  Edit16Regular,
  Info16Regular,
  Save16Regular,
  Dismiss16Regular,
  ChevronDown16Regular,
  ChevronUp16Regular,
  Search16Regular,
  ShieldCheckmark20Regular,
  ShieldDismiss20Regular,
  Globe20Regular,
  Warning16Regular,
  ArrowUndo16Regular,
} from "@fluentui/react-icons";
import { useNetworkingStyles } from "./NetworkingHub.styles";
import type { NetworkingState, IpSecurityRestriction } from "./types";

// ── Constants ────────────────────────────────────────
const RULE_LIMIT = 512;
const RULE_LIMIT_WARNING_THRESHOLD = 450;

const SERVICE_TAGS = [
  "AzureFrontDoor.Backend",
  "AzureCloud",
  "AzureTrafficManager",
  "AzureLoadBalancer",
  "AzureDevOps",
  "AzureContainerRegistry",
  "AzureKeyVault",
  "AzureActiveDirectory",
  "AzureMonitor",
  "AzureCosmosDB",
  "AzureEventHub",
  "AzureServiceBus",
  "GatewayManager",
  "LogicApps",
  "AppService",
  "AppServiceManagement",
  "ApiManagement",
  "Sql",
  "Storage",
  "ActionGroup",
  "BatchNodeManagement",
];

const HTTP_HEADER_NAMES = [
  "X-Forwarded-For",
  "X-Forwarded-Host",
  "X-Azure-FDID",
  "X-FD-HealthProbe",
] as const;

type SourceType = "ipv4" | "ipv6" | "serviceTag" | "virtualNetwork";
type ActionFilter = "all" | "Allow" | "Deny";

interface RuleFormState {
  name: string;
  description: string;
  action: "Allow" | "Deny";
  priority: string;
  sourceType: SourceType;
  ipAddress: string;
  serviceTag: string;
  subscription: string;
  virtualNetwork: string;
  subnet: string;
  headers: Record<string, string>;
  showHeaders: boolean;
}

const EMPTY_FORM: RuleFormState = {
  name: "",
  description: "",
  action: "Allow",
  priority: "",
  sourceType: "ipv4",
  ipAddress: "",
  serviceTag: "AzureFrontDoor.Backend",
  subscription: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  virtualNetwork: "my-vnet",
  subnet: "default",
  headers: {
    "X-Forwarded-For": "",
    "X-Forwarded-Host": "",
    "X-Azure-FDID": "",
    "X-FD-HealthProbe": "",
  },
  showHeaders: false,
};

type SiteTab = "main" | "scm";

// ── Local styles ─────────────────────────────────────
const useLocalStyles = makeStyles({
  postureSummary: {
    display: "flex",
    alignItems: "stretch",
    gap: "0",
    backgroundColor: "#fff",
    ...shorthands.borderRadius("14px"),
    ...shorthands.borderWidth("1px"),
    ...shorthands.borderStyle("solid"),
    ...shorthands.borderColor("rgba(0,0,0,0.06)"),
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    marginBottom: "16px",
    overflow: "hidden",
  },
  postureCell: {
    flex: 1,
    ...shorthands.padding("16px", "20px"),
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    ...shorthands.borderRight("1px", "solid", "rgba(0,0,0,0.06)"),
    "&:last-child": {
      borderRightColor: "transparent",
    },
  },
  postureCellLabel: {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
  },
  postureCellValue: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  filterPill: {
    cursor: "pointer",
    transitionProperty: "all",
    transitionDuration: "0.15s",
  },
  ruleLimit: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    ...shorthands.padding("8px", "0"),
  },
  ruleLimitText: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
  },
  trafficFlowBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ...shorthands.padding("8px", "12px"),
    ...shorthands.borderRadius("8px"),
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "8px",
    marginBottom: "4px",
  },
  undoRowCell: {
    position: "relative",
    overflow: "hidden",
  },
  undoRowInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ...shorthands.padding("8px", "12px"),
    fontSize: "13px",
    color: "#92400E",
    backgroundColor: "#FFFBEB",
  },
  undoCountdown: {
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "2px",
    backgroundColor: "#D97706",
    animationName: {
      from: { width: "100%" },
      to: { width: "0%" },
    },
    animationDuration: "5s",
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  },
  deleteConfirmInline: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
});

// ── Helpers ──────────────────────────────────────────
function getSourceType(rule: IpSecurityRestriction): SourceType {
  if (rule._sourceType) return rule._sourceType;
  if (rule.vnetSubnetResourceId) return "virtualNetwork";
  if (rule.tag === "ServiceTag") return "serviceTag";
  if (rule.ipAddress.includes(":")) return "ipv6";
  return "ipv4";
}

function getSourceLabel(type: SourceType): string {
  switch (type) {
    case "ipv4": return "IPv4";
    case "ipv6": return "IPv6";
    case "serviceTag": return "Service Tag";
    case "virtualNetwork": return "Virtual Network";
  }
}

function getSourceDisplay(rule: IpSecurityRestriction): string {
  if (rule.vnetSubnetResourceId) {
    const parts = rule.vnetSubnetResourceId.split("/");
    const subnetName = parts[parts.length - 1];
    const vnetName = parts[parts.length - 3];
    return `${vnetName}/${subnetName}`;
  }
  return rule.ipAddress;
}

function hasSlashZero(rule: IpSecurityRestriction): boolean {
  return rule.ipAddress?.endsWith("/0") || false;
}

function areRulesEqual(a: IpSecurityRestriction[], b: IpSecurityRestriction[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((rule, i) =>
    rule.name === b[i].name &&
    rule.ipAddress === b[i].ipAddress &&
    rule.action === b[i].action &&
    rule.priority === b[i].priority &&
    rule.tag === b[i].tag &&
    rule.vnetSubnetResourceId === b[i].vnetSubnetResourceId
  );
}

// ── Main component ───────────────────────────────────

interface AccessRestrictionsPanelProps {
  state: NetworkingState;
}

export function AccessRestrictionsPanel({ state }: AccessRestrictionsPanelProps) {
  const styles = useNetworkingStyles();
  const local = useLocalStyles();
  const configProps = state.siteConfig.properties;
  const siteProps = state.site.properties;

  // Public network access: 3-way radio
  const initialPublicAccess = siteProps.publicNetworkAccess === "Disabled"
    ? "disabled"
    : configProps.ipSecurityRestrictions.length > 0
      ? "select"
      : "all";
  const [publicAccess, setPublicAccess] = useState<"all" | "select" | "disabled">(initialPublicAccess);

  // Tab: Main site vs Advanced tool site
  const [activeTab, setActiveTab] = useState<SiteTab>("main");

  // Main site rules
  const [mainRules, setMainRules] = useState<IpSecurityRestriction[]>(configProps.ipSecurityRestrictions);
  const [mainDefaultAction, setMainDefaultAction] = useState(configProps.ipSecurityRestrictionsDefaultAction);

  // SCM rules
  const [scmRules, setScmRules] = useState<IpSecurityRestriction[]>(configProps.scmIpSecurityRestrictions);
  const [scmDefaultAction, setScmDefaultAction] = useState(configProps.scmIpSecurityRestrictionsDefaultAction);
  const [scmUseMain, setScmUseMain] = useState(configProps.scmIpSecurityRestrictionsUseMain);

  // Dialog state
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<RuleFormState>({ ...EMPTY_FORM });

  // Confirmation dialogs
  const [showEnableAllConfirm, setShowEnableAllConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // [Feature 5] Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");

  // [Feature 6] Undo delete
  const [undoState, setUndoState] = useState<{ rule: IpSecurityRestriction; index: number; tab: SiteTab } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Private endpoints check
  const hasPrivateEndpoints = siteProps.privateEndpointConnections?.some(
    (pe) => pe.provisioningState === "Succeeded"
  ) ?? false;

  // ── Current rules based on active tab ──
  const currentRules = activeTab === "main" ? mainRules : scmRules;
  const setCurrentRules = activeTab === "main" ? setMainRules : setScmRules;
  const currentDefaultAction = activeTab === "main" ? mainDefaultAction : scmDefaultAction;
  const setCurrentDefaultAction = activeTab === "main" ? setMainDefaultAction : setScmDefaultAction;

  // [Feature 1] Posture summary data
  const mainAllowCount = mainRules.filter(r => r.action === "Allow").length;
  const mainDenyCount = mainRules.filter(r => r.action === "Deny").length;

  const effectivePosture = useMemo(() => {
    if (publicAccess === "disabled") return { label: "Disabled", color: "#6B7280", bg: "#F3F4F6" };
    if (publicAccess === "all") return { label: "Open", color: "#DC2626", bg: "#FEF2F2" };
    if (mainRules.length === 0 && mainDefaultAction === "Allow") return { label: "Open (no rules)", color: "#D97706", bg: "#FFFBEB" };
    if (mainDefaultAction === "Deny") return { label: "Restricted", color: "#059669", bg: "#ECFDF5" };
    return { label: "Partially open", color: "#D97706", bg: "#FFFBEB" };
  }, [publicAccess, mainRules.length, mainDefaultAction]);

  // [Feature 2] Warnings
  const warnings = useMemo(() => {
    const w: string[] = [];
    const rules = currentRules;
    const defAction = currentDefaultAction;

    // Allow rules with Allow default action
    const hasAllowRules = rules.some(r => r.action === "Allow");
    if (hasAllowRules && defAction === "Allow") {
      w.push("You have Allow rules but the unmatched rule action is also Allow. The Allow rules have no effect since unmatched traffic is already allowed.");
    }

    // /0 subnet mask
    if (rules.some(hasSlashZero)) {
      w.push("One or more rules use a /0 subnet mask, which matches all traffic. This may not be intended.");
    }

    // Duplicate priorities
    const priorities = rules.map(r => r.priority);
    const dupes = priorities.filter((p, i) => priorities.indexOf(p) !== i);
    if (dupes.length > 0) {
      const uniqueDupes = [...new Set(dupes)];
      w.push(`Duplicate priority values detected: ${uniqueDupes.join(", ")}. Rules with the same priority may be evaluated in an unpredictable order.`);
    }

    return w;
  }, [currentRules, currentDefaultAction]);

  // [Feature 5] Filtered & sorted rules
  const filteredSortedRules = useMemo(() => {
    let filtered = [...currentRules];

    if (actionFilter !== "all") {
      filtered = filtered.filter(r => r.action === actionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ipAddress.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        getSourceDisplay(r).toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => a.priority - b.priority);
  }, [currentRules, actionFilter, searchQuery]);

  // [Feature 3] Rule limit
  const ruleCount = currentRules.length;
  const reachedLimit = ruleCount >= RULE_LIMIT;
  const nearLimit = ruleCount >= RULE_LIMIT_WARNING_THRESHOLD;
  const limitPercent = Math.min(ruleCount / RULE_LIMIT, 1);

  // ── Handlers ───────────────────────────────────────

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSaving(false);
    setHasChanges(false);
  }, []);

  const handleDiscard = useCallback(() => {
    setMainRules(configProps.ipSecurityRestrictions);
    setScmRules(configProps.scmIpSecurityRestrictions);
    setMainDefaultAction(configProps.ipSecurityRestrictionsDefaultAction);
    setScmDefaultAction(configProps.scmIpSecurityRestrictionsDefaultAction);
    setScmUseMain(configProps.scmIpSecurityRestrictionsUseMain);
    setPublicAccess(
      siteProps.publicNetworkAccess === "Disabled"
        ? "disabled"
        : configProps.ipSecurityRestrictions.length > 0 ? "select" : "all"
    );
    setHasChanges(false);
  }, [configProps, siteProps]);

  const getNextPriority = useCallback(() => {
    const rules = activeTab === "main" ? mainRules : scmRules;
    if (rules.length === 0) return 100;
    const maxP = rules.reduce((max, r) => Math.max(max, r.priority), 0);
    return Math.min(maxP + 10, 2147483646);
  }, [activeTab, mainRules, scmRules]);

  const openAddDialog = useCallback(() => {
    setEditingIndex(null);
    setForm({ ...EMPTY_FORM, priority: String(getNextPriority()) });
    setShowRuleDialog(true);
  }, [getNextPriority]);

  const openEditDialog = useCallback((rule: IpSecurityRestriction, index: number) => {
    const sourceType = getSourceType(rule);
    const headers: Record<string, string> = {
      "X-Forwarded-For": "",
      "X-Forwarded-Host": "",
      "X-Azure-FDID": "",
      "X-FD-HealthProbe": "",
    };
    if (rule.headers) {
      for (const [key, values] of Object.entries(rule.headers)) {
        const normalized = HTTP_HEADER_NAMES.find(h => h.toLowerCase() === key.toLowerCase());
        if (normalized) headers[normalized] = values.join(", ");
      }
    }

    let vnet = "";
    let subnet = "";
    if (rule.vnetSubnetResourceId) {
      const parts = rule.vnetSubnetResourceId.split("/");
      subnet = parts[parts.length - 1] || "";
      vnet = parts[parts.length - 3] || "";
    }

    setEditingIndex(index);
    setForm({
      name: rule.name,
      description: rule.description,
      action: rule.action,
      priority: String(rule.priority),
      sourceType,
      ipAddress: sourceType === "ipv4" || sourceType === "ipv6" ? rule.ipAddress : "",
      serviceTag: sourceType === "serviceTag" ? rule.ipAddress : "AzureFrontDoor.Backend",
      subscription: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      virtualNetwork: vnet,
      subnet,
      headers,
      showHeaders: !!rule.headers && Object.keys(rule.headers).length > 0,
    });
    setShowRuleDialog(true);
  }, []);

  const buildRuleFromForm = useCallback((): IpSecurityRestriction | null => {
    const priority = parseInt(form.priority, 10);
    if (!form.name || isNaN(priority)) return null;

    let ipAddress = "";
    let tag: IpSecurityRestriction["tag"] = "Default";
    let vnetSubnetResourceId: string | null = null;

    switch (form.sourceType) {
      case "ipv4":
      case "ipv6":
        ipAddress = form.ipAddress;
        if (!ipAddress) return null;
        break;
      case "serviceTag":
        ipAddress = form.serviceTag;
        tag = "ServiceTag";
        break;
      case "virtualNetwork":
        ipAddress = "0.0.0.0/0";
        vnetSubnetResourceId = `/subscriptions/${form.subscription}/resourceGroups/my-app-rg/providers/Microsoft.Network/virtualNetworks/${form.virtualNetwork}/subnets/${form.subnet}`;
        break;
    }

    const headerEntries = Object.entries(form.headers).filter(([, v]) => v.trim());
    const headers: Record<string, string[]> | null = headerEntries.length > 0
      ? Object.fromEntries(headerEntries.map(([k, v]) => [k, v.split(",").map(s => s.trim()).filter(Boolean)]))
      : null;

    return {
      ipAddress,
      action: form.action,
      priority,
      name: form.name,
      description: form.description,
      tag,
      vnetSubnetResourceId,
      headers,
      _sourceType: form.sourceType,
    };
  }, [form]);

  const handleSaveRule = useCallback(() => {
    const rule = buildRuleFromForm();
    if (!rule) return;

    if (editingIndex !== null) {
      setCurrentRules(prev => prev.map((r, i) => i === editingIndex ? rule : r));
    } else {
      setCurrentRules(prev => [...prev, rule]);
    }
    setShowRuleDialog(false);
    setHasChanges(true);
  }, [buildRuleFromForm, editingIndex, setCurrentRules]);

  // [Feature 6] Delete with undo toast
  const handleDeleteRule = useCallback((index: number) => {
    const deletedRule = currentRules[index];
    setCurrentRules(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);

    // Clear previous undo timer
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setUndoState({ rule: deletedRule, index, tab: activeTab });
    undoTimerRef.current = setTimeout(() => setUndoState(null), 5000);
  }, [currentRules, setCurrentRules, activeTab]);

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    const setter = undoState.tab === "main" ? setMainRules : setScmRules;
    setter(prev => {
      const copy = [...prev];
      copy.splice(undoState.index, 0, undoState.rule);

      // Check if restoring brings us back to the original config
      const originalRules = undoState.tab === "main"
        ? configProps.ipSecurityRestrictions
        : configProps.scmIpSecurityRestrictions;
      if (areRulesEqual(copy, originalRules)) {
        // Also check the other tab's rules haven't changed
        const otherCurrent = undoState.tab === "main" ? scmRules : mainRules;
        const otherOriginal = undoState.tab === "main"
          ? configProps.scmIpSecurityRestrictions
          : configProps.ipSecurityRestrictions;
        const otherMatch = areRulesEqual(otherCurrent, otherOriginal);
        const defaultsMatch =
          mainDefaultAction === configProps.ipSecurityRestrictionsDefaultAction &&
          scmDefaultAction === configProps.scmIpSecurityRestrictionsDefaultAction &&
          scmUseMain === configProps.scmIpSecurityRestrictionsUseMain;
        if (otherMatch && defaultsMatch) {
          setHasChanges(false);
        }
      }

      return copy;
    });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState(null);
  }, [undoState, configProps, mainRules, scmRules, mainDefaultAction, scmDefaultAction, scmUseMain]);

  // Cleanup undo timer
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const updateForm = useCallback(<K extends keyof RuleFormState>(key: K, value: RuleFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateHeader = useCallback((headerName: string, value: string) => {
    setForm(prev => ({
      ...prev,
      headers: { ...prev.headers, [headerName]: value },
    }));
  }, []);

  // ── Render ─────────────────────────────────────────

  const isDisabled = publicAccess === "disabled";

  return (
    <>
      {/* ── Save / Discard command bar ── */}
      {hasChanges && (
        <div className={styles.commandBar}>
          <Button
            appearance="primary"
            icon={isSaving ? <Spinner size="tiny" /> : <Save16Regular />}
            disabled={isSaving}
            onClick={handleSave}
            size="small"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            appearance="subtle"
            icon={<Dismiss16Regular />}
            onClick={handleDiscard}
            size="small"
            disabled={isSaving}
          >
            Discard
          </Button>
        </div>
      )}

      {/* ── [Feature 1] Security Posture Summary ── */}
      <div className={local.postureSummary}>
        <div className={local.postureCell}>
          <span className={local.postureCellLabel}>Posture</span>
          <span className={local.postureCellValue}>
            {effectivePosture.label === "Restricted" ? (
              <ShieldCheckmark20Regular style={{ color: effectivePosture.color }} />
            ) : effectivePosture.label === "Disabled" ? (
              <ShieldDismiss20Regular style={{ color: effectivePosture.color }} />
            ) : (
              <Globe20Regular style={{ color: effectivePosture.color }} />
            )}
            <span style={{ color: effectivePosture.color }}>{effectivePosture.label}</span>
          </span>
        </div>
        <div className={local.postureCell}>
          <span className={local.postureCellLabel}>Main site</span>
          <span className={local.postureCellValue}>
            <Badge appearance="filled" color="success" size="small">{mainAllowCount} Allow</Badge>
            <Badge appearance="filled" color="danger" size="small">{mainDenyCount} Deny</Badge>
          </span>
          <span className={local.postureCellValue} style={{ marginTop: "2px" }}>
            <Badge
              appearance="tint"
              color={mainDefaultAction === "Deny" ? "danger" : "warning"}
              size="small"
            >
              Default: {mainDefaultAction}
            </Badge>
          </span>
        </div>
        <div className={local.postureCell}>
          <span className={local.postureCellLabel}>Advanced tool site</span>
          {scmUseMain
            ? <span className={local.postureCellValue}>
                <Badge appearance="tint" color="informative" size="small">Same as main site</Badge>
              </span>
            : <>
                <span className={local.postureCellValue}>
                  <Badge appearance="filled" color="success" size="small">{scmRules.filter(r => r.action === "Allow").length} Allow</Badge>
                  <Badge appearance="filled" color="danger" size="small">{scmRules.filter(r => r.action === "Deny").length} Deny</Badge>
                </span>
                <span className={local.postureCellValue} style={{ marginTop: "2px" }}>
                  <Badge
                    appearance="tint"
                    color={scmDefaultAction === "Deny" ? "danger" : "warning"}
                    size="small"
                  >
                    Default: {scmDefaultAction}
                  </Badge>
                </span>
              </>
          }
        </div>
      </div>

      {/* ── Public network access ── */}
      <div className={styles.sectionCard}>
        <div style={{ marginBottom: "4px" }}>
          <div className={styles.sectionTitle}>Public network access</div>
          <div className={styles.sectionSubtitle}>
            Configure whether the app is reachable from the public internet.{" "}
            <Link href="https://learn.microsoft.com/azure/app-service/overview-access-restrictions" target="_blank" inline>
              Learn more
            </Link>
          </div>
        </div>

        {hasPrivateEndpoints && (
          <MessageBar intent="info" style={{ marginTop: "8px" }}>
            <MessageBarBody>
              This app has private endpoints configured. Private endpoint connections bypass access restriction rules.{" "}
              <Link href="https://learn.microsoft.com/azure/app-service/networking/private-endpoint" target="_blank" inline>
                Learn more
              </Link>
            </MessageBarBody>
          </MessageBar>
        )}

        <RadioGroup
          value={publicAccess}
          onChange={(_, data) => {
            const newValue = data.value as typeof publicAccess;
            if (newValue === "all" && publicAccess === "select" && (mainRules.length > 0 || scmRules.length > 0)) {
              setShowEnableAllConfirm(true);
              return;
            }
            if (newValue === "disabled" && publicAccess !== "disabled") {
              setShowDisableConfirm(true);
              return;
            }
            setPublicAccess(newValue);
            setHasChanges(true);
          }}
          layout="vertical"
          style={{ marginTop: "12px" }}
        >
          <Radio value="all" label="Enabled from all networks" />
          <Radio value="select" label="Enabled from select virtual networks and IP addresses" />
          <Radio value="disabled" label="Disabled" />
        </RadioGroup>

        {publicAccess === "disabled" && (
          <MessageBar intent="success" style={{ marginTop: "12px" }}>
            <MessageBarBody>
              Public network access is disabled. The app is only accessible through private endpoints.
            </MessageBarBody>
          </MessageBar>
        )}
      </div>

      {/* ── Site access section ── */}
      {!isDisabled && (
        <div className={styles.sectionCard}>
          <div style={{ marginBottom: "16px" }}>
            <div className={styles.sectionTitle}>Site access and rules</div>
            <div className={styles.sectionSubtitle}>
              Access restriction rules are evaluated in priority order. Add rules to control which IP addresses, service
              tags, or virtual network subnets can access your app.{" "}
              <Link href="https://learn.microsoft.com/azure/app-service/app-service-ip-restrictions" target="_blank" inline>
                Learn more
              </Link>
            </div>
          </div>

          {/* Tab bar */}
          <TabList
            selectedValue={activeTab}
            onTabSelect={(_, data: SelectTabData) => {
              setActiveTab(data.value as SiteTab);
              setSearchQuery("");
              setActionFilter("all");
            }}
            size="small"
            style={{ marginBottom: "16px" }}
          >
            <Tab value="main">Main site ({mainRules.length})</Tab>
            <Tab value="scm">Advanced tool site ({scmUseMain ? "main" : scmRules.length})</Tab>
          </TabList>

          {/* SCM: Use main site rules toggle */}
          {activeTab === "scm" && (
            <div className={styles.toggleRow} style={{ marginBottom: "16px" }}>
              <div>
                <div className={styles.toggleLabel}>
                  Use main site rules
                  <Tooltip
                    content="When enabled, the advanced tool site (SCM/Kudu) uses the same access restriction rules as the main site."
                    relationship="description"
                  >
                    <Info16Regular style={{ marginLeft: "6px", color: "#9CA3AF", cursor: "help" }} />
                  </Tooltip>
                </div>
                <div className={styles.toggleDesc}>
                  {scmUseMain
                    ? `Using main site rules (${mainRules.length} rule${mainRules.length !== 1 ? "s" : ""})`
                    : "Advanced tool site has its own rules"}
                </div>
              </div>
              <Switch
                checked={scmUseMain}
                onChange={(_, data) => {
                  setScmUseMain(data.checked);
                  setHasChanges(true);
                }}
              />
            </div>
          )}

          {/* Rules area (hidden when SCM uses main rules) */}
          {(activeTab === "main" || !scmUseMain) && (
            <>
              {/* Unmatched rule action + Add button row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#242424" }}>Unmatched rule action:</span>
                  <Dropdown
                    value={currentDefaultAction}
                    selectedOptions={[currentDefaultAction]}
                    onOptionSelect={(_, data) => {
                      setCurrentDefaultAction(data.optionValue as "Allow" | "Deny");
                      setHasChanges(true);
                    }}
                    size="small"
                    style={{ minWidth: "100px" }}
                  >
                    <Option value="Allow">Allow</Option>
                    <Option value="Deny">Deny</Option>
                  </Dropdown>
                  <Tooltip
                    content="Defines what happens when incoming traffic doesn't match any rule."
                    relationship="description"
                  >
                    <Info16Regular style={{ color: "#9CA3AF", cursor: "help" }} />
                  </Tooltip>
                </div>
                <Button
                  appearance="primary"
                  icon={<Add16Regular />}
                  size="small"
                  onClick={openAddDialog}
                  disabled={reachedLimit}
                >
                  Add rule
                </Button>
              </div>

              {/* [Feature 4] Traffic flow description */}
              <div
                className={local.trafficFlowBox}
                style={{
                  backgroundColor: currentDefaultAction === "Deny" ? "#ECFDF5" : "#FFFBEB",
                  color: currentDefaultAction === "Deny" ? "#065F46" : "#92400E",
                }}
              >
                {currentDefaultAction === "Deny" ? (
                  <ShieldCheckmark20Regular />
                ) : (
                  <Warning16Regular />
                )}
                <span>
                  Traffic not matching any rule will be <strong>{currentDefaultAction === "Deny" ? "denied" : "allowed"}</strong>.
                  {currentDefaultAction === "Allow" && currentRules.length > 0 && (
                    <> Only explicit Deny rules will block traffic.</>
                  )}
                  {currentDefaultAction === "Deny" && currentRules.length > 0 && (
                    <> Only traffic matching an Allow rule can reach your app.</>
                  )}
                  {currentRules.length === 0 && (
                    <> Add rules to control access more precisely.</>
                  )}
                </span>
              </div>

              {/* [Feature 2] Inline warnings */}
              {warnings.map((w, i) => (
                <MessageBar key={i} intent="warning" style={{ marginTop: "8px", marginBottom: i === warnings.length - 1 ? "12px" : "0" }}>
                  <MessageBarBody>{w}</MessageBarBody>
                </MessageBar>
              ))}

              {/* [Feature 3] Rule limit progress */}
              {(ruleCount > 0 || reachedLimit) && (
                <div className={local.ruleLimit}>
                  <div className={local.ruleLimitText}>
                    <span>{ruleCount} / {RULE_LIMIT} rules</span>
                    {reachedLimit && <span style={{ color: "#DC2626", fontWeight: 600 }}>Limit reached</span>}
                    {!reachedLimit && nearLimit && <span style={{ color: "#D97706", fontWeight: 600 }}>Nearing limit</span>}
                  </div>
                  <ProgressBar
                    value={limitPercent}
                    color={reachedLimit ? "error" : nearLimit ? "warning" : "brand"}
                    thickness="medium"
                  />
                </div>
              )}

              {/* [Feature 5] Search + Action filter */}
              {currentRules.length > 0 && (
                <div className={local.searchRow}>
                  <Input
                    value={searchQuery}
                    onChange={(_, data) => setSearchQuery(data.value)}
                    placeholder="Search rules by name, source..."
                    contentBefore={<Search16Regular />}
                    size="small"
                    style={{ flex: 1, maxWidth: "320px" }}
                  />
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(["all", "Allow", "Deny"] as const).map(f => (
                      <Button
                        key={f}
                        className={local.filterPill}
                        size="small"
                        appearance={actionFilter === f ? "primary" : "outline"}
                        onClick={() => setActionFilter(f)}
                        style={{ minWidth: 0, paddingLeft: "10px", paddingRight: "10px" }}
                      >
                        {f === "all" ? "All" : f}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules table */}
              {(filteredSortedRules.length > 0 || (undoState && undoState.tab === activeTab)) ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHead} style={{ width: "70px" }}>Priority</th>
                      <th className={styles.tableHead}>Name</th>
                      <th className={styles.tableHead} style={{ width: "80px" }}>Action</th>
                      <th className={styles.tableHead}>Source</th>
                      <th className={styles.tableHead} style={{ width: "100px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows: React.ReactNode[] = [];
                      const undoForThisTab = undoState && undoState.tab === activeTab ? undoState : null;
                      let undoInserted = false;

                      const undoRow = undoForThisTab && (
                        <tr key="undo-row">
                          <td colSpan={5} className={local.undoRowCell}>
                            <div className={local.undoRowInner}>
                              <ArrowUndo16Regular />
                              <span>Deleted &quot;{undoForThisTab.rule.name}&quot;</span>
                              <Button
                                appearance="transparent"
                                size="small"
                                onClick={handleUndo}
                                style={{ fontWeight: 600, minWidth: 0 }}
                              >
                                Undo
                              </Button>
                              <Button
                                appearance="transparent"
                                size="small"
                                icon={<Dismiss16Regular />}
                                onClick={() => {
                                  if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
                                  setUndoState(null);
                                }}
                                style={{ minWidth: 0, padding: 0 }}
                              />
                            </div>
                            <div key={undoForThisTab.rule.name + undoForThisTab.index} className={local.undoCountdown} />
                          </td>
                        </tr>
                      );

                      for (const rule of filteredSortedRules) {
                        if (undoForThisTab && !undoInserted && rule.priority > undoForThisTab.rule.priority) {
                          rows.push(undoRow);
                          undoInserted = true;
                        }

                        const realIndex = currentRules.indexOf(rule);
                        rows.push(
                          <tr key={`${rule.name}-${rule.priority}`} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <Badge appearance="outline" color="informative" size="small">
                                {rule.priority}
                              </Badge>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ fontWeight: 500 }}>{rule.name}</div>
                              {rule.description && (
                                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>
                                  {rule.description}
                                </div>
                              )}
                            </td>
                            <td className={styles.tableCell}>
                              <Badge
                                appearance="filled"
                                color={rule.action === "Allow" ? "success" : "danger"}
                                size="small"
                              >
                                {rule.action}
                              </Badge>
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Badge appearance="tint" color="brand" size="small">
                                  {getSourceLabel(getSourceType(rule))}
                                </Badge>
                                <span style={{ fontFamily: "'SF Mono', 'Cascadia Code', monospace", fontSize: "12px" }}>
                                  {getSourceDisplay(rule)}
                                </span>
                                {hasSlashZero(rule) && (
                                  <Tooltip content="This /0 mask matches all traffic" relationship="description">
                                    <Warning16Regular style={{ color: "#D97706" }} />
                                  </Tooltip>
                                )}
                              </div>
                              {rule.headers && Object.keys(rule.headers).length > 0 && (
                                <div style={{ marginTop: "4px", fontSize: "11px", color: "#6B7280" }}>
                                  Headers: {Object.entries(rule.headers).map(([k, v]) =>
                                    `${k}=${Array.isArray(v) ? v.join(",") : v}`
                                  ).join("; ")}
                                </div>
                              )}
                            </td>
                            <td className={styles.tableCell}>
                              <div style={{ display: "flex", gap: "2px" }}>
                                <Tooltip content="Edit rule" relationship="label">
                                  <Button
                                    icon={<Edit16Regular />}
                                    appearance="subtle"
                                    size="small"
                                    onClick={() => openEditDialog(rule, realIndex)}
                                  />
                                </Tooltip>
                                <Tooltip content="Delete rule" relationship="label">
                                  <Button
                                    icon={<Delete16Regular />}
                                    appearance="subtle"
                                    size="small"
                                    onClick={() => handleDeleteRule(realIndex)}
                                  />
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      if (undoForThisTab && !undoInserted) {
                        rows.push(undoRow);
                      }

                      return rows;
                    })()}
                  </tbody>
                </table>
              ) : currentRules.length > 0 ? (
                // Search/filter returned no results
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>No matching rules</div>
                  <div className={styles.emptyDesc}>
                    No rules match your current search or filter. Try adjusting your criteria.
                  </div>
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => { setSearchQuery(""); setActionFilter("all"); }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>No access restriction rules</div>
                  <div className={styles.emptyDesc}>
                    When no rules are configured, the unmatched rule action determines if traffic is allowed or denied.
                    Select <strong>Add rule</strong> to create a new rule.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Undo toast moved to inline table row */}

      {/* ── Add / Edit Rule Dialog ── */}
      <Dialog open={showRuleDialog} onOpenChange={(_, data) => setShowRuleDialog(data.open)}>
        <DialogSurface style={{ maxWidth: "560px" }}>
          <DialogBody>
            <DialogTitle>
              {editingIndex !== null ? "Edit Access Restriction" : "Add Access Restriction"}
            </DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
                {/* Action */}
                <FormField label="Action">
                  <Dropdown
                    value={form.action}
                    selectedOptions={[form.action]}
                    onOptionSelect={(_, data) => updateForm("action", data.optionValue as "Allow" | "Deny")}
                    style={{ width: "100%" }}
                    size="small"
                  >
                    <Option value="Allow">Allow</Option>
                    <Option value="Deny">Deny</Option>
                  </Dropdown>
                </FormField>

                {/* Name */}
                <FormField label="Name" required>
                  <Input
                    value={form.name}
                    onChange={(_, data) => updateForm("name", data.value)}
                    placeholder="e.g., Office-Network"
                    style={{ width: "100%" }}
                    size="small"
                  />
                </FormField>

                {/* Description */}
                <FormField label="Description">
                  <Input
                    value={form.description}
                    onChange={(_, data) => updateForm("description", data.value)}
                    placeholder="Optional description"
                    style={{ width: "100%" }}
                    size="small"
                  />
                </FormField>

                {/* Priority */}
                <FormField label="Priority" required>
                  <Input
                    value={form.priority}
                    onChange={(_, data) => updateForm("priority", data.value)}
                    placeholder="e.g., 100"
                    type="number"
                    style={{ width: "100%" }}
                    size="small"
                  />
                  <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
                    Lower values are evaluated first. Valid range: 1-2147483647.
                  </div>
                </FormField>

                {/* Source Type */}
                <FormField label="Type">
                  <Dropdown
                    value={getSourceLabel(form.sourceType)}
                    selectedOptions={[form.sourceType]}
                    onOptionSelect={(_, data) => updateForm("sourceType", data.optionValue as SourceType)}
                    style={{ width: "100%" }}
                    size="small"
                  >
                    <Option value="ipv4">IPv4</Option>
                    <Option value="ipv6">IPv6</Option>
                    <Option value="serviceTag">Service Tag</Option>
                    <Option value="virtualNetwork">Virtual Network</Option>
                  </Dropdown>
                </FormField>

                {/* Source-specific fields */}
                {(form.sourceType === "ipv4" || form.sourceType === "ipv6") && (
                  <FormField label="IP Address Block" required>
                    <Input
                      value={form.ipAddress}
                      onChange={(_, data) => updateForm("ipAddress", data.value)}
                      placeholder={form.sourceType === "ipv4" ? "e.g., 203.0.113.0/24" : "e.g., 2001:db8::/32"}
                      style={{ width: "100%" }}
                      size="small"
                    />
                    <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
                      CIDR notation. Use /32 for a single {form.sourceType === "ipv4" ? "IPv4" : "IPv6"} address.
                    </div>
                  </FormField>
                )}

                {form.sourceType === "serviceTag" && (
                  <FormField label="Service Tag" required>
                    <Dropdown
                      value={form.serviceTag}
                      selectedOptions={[form.serviceTag]}
                      onOptionSelect={(_, data) => updateForm("serviceTag", data.optionValue!)}
                      style={{ width: "100%" }}
                      size="small"
                    >
                      {SERVICE_TAGS.map(tag => (
                        <Option key={tag} value={tag}>{tag}</Option>
                      ))}
                    </Dropdown>
                  </FormField>
                )}

                {form.sourceType === "virtualNetwork" && (
                  <>
                    <FormField label="Subscription">
                      <Dropdown
                        value="My Subscription (a1b2c3d4-...)"
                        selectedOptions={[form.subscription]}
                        style={{ width: "100%" }}
                        size="small"
                      >
                        <Option value="a1b2c3d4-e5f6-7890-abcd-ef1234567890">
                          My Subscription (a1b2c3d4-...)
                        </Option>
                      </Dropdown>
                    </FormField>
                    <FormField label="Virtual Network" required>
                      <Dropdown
                        value={form.virtualNetwork}
                        selectedOptions={[form.virtualNetwork]}
                        onOptionSelect={(_, data) => updateForm("virtualNetwork", data.optionValue!)}
                        style={{ width: "100%" }}
                        size="small"
                      >
                        <Option value="my-vnet">my-vnet</Option>
                        <Option value="corp-vnet">corp-vnet</Option>
                      </Dropdown>
                    </FormField>
                    <FormField label="Subnet" required>
                      <Dropdown
                        value={form.subnet}
                        selectedOptions={[form.subnet]}
                        onOptionSelect={(_, data) => updateForm("subnet", data.optionValue!)}
                        style={{ width: "100%" }}
                        size="small"
                      >
                        <Option value="default">default (10.0.0.0/24)</Option>
                        <Option value="app-subnet">app-subnet (10.0.1.0/24)</Option>
                        <Option value="db-subnet">db-subnet (10.0.2.0/24)</Option>
                      </Dropdown>
                      <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
                        Service endpoints for Microsoft.Web will be automatically enabled on the selected subnet.
                      </div>
                    </FormField>
                  </>
                )}

                {/* HTTP Headers (collapsible) */}
                <div>
                  <Button
                    appearance="transparent"
                    size="small"
                    icon={form.showHeaders ? <ChevronUp16Regular /> : <ChevronDown16Regular />}
                    iconPosition="after"
                    onClick={() => updateForm("showHeaders", !form.showHeaders)}
                    style={{ padding: 0, minWidth: 0, fontWeight: 600, fontSize: "13px" }}
                  >
                    HTTP headers (optional, advanced)
                  </Button>
                  {form.showHeaders && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", paddingLeft: "4px" }}>
                      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "18px" }}>
                        HTTP header filters are evaluated after the rule itself. Both the rule and the header condition must
                        match. Up to 8 comma-separated values per header.
                      </div>
                      {HTTP_HEADER_NAMES.map(headerName => (
                        <FormField key={headerName} label={headerName}>
                          <Input
                            value={form.headers[headerName] || ""}
                            onChange={(_, data) => updateHeader(headerName, data.value)}
                            placeholder={
                              headerName === "X-Azure-FDID" ? "e.g., a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                                : headerName === "X-FD-HealthProbe" ? "e.g., 1"
                                  : headerName === "X-Forwarded-For" ? "e.g., 10.0.0.1, 10.0.0.2"
                                    : "e.g., example.com"
                            }
                            style={{ width: "100%" }}
                            size="small"
                          />
                        </FormField>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setShowRuleDialog(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSaveRule}
                disabled={!form.name || !form.priority || (
                  (form.sourceType === "ipv4" || form.sourceType === "ipv6") && !form.ipAddress
                )}
                size="small"
              >
                {editingIndex !== null ? "Update rule" : "Add rule"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* ── Confirmation: Enable from all networks ── */}
      <Dialog open={showEnableAllConfirm} onOpenChange={(_, data) => setShowEnableAllConfirm(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Enable access from all networks?</DialogTitle>
            <DialogContent>
              <div style={{ fontSize: "13px", lineHeight: "20px", color: "#242424" }}>
                Changing to <strong>Enabled from all networks</strong> will remove all{" "}
                <strong>{mainRules.length + scmRules.length}</strong> existing access restriction
                rule{mainRules.length + scmRules.length !== 1 ? "s" : ""} for both the main site and
                the advanced tool site. Your app will be accessible from the public internet without
                any IP filtering.
              </div>
              <MessageBar intent="warning" style={{ marginTop: "12px" }}>
                <MessageBarBody>
                  This action cannot be undone after saving. All configured IP restrictions, service
                  tag rules, and virtual network rules will be permanently deleted.
                </MessageBarBody>
              </MessageBar>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setShowEnableAllConfirm(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  setPublicAccess("all");
                  setMainRules([]);
                  setScmRules([]);
                  setMainDefaultAction("Allow");
                  setScmDefaultAction("Allow");
                  setHasChanges(true);
                  setShowEnableAllConfirm(false);
                }}
                size="small"
                style={{ backgroundColor: "#DC2626" }}
              >
                Remove rules and enable all
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* ── Confirmation: Disable public access ── */}
      <Dialog open={showDisableConfirm} onOpenChange={(_, data) => setShowDisableConfirm(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Disable public network access?</DialogTitle>
            <DialogContent>
              <div style={{ fontSize: "13px", lineHeight: "20px", color: "#242424" }}>
                Disabling public network access will block all inbound traffic through the public
                endpoint. Your app will only be accessible through configured private endpoints.
              </div>
              <MessageBar intent="warning" style={{ marginTop: "12px" }}>
                <MessageBarBody>
                  Any clients that are not connecting through a private endpoint will receive an
                  HTTP 403 response. Ensure you have private endpoints configured before saving.
                </MessageBarBody>
              </MessageBar>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setShowDisableConfirm(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  setPublicAccess("disabled");
                  setHasChanges(true);
                  setShowDisableConfirm(false);
                }}
                size="small"
              >
                Disable public access
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

// ── Tiny form field wrapper ──────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "#242424" }}>
        {label}
        {required && <span style={{ color: "#DC2626", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
