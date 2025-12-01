import { useRef } from 'react';
import {
  Printer,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { OrderResponseDetails } from '../types';
import { BillOfLadingTemplate } from '../components/BillOfLadingTemplate';

interface BulkBillOfLadingPageProps {
  shipments: OrderResponseDetails[];
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

  // Calculate totals
  const totalShipments = shipments.length;

  return (
    <div className="w-full bg-gray-100 min-h-screen pb-10">
      {/* Header with Actions */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden sticky top-0 z-10 mb-6">
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
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center print:block print:m-0">
        <div ref={printRef} className="w-full max-w-[210mm]">
          {shipments.map((shipment, index) => (
            <div
              key={shipment.id}
              className={`bg-white mb-8 print:mb-0 ${index < shipments.length - 1 ? 'print:break-after-page' : ''}`}
            >
              <BillOfLadingTemplate shipment={shipment} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
