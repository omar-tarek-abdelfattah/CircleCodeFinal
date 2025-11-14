import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import { Shipment } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ChangeOrderStatusModal } from './ChangeOrderStatusModal';

interface AgentOrdersTableProps {
  shipments: Shipment[];
  maxItems?: number;
  onViewDetails?: (shipment: Shipment) => void;
  onViewAll?: () => void;
  onStatusChanged?: () => void;
}

export function AgentOrdersTable({
  shipments,
  maxItems = 5,
  onViewDetails,
  onViewAll,
  onStatusChanged,
}: AgentOrdersTableProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const displayShipments = shipments.slice(0, maxItems);

  const handleChangeStatus = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setStatusModalOpen(true);
  };

  const handleStatusChangeSuccess = () => {
    setStatusModalOpen(false);
    if (onStatusChanged) {
      onStatusChanged();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_pickup_stage: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_warehouse: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      delivered_to_agent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      postponed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      customer_unreachable: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      rejected_no_shipping_fees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      rejected_with_shipping_fees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      partially_delivered: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      returned: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Orders
              </CardTitle>
              <CardDescription>Your assigned orders and deliveries</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Package className="w-12 h-12 opacity-20" />
                        <p>No active orders</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayShipments.map((shipment, index) => (
                    <motion.tr
                      key={shipment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{shipment.recipient.name}</p>
                          <p className="text-xs text-slate-500">{shipment.recipient.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {formatStatus(shipment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${shipment.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails?.(shipment)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChangeStatus(shipment)}
                            title="Change Order Status"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Change Status Modal */}
      <ChangeOrderStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        shipment={selectedShipment}
        onSuccess={handleStatusChangeSuccess}
      />
    </>
  );
}
