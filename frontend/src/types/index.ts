export type DeviceType = "router" | "switch" | "pc" | "server" | "firewall";

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectDetail extends Project {
  devices: Device[];
  address_entries: AddressEntry[];
  links: DeviceLink[];
}

export interface Device {
  id: number;
  project_id: number;
  name: string;
  device_type: DeviceType;
  pos_x: number;
  pos_y: number;
  created_at: string;
}

export interface DeviceLink {
  id: number;
  project_id: number;
  device_a_id: number;
  device_b_id: number;
  link_type: string;
  description?: string;
}

export interface AddressEntry {
  id: number;
  project_id: number;
  device_name: string;
  device_type: DeviceType;
  interface: string;
  ip_address?: string;
  subnet_mask: string;
  gateway?: string;
  vlan?: number;
  description?: string;
}

export interface DeviceConfig {
  device_name: string;
  device_type: DeviceType;
  config_text: string;
}

export interface ProjectConfigOut {
  project_name: string;
  configs: DeviceConfig[];
}

// Form payloads
export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface CreateDevicePayload {
  name: string;
  device_type: DeviceType;
  pos_x?: number;
  pos_y?: number;
}

export interface CreateLinkPayload {
  device_a_id: number;
  device_b_id: number;
  link_type?: string;
}

export interface CreateAddressPayload {
  device_name: string;
  device_type: DeviceType;
  interface: string;
  ip_address?: string;
  subnet_mask?: string;
  gateway?: string;
  vlan?: number;
  description?: string;
}

export interface UpdateAddressPayload {
  device_name?: string;
  interface?: string;
  ip_address?: string;
  subnet_mask?: string;
  gateway?: string;
  vlan?: number;
  description?: string;
}