import { motion } from "motion/react";
import {
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  Truck,
  Clock,
  FileText,
  MapPinned,
} from "lucide-react";
import { OrderResponse, OrderResponseDetails, ShipmentStatus, ShipmentStatusString, ZoneResponseDetails } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useAuth, UserRole } from "../contexts/AuthContext";
import { shipmentsAPI, zonesAPI } from "@/services/api";
import { useEffect, useState } from "react";

interface ShipmentDetailsModalProps {
  shipment: Partial<OrderResponse> | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export function ShipmentDetailsModal({
  shipment,
  isOpen,
  onClose,
  onUpdateStatus,
}: ShipmentDetailsModalProps) {
  const { role } = useAuth();


  const [shipmentDetails, setShipmentDetails] = useState<OrderResponseDetails>({} as OrderResponseDetails);
  const [zoneDetails, setZoneDetails] = useState<ZoneResponseDetails>({} as ZoneResponseDetails);
  const populateShipmentDetails = async (id: string) => {
    try {
      const response = await shipmentsAPI.getById(id)
      if (response.zoneId) {
        try {
          const zoneResponse = await zonesAPI.getById(response.zoneId as number)
          setZoneDetails(zoneResponse as ZoneResponseDetails)
        } catch (error) {
          console.error("Error fetching zone details:", error);
        }
      };


      setShipmentDetails(response as OrderResponseDetails)
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log(shipment);

    populateShipmentDetails(shipment?.id as string)
  }, [isOpen, shipment?.id])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      picked_up:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      in_transit:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      returned:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canUpdateStatus = role === UserRole.agent || UserRole.Admin;

  const getStatusFlow = (currentStatus: ShipmentStatusString | undefined) => {
    const baseFlow = [
      ShipmentStatusString.New,
      ShipmentStatusString.InPickupStage,
      ShipmentStatusString.InWarehouse,
      ShipmentStatusString.DeliveredToAgent,
    ];

    if (!currentStatus) return [...baseFlow, ShipmentStatusString.Delivered];

    // Happy path statuses
    if (baseFlow.includes(currentStatus) || currentStatus === ShipmentStatusString.Delivered) {
      return [...baseFlow, ShipmentStatusString.Delivered];
    }

    // Alternative terminal statuses
    return [...baseFlow, currentStatus];
  };

  const statusFlow = getStatusFlow(shipmentDetails?.statusOrder?.toString() as ShipmentStatusString);
  const currentStatusIndex = statusFlow.indexOf(
    shipmentDetails?.statusOrder?.toString() as ShipmentStatusString
  );

  const displayValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[70vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="w-6 h-6" />
              Shipment Details
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            View detailed information about shipment {shipmentDetails.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {/* Tracking Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-blue-100">Tracking Number</p>
                <p className="text-2xl font-mono">{shipmentDetails.id}</p>
              </div>
              <Badge
                className={`${getStatusColor(
                  shipmentDetails.statusOrder?.toString() as ShipmentStatus
                )} text-center px-4 py-2`}

              >
                {shipmentDetails.statusOrder?.toString().replace("_", " ").toUpperCase() || 'N/A'}
                <br />
                Created by : {shipmentDetails.userCreateName}
              </Badge>
            </div>
          </motion.div>

          {/* Status Timeline */}
          <div>
            <h3 className="text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Delivery Progress
            </h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />
              {statusFlow.map((status, index) => (
                <div
                  key={status}
                  className="flex flex-col items-center z-10 relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStatusIndex
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      }`}
                  >
                    {index < currentStatusIndex ? "✓" : index + 1}
                  </motion.div>
                  <p className="text-xs mt-2 text-center capitalize">
                    {status.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seller Information */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <User className="w-4 h-4" />
                Seller Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Name</span>
                  <p>{displayValue(shipmentDetails.sellerName)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Created By</span>
                  <p>{displayValue(shipmentDetails.userCreateName)}</p>
                </div>
              </div>
            </motion.div>

            {/* Client Information */}
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <User className="w-4 h-4" />
                Client Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Name</span>
                  <p>{displayValue(shipmentDetails.clientName)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Phone 1</span>
                    <p>{displayValue(shipmentDetails.phone1)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Phone 2</span>
                    <p>{displayValue(shipmentDetails.phone2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Information */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Address</span>
                  <p>{displayValue(shipmentDetails.address)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Building No.</span>
                    <p>{displayValue(shipmentDetails.bulidingNumber)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Apartment No.</span>
                    <p>{displayValue(shipmentDetails.apartmentNumber)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Region</span>
                    <p>{displayValue(shipmentDetails.regionName)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Country</span>
                    <p>{displayValue(shipmentDetails.country)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Delivery Fee</span>
              </div>
              <p className="font-mono font-semibold">{shipment?.deliveryCost || 'N/A'}<span className="text-xs">EGP</span></p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Order Fee</span>
              </div>
              <p className="font-mono font-semibold">{shipment?.productPrice || 'N/A'}<span className="text-xs">EGP</span></p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Total Price</span>
              </div>
              <p className="font-mono font-semibold">{shipment?.totalPrice || 'N/A'}<span className="text-xs">EGP</span></p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <Truck className="w-4 h-4" />
                <span className="text-xs">Agent</span>
              </div>
              <p className="text-sm font-medium truncate" title={shipmentDetails.agentName || ''}>{displayValue(shipmentDetails.agentName)}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <MapPinned className="w-4 h-4" />
                <span className="text-xs">Zone</span>
              </div>
              <p className="text-sm font-medium">{displayValue(zoneDetails.name)}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <MapPinned className="w-4 h-4" />
                <span className="text-xs">In Pickup</span>
              </div>
              <p className="text-sm font-medium">{shipmentDetails.inPickupStage ? "Yes" : "No"}</p>
            </div>
          </motion.div>

          {/* Dates Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm"
          >
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Created</span>
              </div>
              <p className="font-medium">{formatDate(shipmentDetails.dateCreated)}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">In Pickup</span>
              </div>
              <p className="font-medium">{shipmentDetails.inPickupStage ? formatDate(shipmentDetails.inPickupStage) : 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">In Warehouse</span>
              </div>
              <p className="font-medium">{shipmentDetails.inWarehouseDate ? formatDate(shipmentDetails.inWarehouseDate) : 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Delivered to Agent</span>
              </div>
              <p className="font-medium">{shipmentDetails.delivered_Agent_date ? formatDate(shipmentDetails.delivered_Agent_date) : 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Delivered</span>
              </div>
              <p className="font-medium">{shipmentDetails.delivered_date ? formatDate(shipmentDetails.delivered_date) : 'N/A'}</p>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Notes</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {displayValue(shipmentDetails.notes)}
            </p>
          </motion.div>

          {/* Items */}
          {shipmentDetails.items && shipmentDetails.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" />
                Items
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {shipmentDetails.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          {canUpdateStatus && shipment?.statusOrder !== ShipmentStatusString.Delivered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800"
            >
              {/* Action buttons can be added here */}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
