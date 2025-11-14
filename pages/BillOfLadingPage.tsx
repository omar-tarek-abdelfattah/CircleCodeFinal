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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Shipment } from '../types';
import { getStatusLabel, getStatusColor } from '../lib/statusUtils';

interface BillOfLadingPageProps {
  shipment: Shipment | null;
  onBack: () => void;
}

export function BillOfLadingPage({ shipment, onBack }: BillOfLadingPageProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl mb-2">No shipment data available</h2>
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalAmount = shipment.price + shipment.commission;

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
                <h1 className="text-2xl">Bill of Lading</h1>
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
              BILL OF LADING
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 print:text-black">
              Shipment Receipt & Delivery Document
            </p>
          </motion.div>

          {/* Tracking & Status Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-slate-200 dark:border-slate-700 print:border-black">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 print:text-black">
                      <Hash className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wide">Tracking Number</span>
                    </div>
                    <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 print:text-black">
                      {shipment.trackingNumber}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 print:text-black">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wide">Created Date</span>
                    </div>
                    <p className="text-xl">
                      {formatDate(shipment.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 print:text-black">
                      <Package className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wide">Status</span>
                    </div>
                    <Badge className={`${getStatusColor(shipment.status)} text-lg px-4 py-2 print:bg-gray-200 print:text-black`}>
                      {getStatusLabel(shipment.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sender & Recipient Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Sender Information */}
            <Card className="border-2 border-green-200 dark:border-green-700 print:border-black">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400 print:text-black">
                  <Building2 className="w-6 h-6" />
                  <h2 className="text-2xl">SENDER (MERCHANT)</h2>
                </div>
                <Separator className="mb-4 print:border-black" />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                      Name
                    </p>
                    <p className="text-2xl mt-1">{shipment.sender.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                      Phone
                    </p>
                    <p className="text-xl mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {shipment.sender.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                      Address
                    </p>
                    <p className="text-lg mt-1 flex items-start gap-2">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                      <span>{shipment.sender.address}</span>
                    </p>
                  </div>
                  {shipment.branch && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                        Branch / Store
                      </p>
                      <p className="text-xl mt-1">{shipment.branch}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card className="border-2 border-purple-200 dark:border-purple-700 print:border-black">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 print:text-black">
                  <User className="w-6 h-6" />
                  <h2 className="text-2xl">RECIPIENT (CUSTOMER)</h2>
                </div>
                <Separator className="mb-4 print:border-black" />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                      Name
                    </p>
                    <p className="text-2xl mt-1">{shipment.recipient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                      Phone
                    </p>
                    <p className="text-xl mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {shipment.recipient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                      Delivery Address
                    </p>
                    <p className="text-lg mt-1 flex items-start gap-2">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                      <span>{shipment.recipient.address}</span>
                    </p>
                  </div>
                  {shipment.zone && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                        Zone
                      </p>
                      <p className="text-xl mt-1">{shipment.zone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Delivery Agent Section */}
          {shipment.assignedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-orange-200 dark:border-orange-700 print:border-black">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-orange-600 dark:text-orange-400 print:text-black">
                    <Truck className="w-6 h-6" />
                    <h2 className="text-2xl">DELIVERY AGENT</h2>
                  </div>
                  <Separator className="mb-4 print:border-black" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                        Agent Name
                      </p>
                      <p className="text-2xl mt-1">{shipment.assignedAgent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                        Phone
                      </p>
                      <p className="text-xl mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {shipment.assignedAgent.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                        Agent ID
                      </p>
                      <p className="text-xl mt-1 font-mono">{shipment.assignedAgent.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Financial Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-blue-200 dark:border-blue-700 print:border-black bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 print:bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 print:text-black">
                  <DollarSign className="w-6 h-6" />
                  <h2 className="text-2xl">FINANCIAL DETAILS</h2>
                </div>
                <Separator className="mb-6 print:border-black" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                    <span className="text-xl text-slate-600 dark:text-slate-400 print:text-black">
                      Product Cost
                    </span>
                    <span className="text-3xl font-mono font-semibold">
                      ${shipment.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                    <span className="text-xl text-slate-600 dark:text-slate-400 print:text-black">
                      Delivery Fee
                    </span>
                    <span className="text-3xl font-mono font-semibold">
                      ${shipment.commission.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="print:border-black" />
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-lg print:bg-gray-300">
                    <span className="text-2xl text-white print:text-black">
                      TOTAL AMOUNT
                    </span>
                    <span className="text-4xl font-mono font-bold text-white print:text-black">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Information */}
          {shipment.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700 print:border-black">
                <CardContent className="p-6">
                  <h2 className="text-2xl mb-4">NOTES & INSTRUCTIONS</h2>
                  <Separator className="mb-4 print:border-black" />
                  <p className="text-lg text-slate-700 dark:text-slate-300 print:text-black whitespace-pre-wrap">
                    {shipment.notes}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Footer / Signatures Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 print:pt-16"
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                Sender Signature
              </p>
              <div className="border-b-2 border-slate-300 dark:border-slate-700 h-20 print:border-black"></div>
              <p className="text-xs text-slate-500 dark:text-slate-500 print:text-black">
                Date: _______________
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide print:text-black">
                Recipient Signature
              </p>
              <div className="border-b-2 border-slate-300 dark:border-slate-700 h-20 print:border-black"></div>
              <p className="text-xs text-slate-500 dark:text-slate-500 print:text-black">
                Date: _______________
              </p>
            </div>
          </motion.div>

          {/* Document Footer */}
          <div className="text-center pt-8 border-t-2 border-slate-200 dark:border-slate-800 print:border-black">
            <p className="text-sm text-slate-500 dark:text-slate-500 print:text-black">
              This document serves as proof of shipment and delivery agreement.
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
