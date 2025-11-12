import * as XLSX from 'xlsx';
import { Shipment, ShipmentStatus } from '../types';
import { getStatusLabel } from './statusUtils';

// Excel column headers (template structure)
export const EXCEL_HEADERS = [
  'Tracking Number',
  'Sender Name',
  'Sender Phone',
  'Sender Address',
  'Recipient Name',
  'Recipient Phone',
  'Recipient Address',
  'Status',
  'Branch',
  'Zone',
  'Price',
  'Delivery Charges',
  'Weight (kg)',
  'Description',
  'Created Date',
  'Estimated Delivery',
  'Agent Name',
  'Notes',
];

// Export shipments to Excel
export const exportShipmentsToExcel = (shipments: Shipment[], filename: string = 'shipments') => {
  try {
    // Convert shipments to Excel format
    const data = shipments.map(shipment => ({
      'Tracking Number': shipment.trackingNumber,
      'Sender Name': shipment.sender.name,
      'Sender Phone': shipment.sender.phone,
      'Sender Address': shipment.sender.address,
      'Recipient Name': shipment.recipient.name,
      'Recipient Phone': shipment.recipient.phone,
      'Recipient Address': shipment.recipient.address,
      'Status': getStatusLabel(shipment.status),
      'Branch': shipment.branch || '',
      'Zone': shipment.zone || '',
      'Price': shipment.price,
      'Delivery Charges': shipment.commission,
      'Weight (kg)': shipment.weight || '',
      'Description': shipment.description || '',
      'Created Date': new Date(shipment.createdAt).toLocaleDateString('en-US'),
      'Estimated Delivery': shipment.estimatedDelivery 
        ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-US') 
        : '',
      'Agent Name': shipment.assignedAgent?.name || 'Unassigned',
      'Notes': '',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const columnWidths = [
      { wch: 18 }, // Tracking Number
      { wch: 20 }, // Sender Name
      { wch: 15 }, // Sender Phone
      { wch: 35 }, // Sender Address
      { wch: 20 }, // Recipient Name
      { wch: 15 }, // Recipient Phone
      { wch: 35 }, // Recipient Address
      { wch: 25 }, // Status
      { wch: 20 }, // Branch
      { wch: 15 }, // Zone
      { wch: 10 }, // Price
      { wch: 15 }, // Delivery Charges
      { wch: 12 }, // Weight
      { wch: 25 }, // Description
      { wch: 15 }, // Created Date
      { wch: 15 }, // Estimated Delivery
      { wch: 20 }, // Agent Name
      { wch: 30 }, // Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fullFilename);

    return { success: true, count: shipments.length };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: 'Failed to export Excel file' };
  }
};

// Download empty template
export const downloadTemplate = () => {
  try {
    // Create empty template with headers only
    const templateData = [
      {
        'Tracking Number': 'CCT1234567890',
        'Sender Name': 'Example Store',
        'Sender Phone': '+1 234 567 8901',
        'Sender Address': '123 Main St, City, State ZIP',
        'Recipient Name': 'John Doe',
        'Recipient Phone': '+1 234 567 8910',
        'Recipient Address': '456 Oak Ave, City, State ZIP',
        'Status': 'New',
        'Branch': 'Main Branch',
        'Zone': 'Zone A',
        'Price': 45.00,
        'Delivery Charges': 5.00,
        'Weight (kg)': 2.5,
        'Description': 'Package description',
        'Created Date': new Date().toLocaleDateString('en-US'),
        'Estimated Delivery': '',
        'Agent Name': '',
        'Notes': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    const columnWidths = [
      { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 35 },
      { wch: 20 }, { wch: 15 }, { wch: 35 }, { wch: 25 },
      { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 30 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments Template');

    XLSX.writeFile(workbook, 'shipments_template.xlsx');

    return { success: true };
  } catch (error) {
    console.error('Template download error:', error);
    return { success: false, error: 'Failed to download template' };
  }
};

// Convert status label back to status code
const parseStatusFromLabel = (label: string): ShipmentStatus => {
  const statusMap: Record<string, ShipmentStatus> = {
    'new': 'new',
    'in pickup stage': 'in_pickup_stage',
    'in warehouse': 'in_warehouse',
    'delivered to agent': 'delivered_to_agent',
    'delivered': 'delivered',
    'postponed': 'postponed',
    'customer unreachable': 'customer_unreachable',
    'rejected no shipping fees': 'rejected_no_shipping_fees',
    'rejected with shipping fees': 'rejected_with_shipping_fees',
    'canceled by merchant': 'canceled_by_merchant',
    'partially delivered': 'partially_delivered',
    'rejected by us': 'rejected_by_us',
    'returned': 'returned',
  };
  
  const normalized = label.toLowerCase().trim();
  return statusMap[normalized] || 'new';
};

// Import shipments from Excel
export const importShipmentsFromExcel = async (file: File): Promise<{
  success: boolean;
  shipments?: Partial<Shipment>[];
  count?: number;
  error?: string;
}> => {
  try {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      return { success: false, error: 'Invalid file type. Please upload .xlsx or .xls file' };
    }

    // Read file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (jsonData.length === 0) {
      return { success: false, error: 'Excel file is empty' };
    }

    // Validate headers
    const firstRow = jsonData[0];
    const requiredHeaders = [
      'Tracking Number',
      'Sender Name',
      'Sender Phone',
      'Recipient Name',
      'Recipient Phone',
      'Status',
    ];

    const missingHeaders = requiredHeaders.filter(header => !(header in firstRow));
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Invalid template format. Missing columns: ${missingHeaders.join(', ')}`,
      };
    }

    // Parse shipments
    const shipments: Partial<Shipment>[] = jsonData
      .filter(row => row['Tracking Number']) // Skip empty rows
      .map((row, index) => {
        try {
          return {
            id: `IMP-${Date.now()}-${index}`,
            trackingNumber: row['Tracking Number']?.toString().trim() || '',
            sender: {
              name: row['Sender Name']?.toString().trim() || '',
              phone: row['Sender Phone']?.toString().trim() || '',
              address: row['Sender Address']?.toString().trim() || '',
            },
            recipient: {
              name: row['Recipient Name']?.toString().trim() || '',
              phone: row['Recipient Phone']?.toString().trim() || '',
              address: row['Recipient Address']?.toString().trim() || '',
            },
            status: parseStatusFromLabel(row['Status']?.toString() || 'new'),
            branch: row['Branch']?.toString().trim() || undefined,
            zone: row['Zone']?.toString().trim() || undefined,
            price: parseFloat(row['Price']) || 0,
            commission: parseFloat(row['Delivery Charges']) || 0,
            weight: row['Weight (kg)'] ? parseFloat(row['Weight (kg)']) : undefined,
            description: row['Description']?.toString().trim() || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDelivery: row['Estimated Delivery'] 
              ? new Date(row['Estimated Delivery']).toISOString() 
              : undefined,
          };
        } catch (error) {
          console.error(`Error parsing row ${index + 1}:`, error);
          return null;
        }
      })
      .filter((shipment): shipment is Partial<Shipment> => shipment !== null);

    if (shipments.length === 0) {
      return { success: false, error: 'No valid shipments found in the file' };
    }

    return {
      success: true,
      shipments,
      count: shipments.length,
    };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: 'Failed to parse Excel file. Please check the format.' };
  }
};
