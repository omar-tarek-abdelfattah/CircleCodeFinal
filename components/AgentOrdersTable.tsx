import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import { AgiOrderResponse, OrderResponse, Shipment, ShipmentStatusString } from '../types';
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
  shipments: AgiOrderResponse[];
  maxItems?: number;
  onViewDetails?: (shipment: AgiOrderResponse) => void;
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
  const [selectedShipment, setSelectedShipment] = useState<AgiOrderResponse | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const displayShipments = shipments.slice(0, maxItems);

  const handleChangeStatus = (shipment: AgiOrderResponse) => {
    setSelectedShipment(shipment);
    setStatusModalOpen(true);
  };

  const handleStatusChangeSuccess = () => {
    setStatusModalOpen(false);
    if (onStatusChanged) {
      onStatusChanged();
    }
  };

  const getStatusColor = (status: ShipmentStatusString) => {
    const colors: Record<keyof typeof ShipmentStatusString, string> = {
      New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      InPickupStage: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      InWarehouse: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      DeliveredToAgent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Postponed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      CustomerUnreachable: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      RejectedNoShippingFees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      RejectedByUs: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      RejectedWithShippingFees: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      PartiallyDelivered: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      Returned: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
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
                  <TableHead className="bg-slate-50 dark:bg-slate-800/50">Product Price</TableHead>
                  <TableHead className="bg-slate-50 dark:bg-slate-800/50">Delivery Cost</TableHead>
                  <TableHead className="bg-slate-100 dark:bg-slate-800">Total Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
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
                        {shipment.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{shipment.clientName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.statusOrder as unknown as ShipmentStatusString)}>
                          {formatStatus(shipment.statusOrder as unknown as string)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono bg-slate-50 dark:bg-slate-800/50">
                        ${shipment.productPrice?.toFixed(2) || 0}
                      </TableCell>
                      <TableCell className="font-mono bg-slate-50 dark:bg-slate-800/50">
                        ${shipment.deliveryCost?.toFixed(2) || 0}
                      </TableCell>
                      <TableCell className="font-mono bg-slate-100 dark:bg-slate-800">
                        ${shipment.totalPrice?.toFixed(2) || 0}
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
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChangeStatus(shipment)}
                            title="Change Order Status"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button> */}
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
        shipments={selectedShipment as unknown as OrderResponse[]}
        onSuccess={handleStatusChangeSuccess}
      />
    </>
  );
}
