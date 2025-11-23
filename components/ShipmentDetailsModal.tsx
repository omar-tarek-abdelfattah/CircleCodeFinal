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
} from "lucide-react";
import { OrderResponse, OrderResponseDetails, ShipmentStatus, ShipmentStatusString } from "../types";
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
import { shipmentsAPI } from "@/services/api";
import { useEffect, useState } from "react";

interface ShipmentDetailsModalProps {
  shipment: OrderResponse | null;
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
  const populateShipmentDetails = async (id: string) => {
    try {
      const response = await shipmentsAPI.getById(id)
      setShipmentDetails(response as OrderResponseDetails)
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      return null;
    }
  };

  useEffect(() => { populateShipmentDetails(shipment?.id as string) }, [isOpen, shipment?.id])

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

  const statusFlow = ["pending", "picked_up", "in_transit", "delivered"];
  const currentStatusIndex = statusFlow.indexOf(
    shipmentDetails?.statusOrder?.toString() as ShipmentStatusString
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                )} text-base px-4 py-2`}
              >
                {shipmentDetails.statusOrder?.toString().replace("_", " ").toUpperCase()}
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

          {/* Sender & Recipient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <h3 className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                Seller Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>{shipmentDetails?.sellerName}</p>
                {/* <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{shipmentDetails?.sellerPhone}</span>
                </div> */}
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{shipmentDetails.sellerName}</span>
                </div>
              </div>
            </motion.div>

            {/* Recipient */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <h3 className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                Client Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>{shipmentDetails.clientName}</p>
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{shipmentDetails.phone1}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{shipmentDetails.address}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Shipment Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Price</span>
              </div>
              <p className="font-mono">${shipmentDetails.price?.toFixed(2) || NaN}</p>
            </div>





            {shipmentDetails.agentName && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs">Agent</span>
                </div>
                <p className="text-sm">{shipmentDetails.agentName}</p>
              </div>
            )}
          </motion.div>

          {/* Additional Info */}
          {shipmentDetails.notes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-sm">Description</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {shipmentDetails.notes}
              </p>
            </motion.div>
          )}

          {/* Dates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
          >
            <div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Created</span>
              </div>
              <p>{formatDate(shipmentDetails.dateCreated)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Last Updated</span>
              </div>
              <p>{formatDate(shipmentDetails.delivered_Agent_date ||
                shipmentDetails.inWarehouseDate ||
                shipmentDetails.delivered_Agent_date ||
                shipmentDetails.dateCreated)}</p>
            </div>
            {/* {shipmentDetails.estimatedDelivery && (
              <div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Estimated Delivery</span>
                </div>
                <p>{formatDate(shipment.estimatedDelivery)}</p>
              </div>
            )} */}
          </motion.div>

          {/* Actions */}
          {canUpdateStatus && shipment?.statusOrder !== ShipmentStatusString.Delivered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800"
            >
              {/* {currentStatusIndex < statusFlow.length - 1 && (
                <Button
                  onClick={() =>
                    onUpdateStatus?.(
                      shipment.id,
                      statusFlow[currentStatusIndex + 1] as string
                    )
                  }
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Mark as {statusFlow[currentStatusIndex + 1]?.replace("_", " ")}
                </Button>
              )} */}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
