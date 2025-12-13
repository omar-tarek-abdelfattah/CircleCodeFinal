import { useTranslation } from "react-i18next";
import { motion } from 'motion/react';
import { Package, Eye, Edit, Plus, ArrowRight } from 'lucide-react';
import { OrderResponse, Shipment } from '../types';
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

interface NewShipmentsTableProps {
  shipments: OrderResponse[];
  maxItems?: number;
  onViewDetails?: (shipment: OrderResponse) => void;
  onEditShipment?: (shipment: OrderResponse) => void;
  onAddShipment?: () => void;
  showAddButton?: boolean;
  onViewAll?: () => void;
}

export function NewShipmentsTable({
  shipments,
  maxItems = 5,
  onViewDetails,
  onEditShipment,
  onAddShipment,
  showAddButton = true,
  onViewAll,
}: NewShipmentsTableProps) {
  const { t } = useTranslation();
  const displayShipments = shipments.slice(0, maxItems);
  console.log(displayShipments)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      picked_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[status] || colors.pending;
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t("New Shipments")}
            </CardTitle>
            <CardDescription>{t("Latest 5 shipments added to the system")}</CardDescription>
          </div>
          <div className="flex gap-2">
            {showAddButton && (
              <Button
                onClick={onAddShipment}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Plus className="w-4 h-4" />
                {t("Add Shipment")}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {t("View All")}
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
                <TableHead>{t("TRACKING ID")}</TableHead>
                <TableHead>{t("Customer Name")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Product Price")}</TableHead>
                <TableHead>{t("Delivery Cost")}</TableHead>
                <TableHead>{t("TOTAL AMOUNT")}</TableHead>
                <TableHead className="text-right">{t("ACTIONS")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Package className="w-12 h-12 opacity-20" />
                      <p>No shipments available</p>
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
                    <TableCell>
                      <div>
                        <p>{shipment.id}</p>
                        {/* <p className="text-xs text-slate-500">{shipment.phone}</p> */}
                      </div>
                    </TableCell>
                    {/* <TableCell className="font-mono text-sm">
                      {shipment.trackingNumber}
                    </TableCell> */}
                    <TableCell>
                      <div>
                        <p>{shipment.clientName}</p>
                        {/* <p className="text-xs text-slate-500">{shipment.phone}</p> */}
                      </div>
                    </TableCell>
                    <TableCell>

                      <Badge className={getStatusColor(shipment?.statusOrder as string)}>
                        {t(shipment.statusOrder?.replace('_', ' ').toLowerCase() || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{t("EGP")} {shipment.productPrice}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{t("EGP")} {shipment.deliveryCost}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      <p>{t("EGP")} {shipment.totalPrice.toFixed(2)}</p>
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
                        {onEditShipment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditShipment(shipment)}
                            title="Edit Shipment"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
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
  );
}
