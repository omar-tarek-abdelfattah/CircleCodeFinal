import { useRef, useState } from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { OrderResponseDetails } from '../types';
import { BillOfLadingTemplate } from '../components/BillOfLadingTemplate';

interface BillOfLadingPageProps {
  shipment: OrderResponseDetails | null;
  onBack: () => void;
}

export function BillOfLadingPage({ shipment, onBack }: BillOfLadingPageProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!printRef.current) {
      console.error('Printable content reference is not available.');
      return;
    }

    try {
      setIsDownloading(true);
      toast.info('Generating PDF...');

      const jsPDFModule = await import('jspdf');
      // @ts-ignore - Handle different module formats for compatibility
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;

      if (typeof jsPDF !== 'function') {
        throw new Error('jsPDF constructor not found in module');
      }
      const { default: html2canvas } = await import('html2canvas');

      const input = printRef.current;
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        onclone: (clonedDoc) => {
          // Remove all external stylesheets to prevent oklch parsing errors
          const links = clonedDoc.getElementsByTagName('link');
          Array.from(links).forEach(link => link.remove());

          // Remove all style tags except our custom one (identified by a unique comment or class content)
          const styles = clonedDoc.getElementsByTagName('style');
          Array.from(styles).forEach(style => {
            if (!style.innerHTML.includes('.invoice-container')) {
              style.remove();
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`bill_of_lading_${shipment?.id || 'document'}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-gray-100 min-h-screen pb-10">
      {/* Header with Actions - Hidden in Print */}
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
              <h1 className="text-xl font-semibold">Bill of Lading Preview</h1>
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
                disabled={isDownloading}
                className="gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="flex justify-center print:block print:m-0">
        <div ref={printRef} className="w-full max-w-[210mm]">
          <BillOfLadingTemplate shipment={shipment} />
        </div>
      </div>
    </div>
  );
}
