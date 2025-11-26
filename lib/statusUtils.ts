import { UserRole } from '@/contexts/AuthContext';
import { ShipmentStatusString } from '../types';

// All available statuses (admin only)
export const ALL_STATUSES: ShipmentStatusString[] = [
  ShipmentStatusString.New,
  ShipmentStatusString.InPickupStage,
  ShipmentStatusString.InWarehouse,
  ShipmentStatusString.DeliveredToAgent,
  ShipmentStatusString.Delivered,
  ShipmentStatusString.Postponed,
  ShipmentStatusString.CustomerUnreachable,
  ShipmentStatusString.RejectedNoShippingFees,
  ShipmentStatusString.RejectedWithShippingFees,
  // ShipmentStatusString.CanceledByMerchant,
  ShipmentStatusString.PartiallyDelivered,
  ShipmentStatusString.RejectedByUs,
  ShipmentStatusString.Returned,
];

// Limited statuses for seller role
export const SELLER_STATUSES: ShipmentStatusString[] = [
  ShipmentStatusString.New,
  ShipmentStatusString.InPickupStage,
  ShipmentStatusString.InWarehouse,
  ShipmentStatusString.DeliveredToAgent,
  ShipmentStatusString.Delivered,
  ShipmentStatusString.CustomerUnreachable,
  ShipmentStatusString.PartiallyDelivered,
  ShipmentStatusString.Returned,
];

// Limited statuses for agent role
export const AGENT_STATUSES: ShipmentStatusString[] = [
  ShipmentStatusString.InPickupStage,
  ShipmentStatusString.DeliveredToAgent,
  ShipmentStatusString.Delivered,
  ShipmentStatusString.Postponed,
  ShipmentStatusString.CustomerUnreachable,
  ShipmentStatusString.PartiallyDelivered,
  ShipmentStatusString.Returned,
];

// Get status label (human-readable)
export const getStatusLabel = (status: ShipmentStatusString): string => {
  const labels: Record<ShipmentStatusString, string> = {
    New: 'New',
    InPickupStage: 'In Pickup Stage',
    InWarehouse: 'In Warehouse',
    DeliveredToAgent: 'Delivered To Agent',
    Delivered: 'Delivered',
    Postponed: 'Postponed',
    CustomerUnreachable: 'Customer Unreachable',
    RejectedNoShippingFees: 'Rejected No Shipping Fees',
    RejectedWithShippingFees: 'Rejected With Shipping Fees',
    // CanceledByMerchant: 'Canceled By Merchant',
    PartiallyDelivered: 'Partially Delivered',
    RejectedByUs: 'Rejected By Us',
    Returned: 'Returned',
  };
  return labels[status] || status;
};

// Get status color
export const getStatusColor = (status: ShipmentStatusString): string => {
  const colors: Record<ShipmentStatusString, string> = {
    New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    InPickupStage: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    InWarehouse: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    DeliveredToAgent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Postponed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    CustomerUnreachable: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    RejectedNoShippingFees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    RejectedWithShippingFees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    // CanceledByMerchant: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    PartiallyDelivered: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    RejectedByUs: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    Returned: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
};

// Get available statuses based on user role
export const getAvailableStatuses = (role: UserRole): ShipmentStatusString[] => {
  switch (role) {
    case UserRole.Admin:
      return ALL_STATUSES;
    case UserRole.Seller:
      return SELLER_STATUSES;
    case UserRole.agent:
      return AGENT_STATUSES;
    default:
      return ALL_STATUSES;
  }
};

// Check if a status is in-progress
export const isInProgressStatus = (status: ShipmentStatusString): boolean => {
  return [
    ShipmentStatusString.InPickupStage,
    ShipmentStatusString.InWarehouse,
    ShipmentStatusString.DeliveredToAgent,
    ShipmentStatusString.Postponed,
    ShipmentStatusString.PartiallyDelivered,
  ].includes(status);
};

// Check if a status is completed/delivered
export const isCompletedStatus = (status: ShipmentStatusString): boolean => {
  // Exclude all rejected, returned, and canceled statuses
  const excludedStatuses = [
    'rejected_no_shipping_fees',
    'rejected_with_shipping_fees',
    'rejected_by_us',
    'canceled_by_merchant',
    'returned',
  ];

  return !excludedStatuses.includes(status) && status === ShipmentStatusString.Delivered;
};

// Check if a status is rejected/cancelled
export const isRejectedStatus = (status: ShipmentStatusString): boolean => {
  return [
    'rejected_no_shipping_fees',
    'rejected_with_shipping_fees',
    'canceled_by_merchant',
    'rejected_by_us',
    'returned',
  ].includes(status);
};