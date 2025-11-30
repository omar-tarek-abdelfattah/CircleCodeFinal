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

      const { default: jsPDF } = await import('jspdf');
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const itemsTotal = shipment.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const grandTotal = shipment.price;
  const calculatedShipping = grandTotal > itemsTotal ? grandTotal - itemsTotal : 0;


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
        <div
          ref={printRef}
          className="invoice-container"
          dir="rtl"
        >
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
              
              .invoice-container {
                background-color: #ffffff;
                padding: 20px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                width: 100%;
                max-width: 210mm;
                font-family: 'Noto Naskh Arabic', Tahoma, Arial, sans-serif;
                color: #000000;
                text-align: right;
                box-sizing: border-box;
              }

              .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
              }

              .invoice-title {
                color: #0b5ed7;
                margin: 0;
                font-size: 18px;
                font-weight: bold;
              }

              .invoice-meta {
                text-align: left;
                font-size: 14px;
                color: #000000;
              }
              
              .invoice-meta p {
                margin: 0;
                margin-bottom: 2px;
              }

              .invoice-row {
                display: flex;
                gap: 12px;
                margin-bottom: 10px;
              }

              .invoice-col {
                flex: 1;
                border: 1px solid #e5e7eb;
                padding: 8px;
                border-radius: 4px;
                background-color: #f9fafb;
              }

              .invoice-section-title {
                margin: 0;
                margin-bottom: 4px;
                font-size: 14px;
                font-weight: bold;
                color: #1f2937;
              }

              .invoice-text {
                margin: 2px 0;
                font-size: 14px;
                color: #000000;
              }

              .invoice-section {
                border: 1px solid #e5e7eb;
                padding: 8px;
                border-radius: 4px;
                background-color: #f9fafb;
                margin-bottom: 10px;
              }

              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 4px;
              }

              .invoice-th {
                border: 1px solid #d1d5db;
                padding: 4px;
                font-size: 12px;
                background-color: #f3f4f6;
                color: #000000;
                font-weight: bold;
              }

              .invoice-td {
                border: 1px solid #d1d5db;
                padding: 4px;
                font-size: 12px;
                color: #000000;
              }

              .invoice-totals {
                text-align: left;
                margin-top: 8px;
                font-size: 14px;
                font-weight: bold;
                color: #000000;
              }
              
              .invoice-totals p {
                margin: 2px 0;
              }

              @media print {
                @page {
                  size: auto;
                  margin: 5mm;
                }
                body {
                  background: white;
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .invoice-container {
                  width: 100% !important;
                  max-width: none !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                }
                .invoice-col, .invoice-section {
                  break-inside: avoid;
                }
                tr, td, th {
                  break-inside: avoid;
                }
              }
            `}
          </style>

          {/* Header */}
          <div className="invoice-header">
            <h2 className="invoice-title">بوليصة شحن - Circle Code</h2>
            <div className="invoice-meta">
              <p><b>رقم الطلب:</b> {shipment.id}</p>
              <p><b>تاريخ الإنشاء:</b> {formatDate(shipment.dateCreated)}</p>
            </div>
          </div>

          {/* Client & Seller Info */}
          <div className="invoice-row">
            {/* Client Info */}
            <div className="invoice-col">
              <h3 className="invoice-section-title">بيانات العميل</h3>
              <p className="invoice-text"><b>الاسم:</b> <span>{shipment.clientName || 'N/A'}</span></p>
              <p className="invoice-text"><b>العنوان:</b> <span>{shipment.address || 'N/A'}</span></p>
              <p className="invoice-text"><b>المدينة/المنطقة:</b> <span>{shipment.regionName || 'N/A'}</span></p>
              <p className="invoice-text"><b>الدولة:</b> <span>{'مصر'}</span></p>
              <p className="invoice-text"><b>ملاحظات:</b> <span>{shipment.notes || 'لا يوجد'}</span></p>
            </div>

            {/* Seller Info */}
            <div className="invoice-col">
              <h3 className="invoice-section-title">بيانات البائع (الراسل)</h3>
              <p className="invoice-text"><b>البائع:</b> <span>{shipment.sellerName || 'N/A'}</span></p>
              <p className="invoice-text"><b>هاتف:</b> <span>{shipment.phone1 || 'N/A'}</span></p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="invoice-section">
            <h3 className="invoice-section-title">تفاصيل التوصيل</h3>
            <p className="invoice-text"><b>اسم المندوب:</b> <span>{shipment.agentName || 'غير معين'}</span></p>
            <p className="invoice-text"><b>رقم المندوب:</b> <span>N/A</span></p>
            <p className="invoice-text"><b>في مرحلة الاستلام:</b> <span>{shipment.inPickupStage ? formatDate(shipment.inPickupStage) : 'N/A'}</span></p>
            <p className="invoice-text"><b>حالة الطلب:</b> <span>{shipment.statusOrder?.replace(/_/g, ' ') || 'N/A'}</span></p>
          </div>

          {/* Products Table */}
          <div className="invoice-section">
            <h3 className="invoice-section-title">المنتجات</h3>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="invoice-th" style={{ textAlign: 'right' }}>الاسم</th>
                  <th className="invoice-th" style={{ textAlign: 'right' }}>الوصف</th>
                  <th className="invoice-th" style={{ textAlign: 'center' }}>الكمية</th>
                  <th className="invoice-th" style={{ textAlign: 'center' }}>السعر</th>
                  <th className="invoice-th" style={{ textAlign: 'center' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items && shipment.items.length > 0 ? (
                  shipment.items.map((item, index) => (
                    <tr key={index}>
                      <td className="invoice-td" style={{ textAlign: 'right' }}>{item.name}</td>
                      <td className="invoice-td" style={{ textAlign: 'right' }}>{item.description || '-'}</td>
                      <td className="invoice-td" style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td className="invoice-td" style={{ textAlign: 'center' }}>{item.price}</td>
                      <td className="invoice-td" style={{ textAlign: 'center' }}>{item.price * item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="invoice-td" style={{ textAlign: 'center' }}>لا توجد منتجات</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="invoice-totals">
              <p>إجمالي المنتجات: <span>{itemsTotal}</span> ج.م</p>
              <p>سعر الشحن: <span>{calculatedShipping}</span> ج.م</p>
              <p>الإجمالي الكلي: <span>{grandTotal}</span> ج.م</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
