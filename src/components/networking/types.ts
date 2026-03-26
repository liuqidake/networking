// ARM API response types matching Microsoft.Web and Microsoft.Network resource shapes

export interface ArmObj<T> {
  id: string;
  name: string;
  type: string;
  location: string;
  properties: T;
}

// Site (Microsoft.Web/sites)
export interface SiteProperties {
  state: string;
  hostNames: string[];
  defaultHostName: string;
  inboundIpAddress: string;
  inboundIpv6Address: string;
  possibleOutboundIpAddresses: string;
  possibleOutboundIpv6Addresses: string;
  virtualNetworkSubnetId: string | null;
  hostingEnvironmentId: string | null;
  publicNetworkAccess: "Enabled" | "Disabled" | "";
  vnetRouteAllEnabled: boolean;
  vnetImagePullEnabled: boolean;
  vnetContentShareEnabled: boolean;
  vnetBackupRestoreEnabled: boolean;
  privateEndpointConnections: PrivateEndpointConnectionProperties[];
  hostNameSslStates: HostNameSslState[];
  serverFarmId: string;
  sku: string;
}

export interface HostNameSslState {
  name: string;
  sslState: "Disabled" | "SniEnabled" | "IpBasedEnabled";
  thumbprint: string | null;
}

// SiteConfig (Microsoft.Web/sites/config/web)
export interface SiteConfigProperties {
  ipSecurityRestrictions: IpSecurityRestriction[];
  scmIpSecurityRestrictions: IpSecurityRestriction[];
  ipSecurityRestrictionsDefaultAction: "Allow" | "Deny";
  scmIpSecurityRestrictionsDefaultAction: "Allow" | "Deny";
  scmIpSecurityRestrictionsUseMain: boolean;
  ftpsState: "AllAllowed" | "FtpsOnly" | "Disabled";
  minTlsVersion: string;
}

export interface IpSecurityRestriction {
  ipAddress: string;
  action: "Allow" | "Deny";
  priority: number;
  name: string;
  description: string;
  tag: "Default" | "XffProxy" | "ServiceTag";
  vnetSubnetResourceId: string | null;
  headers: Record<string, string[]> | null;
  /** UI-only: source type for the add/edit dialog */
  _sourceType?: "ipv4" | "ipv6" | "serviceTag" | "virtualNetwork";
  /** UI-only: subscription for VNet rules */
  _subscription?: string;
  /** UI-only: virtual network name for VNet rules */
  _virtualNetwork?: string;
  /** UI-only: subnet name for VNet rules */
  _subnet?: string;
}

// VNet Integration (Microsoft.Web/sites/networkConfig/virtualNetwork)
export interface SwiftVirtualNetworkProperties {
  subnetResourceId: string;
  swiftSupported: boolean;
}

// Subnet (Microsoft.Network/virtualNetworks/subnets)
export interface SubnetProperties {
  addressPrefix: string;
  delegations: SubnetDelegation[];
  serviceEndpoints: ServiceEndpoint[];
  natGateway: { id: string } | null;
  networkSecurityGroup: { id: string } | null;
  routeTable: { id: string } | null;
  provisioningState: string;
}

export interface SubnetDelegation {
  id: string;
  name: string;
  properties: {
    serviceName: string;
  };
}

export interface ServiceEndpoint {
  service: string;
  locations: string[];
  provisioningState: string;
}

// Private Endpoint Connections
export type PrivateEndpointConnectionStatus =
  | "Pending"
  | "Approved"
  | "Approving"
  | "Rejected"
  | "Rejecting"
  | "Disconnected"
  | "Disconnecting";

export type PrivateEndpointProvisioningState =
  | "Succeeded"
  | "Pending"
  | "Updating"
  | "Deleting"
  | "Failed";

export interface PrivateEndpointConnectionProperties {
  provisioningState: PrivateEndpointProvisioningState;
  privateEndpoint: { id: string };
  privateLinkServiceConnectionState: {
    status: PrivateEndpointConnectionStatus;
    description: string;
  };
  ipAddresses: string[];
}

export interface PrivateEndpointCreateInfo {
  name: string;
  subscription: string;
  resourceGroup: string;
  virtualNetwork: string;
  subnet: string;
  integrateDns: boolean;
}

// Hybrid Connections
export interface HybridConnectionProperties {
  hostname: string;
  port: number;
  relayName: string;
  relayArmUri: string;
  serviceBusNamespace: string;
  sendKeyName: string;
  sendKeyValue: string;
}

// NAT Gateway
export interface NatGatewayProperties {
  publicIpAddresses: { id: string }[];
  publicIpPrefixes: { id: string }[];
  subnets: { id: string }[];
  provisioningState: string;
  idleTimeoutInMinutes: number;
}

// ServerFarm (App Service Plan)
export interface ServerFarmProperties {
  workerSize: string;
  numberOfWorkers: number;
  currentNumberOfWorkers: number;
  sku: {
    name: string;
    tier: string;
    size: string;
    family: string;
    capacity: number;
  };
}

// DNS Configuration
export interface DnsConfigurationProperties {
  dnsServers: string[];
  internalDnsServer: string;
  virtualNetworkId: string;
}

// Azure Front Door
export interface FrontDoorProperties {
  frontDoorId: string;
  frontDoorName: string;
  frontendEndpoints: string[];
}

// Networking Hub aggregated state
export interface NetworkingState {
  site: ArmObj<SiteProperties>;
  siteConfig: ArmObj<SiteConfigProperties>;
  vnetIntegration: ArmObj<SwiftVirtualNetworkProperties> | null;
  subnet: ArmObj<SubnetProperties> | null;
  natGateway: ArmObj<NatGatewayProperties> | null;
  hybridConnections: ArmObj<HybridConnectionProperties>[];
  serverFarm: ArmObj<ServerFarmProperties>;
  frontDoor: ArmObj<FrontDoorProperties> | null;
  dnsConfig: DnsConfigurationProperties | null;
  isLoading: boolean;
}

// Feature status for the posture card
export type FeatureStatus = "configured" | "not-configured" | "warning" | "error";

export interface PostureItem {
  label: string;
  status: FeatureStatus;
  detail: string;
}
