import { ShipmentStatus } from '../types';

// All available statuses (admin only)
export const ALL_STATUSES: ShipmentStatus[] = [
  'new',
  'in_pickup_stage',
  'in_warehouse',
  'delivered_to_agent',
  'delivered',
  'postponed',
  'customer_unreachable',
  'rejected_no_shipping_fees',
  'rejected_with_shipping_fees',
  'canceled_by_merchant',
  'partially_delivered',
  'rejected_by_us',
  'returned',
];

// Limited statuses for seller role
export const SELLER_STATUSES: ShipmentStatus[] = [
  'new',
  'in_pickup_stage',
  'in_warehouse',
  'delivered_to_agent',
  'delivered',
  'returned',
];

// Limited statuses for agent role
export const AGENT_STATUSES: ShipmentStatus[] = [
  'in_pickup_stage',
  'delivered_to_agent',
  'delivered',
  'postponed',
  'customer_unreachable',
  'partially_delivered',
  'returned',
];

// Get status label (human-readable)
export const getStatusLabel = (status: ShipmentStatus): string => {
  const labels: Record<ShipmentStatus, string> = {
    new: 'New',
    in_pickup_stage: 'In Pickup Stage',
    in_warehouse: 'In Warehouse',
    delivered_to_agent: 'Delivered To Agent',
    delivered: 'Delivered',
    postponed: 'Postponed',
    customer_unreachable: 'Customer Unreachable',
    rejected_no_shipping_fees: 'Rejected No Shipping Fees',
    rejected_with_shipping_fees: 'Rejected With Shipping Fees',
    canceled_by_merchant: 'Canceled By Merchant',
    partially_delivered: 'Partially Delivered',
    rejected_by_us: 'Rejected By Us',
    returned: 'Returned',
  };
  return labels[status] || status;
};

// Get status color
export const getStatusColor = (status: ShipmentStatus): string => {
  const colors: Record<ShipmentStatus, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_pickup_stage: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    in_warehouse: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered_to_agent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    postponed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    customer_unreachable: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    rejected_no_shipping_fees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    rejected_with_shipping_fees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    canceled_by_merchant: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    partially_delivered: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    rejected_by_us: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    returned: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
};

// Get available statuses based on user role
export const getAvailableStatuses = (role: 'admin' | 'seller' | 'agent'): ShipmentStatus[] => {
  switch (role) {
    case 'admin':
      return ALL_STATUSES;
    case 'seller':
      return SELLER_STATUSES;
    case 'agent':
      return AGENT_STATUSES;
    default:
      return ALL_STATUSES;
  }
};

// Check if a status is in-progress
export const isInProgressStatus = (status: ShipmentStatus): boolean => {
  return [
    'in_pickup_stage',
    'in_warehouse',
    'delivered_to_agent',
    'postponed',
    'customer_unreachable',
    'partially_delivered',
  ].includes(status);
};

// Check if a status is completed/delivered
export const isCompletedStatus = (status: ShipmentStatus): boolean => {
  // Exclude all rejected, returned, and canceled statuses
  const excludedStatuses = [
    'rejected_no_shipping_fees',
    'rejected_with_shipping_fees',
    'rejected_by_us',
    'canceled_by_merchant',
    'returned',
  ];
  
  return !excludedStatuses.includes(status) && status === 'delivered';
};

// Check if a status is rejected/cancelled
export const isRejectedStatus = (status: ShipmentStatus): boolean => {
  return [
    'rejected_no_shipping_fees',
    'rejected_with_shipping_fees',
    'canceled_by_merchant',
    'rejected_by_us',
    'returned',
  ].includes(status);
};