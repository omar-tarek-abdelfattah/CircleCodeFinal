// import { UserRole } from "@/contexts/AuthContext";

import { UserRole } from "@/contexts/AuthContext";

export enum ShipmentStatus {
  New = "0",
  InPickupStage = "1",
  InWarehouse = "2",

  DeliveredToAgent = "3",
  Delivered = "4",
  Postponed = "5",
  CustomerUnreachable = "6",
  RejectedNoShippingFees = "7",
  RejectedWithShippingFees = "8",

  PartiallyDelivered = "9",
  RejectedByUs = "10",
  Returned = "11"
}

export enum ShipmentStatusString {
  New = "New",
  InPickupStage = "InPickupStage",
  InWarehouse = "InWarehouse",

  DeliveredToAgent = "DeliveredToAgent",
  Delivered = "Delivered",
  Postponed = "Postponed",
  CustomerUnreachable = "CustomerUnreachable",
  RejectedNoShippingFees = "RejectedNoShippingFees",
  RejectedWithShippingFees = "RejectedWithShippingFees",

  PartiallyDelivered = "PartiallyDelivered",
  RejectedByUs = "RejectedByUs",
  Returned = "Returned"
}

export interface ChangeSateOrdersRequest {
  statusOrder: ShipmentStatus;
  agentId?: number;
  orderIdS: string[];
  cancellednotes?: string;
}


export interface Shipment { // or order
  id: string;
  trackingNumber: string;
  clientName: {
    name: string;
    phone1: string;
    phone2: string;
    address: string;
  };
  recipient: {
    name: string;
    phone: string;
    address: string;
  };
  status: ShipmentStatusString;
  assignedAgent?: {
    id: string;
    name: string;
  };
  branch?: string;
  zone?: string;
  price: number;
  commission: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  weight?: number;
  description?: string;
  notes?: string;
}

