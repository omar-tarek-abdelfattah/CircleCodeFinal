export type ShipmentStatus =
  | 'new'
  | 'in_pickup_stage'
  | 'in_warehouse'
  | 'delivered_to_agent'
  | 'delivered'
  | 'postponed'
  | 'customer_unreachable'
  | 'rejected_no_shipping_fees'
  | 'rejected_with_shipping_fees'
  | 'canceled_by_merchant'
  | 'partially_delivered'
  | 'rejected_by_us'
  | 'returned';

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
  status: ShipmentStatus;
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
  statusOrder?: string | null;
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
  statusOrder?: ShipmentStatus;
  items?: ItemRespone[] | null;
  sellerName?: string | null;
  agentName?: string | null;
  userCreateName?: string | null;
  regionName?: string | null;
  price: number;
}

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

export interface ZoneRegion {
  id: string;
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
  branchId: string
}
export interface ZoneResponseDetails {
  id: string
  name: string
  regions: ZoneRegion[]
  branchName: string
  isActive: boolean
}

export type UserRole = 'admin' | 'seller' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
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