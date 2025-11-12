import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Printer, 
  Download,
  Package,
  MapPin,
  User,
  Phone,
  Building2,
  Truck,
  DollarSign,
  Calendar,
  Hash,
  ArrowLeft,
  Weight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Shipment } from '../types';
import { getStatusLabel, getStatusColor } from '../lib/statusUtils';

interface BulkBillOfLadingPageProps {
  shipments: Shipment[];
  onBack: () => void;
}

export function BulkBillOfLadingPage({ shipments, onBack }: BulkBillOfLadingPageProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!shipments || shipments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl mb-2">No shipments selected</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please select at least one shipment to print the Bill of Lading.
          </p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Generate PDF
    console.log('Download PDF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateLong = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate totals
  const totalShipments = shipments.length;
  const totalProductCost = shipments.reduce((sum, s) => sum + s.price, 0);
  const totalDeliveryCost = shipments.reduce((sum, s) => sum + s.commission, 0);
  const totalAmount = totalProductCost + totalDeliveryCost;
  const totalWeight = shipments.reduce((sum, s) => sum + (s.weight || 0), 0);

  // Get unique sellers and agents
  const uniqueSellers = Array.from(new Set(shipments.map(s => s.sender.name)));
  const uniqueAgents = Array.from(
    new Set(
      shipments
        .filter(s => s.assignedAgent)
        .map(s => s.assignedAgent!.name)
    )
  );

  return (
    <div className="w-full">
      {/* Header with Actions */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl">Bulk Bill of Lading</h1>
                <Badge className="ml-2 bg-blue-600 text-white">
                  {totalShipments} {totalShipments === 1 ? 'Order' : 'Orders'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-8">
        <div ref={printRef} className="space-y-6 bg-white dark:bg-slate-900 print:bg-white">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center border-b-4 border-blue-600 pb-6 print:border-black"
          >
            <h1 className="text-5xl mb-2 text-blue-600 dark:text-blue-400 print:text-black">
              BULK BILL OF LADING
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 print:text-black">
              Combined Shipment Receipt & Delivery Document
            </p>
            <p className="text-lg mt-2 text-slate-500 dark:text-slate-500 print:text-black">
              {totalShipments} {totalShipments === 1 ? 'Shipment' : 'Shipments'}
            </p>
          </motion.div>

          {/* Summary Totals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-blue-200 dark:border-blue-700 print:border-black bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 print:bg-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 print:text-black">
                  <TrendingUp className="w-6 h-6" />
                  <h2 className="text-2xl">SUMMARY TOTALS</h2>
                </div>
                <Separator className="mb-6 print:border-black" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-slate-600 dark:text-slate-400 print:text-black" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 print:text-black">
                        Total Shipments
                      </span>
                    </div>
                    <p className="text-3xl font-bold">{totalShipments}</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400 print:text-black" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 print:text-black">
                        Product Cost
                      </span>
                    </div>
                    <p className="text-3xl font-bold font-mono">${totalProductCost.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-slate-600 dark:text-slate-400 print:text-black" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 print:text-black">
                        Delivery Cost
                      </span>
                    </div>
                    <p className="text-3xl font-bold font-mono">${totalDeliveryCost.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-lg print:bg-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-white print:text-black" />
                      <span className="text-sm text-white print:text-black">
                        Total Amount
                      </span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-white print:text-black">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                {totalWeight > 0 && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                    <div className="flex items-center gap-2">
                      <Weight className="w-5 h-5 text-slate-600 dark:text-slate-400 print:text-black" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 print:text-black">
                        Total Weight:
                      </span>
                      <span className="text-xl font-mono font-semibold">
                        {totalWeight.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sellers and Agents Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border-2 border-green-200 dark:border-green-700 print:border-black">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400 print:text-black">
                  <Building2 className="w-6 h-6" />
                  <h2 className="text-xl">SELLERS ({uniqueSellers.length})</h2>
                </div>
                <Separator className="mb-4 print:border-black" />
                <ul className="space-y-2">
                  {uniqueSellers.map((seller, index) => (
                    <li key={index} className="text-lg">
                      • {seller}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {uniqueAgents.length > 0 && (
              <Card className="border-2 border-orange-200 dark:border-orange-700 print:border-black">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-orange-600 dark:text-orange-400 print:text-black">
                    <Truck className="w-6 h-6" />
                    <h2 className="text-xl">ASSIGNED AGENTS ({uniqueAgents.length})</h2>
                  </div>
                  <Separator className="mb-4 print:border-black" />
                  <ul className="space-y-2">
                    {uniqueAgents.map((agent, index) => (
                      <li key={index} className="text-lg">
                        • {agent}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Shipments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-slate-200 dark:border-slate-700 print:border-black">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 print:text-black" />
                  <h2 className="text-2xl">SHIPMENT DETAILS</h2>
                </div>
                <Separator className="mb-4 print:border-black" />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-slate-300 dark:border-slate-700 print:border-black">
                        <TableHead className="text-left print:text-black">#</TableHead>
                        <TableHead className="print:text-black">TRACKING ID</TableHead>
                        <TableHead className="print:text-black">CUSTOMER</TableHead>
                        <TableHead className="print:text-black">MERCHANT</TableHead>
                        <TableHead className="print:text-black">AGENT</TableHead>
                        <TableHead className="print:text-black">DATE</TableHead>
                        <TableHead className="print:text-black">ZONE</TableHead>
                        <TableHead className="text-right print:text-black">PRODUCT</TableHead>
                        <TableHead className="text-right print:text-black">DELIVERY</TableHead>
                        <TableHead className="text-right print:text-black">TOTAL</TableHead>
                        <TableHead className="print:text-black">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipments.map((shipment, index) => {
                        const orderTotal = shipment.price + shipment.commission;
                        return (
                          <TableRow 
                            key={shipment.id}
                            className="border-b border-slate-200 dark:border-slate-800 print:border-black"
                          >
                            <TableCell className="font-semibold print:text-black">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-mono text-sm print:text-black">
                              {shipment.trackingNumber}
                            </TableCell>
                            <TableCell className="print:text-black">
                              <div>
                                <p className="font-semibold">{shipment.recipient.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 print:text-black">
                                  {shipment.recipient.phone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="print:text-black">
                              <div>
                                <p className="font-semibold">{shipment.sender.name}</p>
                                {shipment.branch && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 print:text-black">
                                    {shipment.branch}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="print:text-black">
                              {shipment.assignedAgent?.name || (
                                <span className="text-slate-400 print:text-black">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm print:text-black">
                              {formatDate(shipment.createdAt)}
                            </TableCell>
                            <TableCell className="print:text-black">
                              {shipment.zone || '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono print:text-black">
                              ${shipment.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono print:text-black">
                              ${shipment.commission.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-blue-600 dark:text-blue-400 print:text-black">
                              ${orderTotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="print:text-black">
                              <Badge 
                                className={`${getStatusColor(shipment.status)} print:bg-gray-200 print:text-black`}
                              >
                                {getStatusLabel(shipment.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Totals Row */}
                      <TableRow className="border-t-2 border-slate-400 dark:border-slate-600 print:border-black bg-slate-50 dark:bg-slate-800/50 print:bg-gray-200">
                        <TableCell colSpan={7} className="text-right font-bold text-lg print:text-black">
                          TOTALS:
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-lg print:text-black">
                          ${totalProductCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-lg print:text-black">
                          ${totalDeliveryCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xl text-blue-600 dark:text-blue-400 print:text-black">
                          ${totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Individual Shipment Cards (for detailed print) */}
          <div className="print:block hidden print:break-before-page">
            <h2 className="text-3xl mb-6 text-center border-b-2 border-black pb-4">
              DETAILED SHIPMENT INFORMATION
            </h2>
            {shipments.map((shipment, index) => (
              <div 
                key={shipment.id} 
                className={`mb-8 pb-8 border-b-2 border-slate-300 ${
                  index < shipments.length - 1 ? 'print:break-after-page' : ''
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-2xl mb-2">
                    Shipment {index + 1} of {totalShipments}
                  </h3>
                  <p className="text-xl font-mono font-bold text-blue-600">
                    {shipment.trackingNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Sender */}
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold mb-2 text-lg">SENDER</h4>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {shipment.sender.name}</p>
                      <p><strong>Phone:</strong> {shipment.sender.phone}</p>
                      <p><strong>Address:</strong> {shipment.sender.address}</p>
                      {shipment.branch && <p><strong>Branch:</strong> {shipment.branch}</p>}
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold mb-2 text-lg">RECIPIENT</h4>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {shipment.recipient.name}</p>
                      <p><strong>Phone:</strong> {shipment.recipient.phone}</p>
                      <p><strong>Address:</strong> {shipment.recipient.address}</p>
                      {shipment.zone && <p><strong>Zone:</strong> {shipment.zone}</p>}
                    </div>
                  </div>
                </div>

                {/* Agent */}
                {shipment.assignedAgent && (
                  <div className="border-2 border-black p-4 mb-6">
                    <h4 className="font-bold mb-2 text-lg">DELIVERY AGENT</h4>
                    <p><strong>Name:</strong> {shipment.assignedAgent.name}</p>
                    <p><strong>ID:</strong> {shipment.assignedAgent.id}</p>
                  </div>
                )}

                {/* Financial */}
                <div className="border-2 border-black p-4 bg-gray-100">
                  <h4 className="font-bold mb-2 text-lg">FINANCIAL DETAILS</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Product Cost:</span>
                      <span className="font-mono font-bold">${shipment.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-mono font-bold">${shipment.commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-black pt-2 text-lg">
                      <span className="font-bold">TOTAL:</span>
                      <span className="font-mono font-bold">
                        ${(shipment.price + shipment.commission).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <p className="text-sm mb-2">Sender Signature</p>
                    <div className="border-b-2 border-black h-16"></div>
                    <p className="text-xs mt-1">Date: _______________</p>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Recipient Signature</p>
                    <div className="border-b-2 border-black h-16"></div>
                    <p className="text-xs mt-1">Date: _______________</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Document Footer */}
          <div className="text-center pt-8 border-t-2 border-slate-200 dark:border-slate-800 print:border-black">
            <p className="text-sm text-slate-500 dark:text-slate-500 print:text-black">
              This document serves as proof of {totalShipments} shipment{totalShipments !== 1 ? 's' : ''} and delivery agreement.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 print:text-black">
              Generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
