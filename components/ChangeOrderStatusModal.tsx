import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { OrderResponse, Shipment, ShipmentStatus, ShipmentStatusString } from '../types';
import { Badge } from './ui/badge';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface ChangeOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipments: OrderResponse[];
  onSuccess?: () => void;
}

// Agent-allowed statuses
const agentAllowedStatuses: { value: ShipmentStatus; label: string }[] = [
  { value: ShipmentStatus.Delivered, label: 'Delivered' },
  { value: ShipmentStatus.Postponed, label: 'Post Pond' },
  { value: ShipmentStatus.CustomerUnreachable, label: 'Customer Unreachable' },
  { value: ShipmentStatus.RejectedNoShippingFees, label: 'Rejected No Shipping Fees' },
  { value: ShipmentStatus.RejectedWithShippingFees, label: 'Rejected With Shipping Fees' },
  { value: ShipmentStatus.PartiallyDelivered, label: 'Partially Delivered' },
  { value: ShipmentStatus.Returned, label: 'Returned' },
];

export function ChangeOrderStatusModal({
  isOpen,
  onClose,
  shipments,
  onSuccess,
}: ChangeOrderStatusModalProps) {
  const [newStatus, setNewStatus] = useState<ShipmentStatusString | ''>('');
  const [loading, setLoading] = useState(false);
  const { notifyStatusChanged } = useNotifications();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    shipments.map(shipment => {
      if (!newStatus || !shipment.statusOrder) {
        toast.error('Please select a status');
        return;
      }

      if (newStatus === shipment.statusOrder) {
        toast.error('Please select a different status');
        return;
      }





    })

    setLoading(true);

    try {
      // TODO: Connect to backend API to change order status
      // await shipmentsAPI.updateStatus(shipment.id, newStatus);

      // TODO: Notify the notification system about the status change
      // notifyStatusChanged(shipment.id, shipment.trackingNumber, shipment.status, newStatus, 'Agent Name');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // const statusLabel = agentAllowedStatuses.find(s => s.value === newStatus)?.label || newStatus;
      // toast.success(`Order status changed to "${statusLabel}" successfully`);

      // Reset form
      setNewStatus('');
      onClose();

      // Refresh the orders list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to change order status:', error);
      toast.error('Failed to change order status');
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: ShipmentStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Change Order Status
          </DialogTitle>
          <DialogDescription>
            Update the status of the selected order.
          </DialogDescription>
        </DialogHeader>

        {shipments?.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Order Information */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">bulk update</p>
                    <p className="font-mono">{shipments.length}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {formatStatus(ShipmentStatus.New)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Customer</p>
                  <p>{shipments[0]?.clientName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{shipments[0]?.clientName}</p>
                </div>
              </div>

              {/* New Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="newStatus">
                  New Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as ShipmentStatusString)}
                  disabled={loading}
                >
                  <SelectTrigger id="newStatus">
                    <SelectValue placeholder="Select New Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentAllowedStatuses.map((status) => (
                      <SelectItem
                        key={status.value}
                        value={status.value}
                        // disabled={status.value === shipments[0]?.statusOrder}
                      >
                        {status.label}
                       'former statuses'
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current status: {formatStatus(shipments[0].statusOrder)}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !newStatus}
                className="bg-gradient-to-r from-green-500 to-teal-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
