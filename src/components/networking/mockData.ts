import type {
  ArmObj,
  SiteProperties,
  SiteConfigProperties,
  SwiftVirtualNetworkProperties,
  SubnetProperties,
  NatGatewayProperties,
  HybridConnectionProperties,
  ServerFarmProperties,
  FrontDoorProperties,
  NetworkingState,
} from "./types";

const RESOURCE_ID =
  "/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Web/sites/my-app-service";

const VNET_ID =
  "/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/virtualNetworks/my-vnet";

const SUBNET_ID = `${VNET_ID}/subnets/app-subnet`;

const NAT_GATEWAY_ID =
  "/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/natGateways/my-nat-gw";

const SERVER_FARM_ID =
  "/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Web/serverfarms/my-plan";

export const mockSite: ArmObj<SiteProperties> = {
  id: RESOURCE_ID,
  name: "my-app-service",
  type: "Microsoft.Web/sites",
  location: "East US",
  properties: {
    state: "Running",
    hostNames: ["my-app-service.azurewebsites.net"],
    defaultHostName: "my-app-service.azurewebsites.net",
    inboundIpAddress: "20.62.134.87",
    inboundIpv6Address: "2603:1030:210:9::48",
    possibleOutboundIpAddresses: "20.62.134.90,20.62.134.91,20.62.134.92,20.62.134.93",
    possibleOutboundIpv6Addresses:
      "2603:1030:210:8::2,2603:1030:210:8::3,2603:1030:210:8::4,2603:1030:210:8::5,2603:1030:210:8::6",
    virtualNetworkSubnetId: SUBNET_ID,
    hostingEnvironmentId: null,
    publicNetworkAccess: "Enabled",
    vnetRouteAllEnabled: true,
    vnetImagePullEnabled: false,
    vnetContentShareEnabled: false,
    vnetBackupRestoreEnabled: false,
    privateEndpointConnections: [
      {
        provisioningState: "Succeeded",
        privateEndpoint: {
          id: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/privateEndpoints/my-app-pe`,
        },
        privateLinkServiceConnectionState: {
          status: "Approved",
          description: "Auto-approved",
        },
        ipAddresses: ["10.0.1.4"],
      },
      {
        provisioningState: "Succeeded",
        privateEndpoint: {
          id: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/privateEndpoints/my-app-pe-2`,
        },
        privateLinkServiceConnectionState: {
          status: "Pending",
          description: "Awaiting approval",
        },
        ipAddresses: ["10.0.1.5"],
      },
      {
        provisioningState: "Succeeded",
        privateEndpoint: {
          id: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/privateEndpoints/my-app-pe-staging`,
        },
        privateLinkServiceConnectionState: {
          status: "Rejected",
          description: "Rejected by admin",
        },
        ipAddresses: ["10.0.1.6"],
      },
      {
        provisioningState: "Failed",
        privateEndpoint: {
          id: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/privateEndpoints/my-app-pe-failed`,
        },
        privateLinkServiceConnectionState: {
          status: "Pending",
          description: "Provisioning failed",
        },
        ipAddresses: [],
      },
    ],
    hostNameSslStates: [
      {
        name: "my-app-service.azurewebsites.net",
        sslState: "SniEnabled",
        thumbprint: "A1B2C3D4E5F6...",
      },
    ],
    serverFarmId: SERVER_FARM_ID,
    sku: "PremiumV3",
  },
};

export const mockSiteConfig: ArmObj<SiteConfigProperties> = {
  id: `${RESOURCE_ID}/config/web`,
  name: "web",
  type: "Microsoft.Web/sites/config",
  location: "East US",
  properties: {
    ipSecurityRestrictions: [
      {
        ipAddress: "203.0.113.0/24",
        action: "Allow",
        priority: 100,
        name: "Office-Network",
        description: "Corporate office IP range",
        tag: "Default",
        vnetSubnetResourceId: null,
        headers: null,
      },
      {
        ipAddress: "198.51.100.50/32",
        action: "Allow",
        priority: 200,
        name: "VPN-Gateway",
        description: "VPN egress IP",
        tag: "Default",
        vnetSubnetResourceId: null,
        headers: null,
      },
      {
        ipAddress: "AzureFrontDoor.Backend",
        action: "Allow",
        priority: 300,
        name: "Azure-Front-Door",
        description: "Allow traffic from AFD",
        tag: "ServiceTag",
        vnetSubnetResourceId: null,
        headers: {
          "x-azure-fdid": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"],
        },
      },
      {
        ipAddress: "Any",
        action: "Deny",
        priority: 2147483647,
        name: "Deny-All",
        description: "Deny all other traffic",
        tag: "Default",
        vnetSubnetResourceId: null,
        headers: null,
      },
    ],
    scmIpSecurityRestrictions: [
      {
        ipAddress: "203.0.113.0/24",
        action: "Allow",
        priority: 100,
        name: "Office-Network",
        description: "Corporate office IP range",
        tag: "Default",
        vnetSubnetResourceId: null,
        headers: null,
      },
    ],
    ipSecurityRestrictionsDefaultAction: "Deny",
    scmIpSecurityRestrictionsDefaultAction: "Deny",
    scmIpSecurityRestrictionsUseMain: false,
    ftpsState: "FtpsOnly",
    minTlsVersion: "1.2",
  },
};

