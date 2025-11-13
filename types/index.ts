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

export interface Shipment {
  id: string;
  trackingNumber: string;
  sender: {
    name: string;
    phone: string;
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
  color: string;
  position?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
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
  email: "string",
  name: "string",
  token: "string"
}