export interface OrderRequest {
  clientName: string;
  phone1: string;
  phone2?: string | null;
  apartmentNumber: string;
  address: string;
  zoneId: number;
  regionName: string;
  bulidingNumber: string;
  notes?: string | null;
  items: ItemsRequest[];
  sellerId: number
}
export interface ItemsRequest {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface OrderResponse {
  id: string;
  clientName?: string | null;
  statusOrder?: ShipmentStatusString;
  sellerName?: string | null;
  totalPrice: number;
  regionName?: string | null;
  agentName?: string | null;
  dateCreated: string;

}

export interface OrderResponseDetails {
  id: string;
  clientName?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  dateCreated: string;
  delivered_Agent_date?: string | null;
  inWarehouseDate?: string | null;
  inPickupStage?: string | null;
  apartmentNumber: number;
  delivered_date?: string | null;
  address?: string | null;
  country?: string | null;
  bulidingNumber: number;
  notes?: string | null;
  statusOrder?: ShipmentStatusString;
  items?: ItemRespone[] | null;
  sellerName?: string | null;
  agentName?: string | null;
  userCreateName?: string | null;
  regionName?: string | null;
  price: number;
}

export interface OrderUpdate {
  id: string;
  clientName: string;
  phone1: string;
  phone2?: string | null;
  apartmentNumber: number;
  address: string;
  zoneId: number;
  regionName: string;
  bulidingNumber: number;
  notes?: string | null;
  cancellednotes?: string | null;
  statusOrder: StatusOrderDto;
  items: ItemRespone[];
  sellerId: number;
  agentId?: number | null;
}

export interface OrderRequestSeller {
  clientName: string;
  phone1: string;
  phone2?: string | null;
  apartmentNumber: number;
  address: string;
  zoneId: number;
  regionName: string;
  bulidingNumber: number;
  notes?: string | null;
  items: ItemsRequest[];
}

export interface OrderUpdateAgent {
  id: string;
  statusOrder: ShipmentStatus;
  cancelledNotes?: string | null;
}

export interface OrderUpdateSeller {
  id: string;
  clientName: string;
  phone1: string;
  phone2: string;
  apartmentNumber: number;
  address: string;
  zoneId: number;
  regionName: string;
  bulidingNumber: number;
  notes?: string | null;
  cancelledNotes?: string | null;
  statusOrder: ShipmentStatus;
  items?: ItemRespone[] | null;
  sellerId: number;
  agentId?: number | null;
}




export type StatusOrderDto = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface ItemRespone {
  id: string;
  name?: string | null;
  price: number;
  quantity: number;
  description?: string | null;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

export interface WalletSummary {
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
  pendingAmount: number;
}

export interface DashboardStats {
  totalShipments: number;
  completedShipments: number;
  pendingShipments: number;
  totalRevenue: number;
  activeAgents?: number;
  activeSellers?: number;
}

export interface Agent {
  id: string;
  branshName: string;
  name: string;
  email: string;
  phone: string;
  zone?: string;
  branch?: string;
  activeShipments: number;
  completedShipments: number;
  rating: number;
  joinedDate: string;
  lastAssignmentDate?: string; // When they last received an order
  todayShipments?: number; // Number of shipments assigned today
  status: 'active' | 'inactive';
  deactivationFrom?: string;
  deactivationTo?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName?: string;
  totalShipments: number;
  activeShipments: number;
  walletBalance: number;
  joinedDate: string;
  status: 'active' | 'inactive';
  deactivationFrom?: string;
  deactivationTo?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  country: string;
  city?: string;
  phone: string;
  manager?: string;
  managerId?: string;
  totalOrders: number;
  totalAgents: number;
  businessHours?: string;
  openingTime?: string;
  closingTime?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface NewBranchRequest {
  name: string;
  address: string;
  country: string;
  isActive: boolean;
  managerId: number
  open: string;
  close: string
}

export interface BranchData {
  id: number
  name: string
  ordersNumber: number
  address?: string
  country?: string
  agentsNumber: number
  managerName?: string
  isActive: boolean
}

export interface BranchResponse {
  totalBranch: number
  activeBranchNumber: number
  inactiveBranchNumber: number
  totalOrders: number
  totalAgents: number
  data: BranchData[]
}
export interface BranchResponseDetails {
  id: number,
  name: string,
  ordersNumber: number,
  address: string,
  country: string,
  agentsNumber: number,
  isActive: boolean,
  managerName: string,
  open: string,
  close: string

}

export interface BranchUpdate {
  id: number;
  name: string;
  address: string;
  country: string;
  isActive: boolean;
  managerId: number;
  open: string;
  close: string;
}
export interface ZoneRegion {
  // id: string;
  name: string;
  price: number;
}

export interface ZoneUpdate {
  zoneId: number;
  name: string;
  isActive: boolean;
  regions: RegionUpdate[];
  branchId: number[];
}
export interface RegionUpdate {
  name: string;
  price: number;
}
export interface Zone {
  id: string;
  name: string;
  regions: ZoneRegion[];
  associatedBranches: string[]; // Branch IDs
  orders: number;
  activeAgents?: number;
  status: 'active' | 'inactive';

}
export interface ZoneRequest {
  name: string
  regions: ZoneRegion[]

  branchId: number[]
}
export interface ZoneResponse {
  id: string
  name: string
  noOrders: number
  isActive: boolean
}
export interface ZonesForSellerResponse {
  id: string
  name: string
  regions: RegionDetails[]
}
export interface ZoneResponseDetails {
  id: string
  name: string
  regions: RegionDetails[]
  branchName: string[]
  isActive: boolean
}

export interface RegionDetails {
  name: string;
  price: number;
}



export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  branshName: string[]
  role: UserRole;
  salary: number;
  status: 'active' | 'inactive';
  registrationDate: string;
  avatar?: string;
  deactivationFrom?: string;
  deactivationTo?: string;
}

export type NotificationType =
  | 'order_created'
  | 'order_assigned'
  | 'status_changed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  oldStatus?: ShipmentStatus;
  newStatus?: ShipmentStatus;
  changedBy?: string;
  timestamp: string;
  read: boolean;
}

export interface LoggedInUser {
  email: "string";
  name: "string";
  token: "string";
  role: UserRole;
  id: string
}