export const mockVnetIntegration: ArmObj<SwiftVirtualNetworkProperties> = {
  id: `${RESOURCE_ID}/networkConfig/virtualNetwork`,
  name: "virtualNetwork",
  type: "Microsoft.Web/sites/networkConfig",
  location: "East US",
  properties: {
    subnetResourceId: SUBNET_ID,
    swiftSupported: true,
  },
};

export const mockSubnet: ArmObj<SubnetProperties> = {
  id: SUBNET_ID,
  name: "app-subnet",
  type: "Microsoft.Network/virtualNetworks/subnets",
  location: "East US",
  properties: {
    addressPrefix: "10.0.0.0/24",
    delegations: [
      {
        id: `${SUBNET_ID}/delegations/delegation`,
        name: "delegation",
        properties: {
          serviceName: "Microsoft.Web/serverFarms",
        },
      },
    ],
    serviceEndpoints: [
      {
        service: "Microsoft.Sql",
        locations: ["*"],
        provisioningState: "Succeeded",
      },
      {
        service: "Microsoft.Storage",
        locations: ["eastus"],
        provisioningState: "Succeeded",
      },
    ],
    natGateway: { id: NAT_GATEWAY_ID },
    networkSecurityGroup: {
      id: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/networkSecurityGroups/app-nsg`,
    },
    routeTable: null,
    provisioningState: "Succeeded",
  },
};

export const mockNatGateway: ArmObj<NatGatewayProperties> = {
  id: NAT_GATEWAY_ID,
  name: "my-nat-gw",
  type: "Microsoft.Network/natGateways",
  location: "East US",
  properties: {
    publicIpAddresses: [
      {
        id: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/publicIPAddresses/nat-pip`,
      },
    ],
    publicIpPrefixes: [],
    subnets: [{ id: SUBNET_ID }],
    provisioningState: "Succeeded",
    idleTimeoutInMinutes: 4,
  },
};

export const mockHybridConnections: ArmObj<HybridConnectionProperties>[] = [
  {
    id: `${RESOURCE_ID}/hybridConnectionRelays/myrelay`,
    name: "myrelay",
    type: "Microsoft.Web/sites/hybridConnectionRelays",
    location: "East US",
    properties: {
      hostname: "db-server.corp.local",
      port: 1433,
      relayName: "myrelay",
      relayArmUri: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Relay/namespaces/my-relay-ns/hybridConnections/myrelay`,
      serviceBusNamespace: "my-relay-ns",
      sendKeyName: "defaultSender",
      sendKeyValue: "***",
    },
  },
  {
    id: `${RESOURCE_ID}/hybridConnectionRelays/fileshare-relay`,
    name: "fileshare-relay",
    type: "Microsoft.Web/sites/hybridConnectionRelays",
    location: "East US",
    properties: {
      hostname: "fileserver.corp.local",
      port: 445,
      relayName: "fileshare-relay",
      relayArmUri: `/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Relay/namespaces/my-relay-ns/hybridConnections/fileshare-relay`,
      serviceBusNamespace: "my-relay-ns",
      sendKeyName: "defaultSender",
      sendKeyValue: "***",
    },
  },
];

export const mockServerFarm: ArmObj<ServerFarmProperties> = {
  id: SERVER_FARM_ID,
  name: "my-plan",
  type: "Microsoft.Web/serverfarms",
  location: "East US",
  properties: {
    workerSize: "Default",
    numberOfWorkers: 1,
    currentNumberOfWorkers: 1,
    sku: {
      name: "P1v3",
      tier: "PremiumV3",
      size: "P1v3",
      family: "Pv3",
      capacity: 1,
    },
  },
};

export const mockFrontDoor: ArmObj<FrontDoorProperties> = {
  id: "/subscriptions/a1b2c3d4-e5f6-7890-abcd-ef1234567890/resourceGroups/my-app-rg/providers/Microsoft.Network/frontDoors/my-afd",
  name: "my-afd",
  type: "Microsoft.Network/frontDoors",
  location: "Global",
  properties: {
    frontDoorId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    frontDoorName: "my-afd",
    frontendEndpoints: ["my-afd.azurefd.net"],
  },
};

export function getMockNetworkingState(): NetworkingState {
  return {
    site: mockSite,
    siteConfig: mockSiteConfig,
    vnetIntegration: mockVnetIntegration,
    subnet: mockSubnet,
    natGateway: mockNatGateway,
    hybridConnections: mockHybridConnections,
    serverFarm: mockServerFarm,
    frontDoor: mockFrontDoor,
    dnsConfig: null,
    isLoading: false,
  };
}
