import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Eye, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, Clock, X, Calendar as CalendarIcon, FileSpreadsheet, DollarSign, Truck, Receipt, Edit, UserPlus, EyeOff, FileText } from 'lucide-react';
import { AgentResponse, OrderResponse, OrderResponseDetails, ShipmentStatus, ShipmentStatusString } from '../types';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { agentsAPI, shipmentsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from '../components/ui/dialog';
// import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from '../components/ui/alert-dialog';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';
import { EditShipmentModal } from '../components/EditShipmentModal';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { StatCard } from '../components/StatCard';
import { getStatusLabel, getStatusColor, getAvailableStatuses, isInProgressStatus, isCompletedStatus, SELLER_CHANGEABLE_STATUSES, AGENT_CHANGEABLE_STATUSES } from '../lib/statusUtils';
import { exportTableDataToExcel } from '../lib/excelUtils';


interface ShipmentsPageProps {
  onNavigateToBillOfLading?: (shipment: OrderResponseDetails, totalPrice: number, productPrice: number, deliveryCost: number) => void;
  onNavigateToBulkBillOfLading?: (shipments: OrderResponseDetails[]) => void;
}

export function ShipmentsPage({ onNavigateToBillOfLading, onNavigateToBulkBillOfLading }: ShipmentsPageProps) {
  const { role } = useAuth();
  const [shipments, setShipments] = useState<OrderResponse[]>([]);
  // const [shipmentsDetails, setShipmentsDetails] = useState<OrderResponse>({} as OrderResponse);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<OrderResponse | OrderResponse[] | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);
  const [editShipmentModalOpen, setEditShipmentModalOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  // const [importDialogOpen, setImportDialogOpen] = useState(false);
  // const [importingFile, setImportingFile] = useState(false);
  // const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Bulk action dialogs
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false);
  const [assignAgentDialogOpen, setAssignAgentDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<ShipmentStatusString>(ShipmentStatusString.New);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Date Range State
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [manifestSearch, setManifestSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // total 
  // const [totalOrder, setTotalOrder] = useState(0);
  // const [packagesInProgres, setPackagesInProgres] = useState(0);
  // const [completedShipment, setCompletedShipment] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);


  // Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Hidden orders state
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(new Set());
  const [hiddenOrdersDialogOpen, setHiddenOrdersDialogOpen] = useState(false);
  const [isHiddenOrdersLoaded, setIsHiddenOrdersLoaded] = useState(false);

  // Load hidden orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hiddenOrderIds');
    if (saved) {
      try {
        setHiddenOrderIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse hidden orders', e);
      }
    }
    setIsHiddenOrdersLoaded(true);
  }, []);

  // Save hidden orders to localStorage
  useEffect(() => {
    if (isHiddenOrdersLoaded) {
      localStorage.setItem('hiddenOrderIds', JSON.stringify(Array.from(hiddenOrderIds)));
    }
  }, [hiddenOrderIds, isHiddenOrdersLoaded]);


  const isRoleAdminOrSuperAdmin = role === UserRole.Admin || role === UserRole.SuperAdmin;
  const isRoleAgent = role == UserRole.agent;
  const isRoleSeller = role == UserRole.Seller;

  // Load shipments
  const loadShipments = async () => {
    setLoading(true);
    setLoadingStats(true);
    try {
      const response = await shipmentsAPI.getAll();
      console.log('API Response:', response);

      // Ensure response is an array
      if (Array.isArray(response)) {

        const reversedResponse = response.reverse()
        setShipments(reversedResponse);

      } else {
        console.error('API returned non-array response:', response);
        setShipments([]);
      }
    } catch (error) {
      console.error('Failed to load shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };
  useEffect(() => {
    loadShipments();
  }, []);


  // Calculate stats (excluding hidden orders)
  let visibleShipments = shipments.filter(s => !hiddenOrderIds.has(s.id));
  const totalOrders = visibleShipments.length;
  const packagesInProgress = visibleShipments.filter(s => isInProgressStatus(s.statusOrder as ShipmentStatusString)).length;
  const completedShipments = visibleShipments.filter(s => isCompletedStatus(s.statusOrder as ShipmentStatusString)).length;
  // console.log('Stats calculated', { totalOrders, packagesInProgress, completedShipments });

  // Get available statuses based on user role
  const availableStatuses = role ? getAvailableStatuses(role as UserRole) : [];

  // Apply filters (and exclude hidden orders)
  const filteredShipments = visibleShipments.filter(s => {
    const recipientName = s.clientName || '';
    const sellerName = s.sellerName || '';
    const status = s.statusOrder || '';

    const matchesSearch =
      searchQuery === '' ||
      recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(status);

    const matchesSeller =
      sellerFilter === 'all' || sellerName === sellerFilter;

    const matchesStore =
      storeFilter === 'all' || s.sellerName === storeFilter;

    const matchesAgent =
      agentSearch === '' ||
      agentSearch === 'all' ||
      (agentSearch === 'unassigned' ? !s.agentName : s.agentName === agentSearch);

    const matchesDate = (() => {
      if (!dateFrom && !dateTo) return true;
      if (!s.dateCreated) return false;
      const date = new Date(s.dateCreated);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (from) from.setHours(0, 0, 0, 0);
      if (to) to.setHours(23, 59, 59, 999);

      if (from && to) return date >= from && date <= to;
      if (from) return date >= from;
      if (to) return date <= to;
      return true;
    })();

    return matchesSearch && matchesStatus && matchesSeller && matchesStore && matchesAgent && matchesDate;
  });


  // Get unique sellers and stores for filter dropdowns (excluding hidden orders)
  const uniqueSellers = Array.from(new Set(visibleShipments.map(s => s.sellerName)));
  const uniqueAgents = Array.from(new Set(visibleShipments.map(s => s.agentName)));

  // Get hidden orders
  const hiddenOrders = shipments.filter(s => hiddenOrderIds.has(s.id));

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  let paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = async (shipment: OrderResponse) => {
    console.log(shipment);

    if (!shipment.id) {
      toast.error('Cannot view details: Invalid shipment ID');
      return;
    }
    // setShipmentsDetails(shipment)
    setSelectedShipment(shipment as unknown as OrderResponse);
    setDetailsModalOpen(true);
  };

  const handleViewBillOfLading = async (shipment: OrderResponse) => {
    if (onNavigateToBillOfLading) {
      try {
        const details = await shipmentsAPI.getById(shipment.id);
        onNavigateToBillOfLading(details as unknown as OrderResponseDetails, shipment.totalPrice, shipment.productPrice, shipment.deliveryCost);
      } catch (error) {
        console.error('Failed to load shipment details:', error);
        toast.error('Failed to load shipment details');
      }
    }
  };

  const handleEditShipment = (shipment: OrderResponse) => {
    // Check if seller can edit this order
    if (role === UserRole.Seller && shipment.statusOrder !== ShipmentStatusString.New) {
      toast.error('You cannot edit orders that have been processed by admin or agent');
      return;
    }

    setSelectedShipment(shipment);
    setEditShipmentModalOpen(true);
  };



  const handleExport = () => {
    if (filteredShipments.length === 0) {
      toast.error('No shipments to export');
      return;
    }

    const result = exportTableDataToExcel(filteredShipments, 'shipments_export');
    if (result.success) {
      toast.success(`Exported ${result.count} shipments successfully`);
    } else {
      toast.error(result.error || 'Failed to export shipments');
    }
  };

  const handleExportSelected = () => {
    const selectedShipments = shipments.filter(s => selectedOrderIds.has(s.id));
    if (selectedShipments.length === 0) {
      toast.error('No shipments selected');
      return;
    }

    const result = exportTableDataToExcel(selectedShipments, 'selected_shipments_export');
    if (result.success) {
      toast.success(`Exported ${result.count} shipments successfully`);
    } else {
      toast.error(result.error || 'Failed to export shipments');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      // TODO: Connect to backend API
      // await shipmentsAPI.updateStatus(id, status);

      // Update local state
      // setShipments(prev =>
      //   prev.map(s =>
      //     s.id === id ? { ...s, status: status as ShipmentStatus, updatedAt: new Date().toISOString() } : s
      //   )
      // );

      toast.success('Shipment status updated successfully');
      setDetailsModalOpen(false);
      loadShipments();
    } catch (error) {
      toast.error('Failed to update shipment status');
    }
  };

  // const handleExport = () => {
  //   // Export only selected shipments if any are selected, otherwise export filtered shipments
  //   let shipmentsToExport: OrderResponse[] = [];

  //   if (selectedOrderIds.size > 0) {
  //     // Export only selected shipments
  //     shipmentsToExport = shipments.filter(s => selectedOrderIds.has(s.id));
  //   } else {
  //     // Export all filtered/visible shipments
  //     shipmentsToExport = filteredShipments.length > 0 ? filteredShipments : shipments;
  //   }

  //   const result = exportShipmentsToExcel(shipmentsToExport);

  //   if (result.success) {
  //     if (selectedOrderIds.size > 0) {
  //       toast.success(`Successfully exported ${result.count} selected shipment${result.count !== 1 ? 's' : ''}`);
  //     } else {
  //       toast.success(`Successfully exported ${result.count} shipment${result.count !== 1 ? 's' : ''}`);
  //     }
  //   } else {
  //     toast.error(result.error || 'Failed to export shipments');

  //   }
  // }

  // const handleImport = () => {
  //   setImportDialogOpen(true);
  // };

  // Hide/Restore order handlers
  const handleHideOrder = (orderId: string) => {
    // Check if seller can hide this order
    if (role === UserRole.Seller) {
      const shipment = shipments.find(s => s.id === orderId);
      if (shipment && shipment.statusOrder !== ShipmentStatusString.New) {
        toast.error('You cannot hide orders that have been processed by admin or agent');
        return;
      }
    }

    setHiddenOrderIds(prev => new Set([...prev, orderId]));
    toast.success('Order hidden successfully');
  };

  const handleRestoreOrder = (orderId: string) => {
    setHiddenOrderIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
    toast.success('Order restored successfully');
  };

  const handleRestoreAllOrders = () => {
    setHiddenOrderIds(new Set());
    setHiddenOrdersDialogOpen(false);
    toast.success('All orders restored successfully');
  };

  // const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   setImportingFile(true);

  //   try {
  //     const result = await importShipmentsFromExcel(file);

  //     if (result.success && result.shipments) {
  //       // TODO: Send to backend API
  //       // await shipmentsAPI.importBulk(result.shipments);

  //       // For now, add to existing shipments (frontend only)
  //       // setShipments(prev => [...prev, ...result.shipments as Shipment[]]);

  //       toast.success(`Successfully imported ${result.count} orders`);
  //       setImportDialogOpen(false);

  //       // Reset file input
  //       if (fileInputRef.current) {
  //         fileInputRef.current.value = '';
  //       }
  //     } else {
  //       toast.error(result.error || 'Failed to import shipments');
  //     }
  //   } catch (error) {
  //     console.error('Import error:', error);
  //     toast.error('Failed to import Excel file');
  //   } finally {
  //     setImportingFile(false);
  //   }
  // };

  // const handleDownloadTemplate = () => {
  //   const result = downloadTemplate();
  //   if (result.success) {
  //     toast.success('Template downloaded successfully');
  //   } else {
  //     toast.error(result.error || 'Failed to download template');
  //   }
  // };

  const handleResetFilters = async () => {
    setSearchQuery('');
    setStatusFilter([]);
    setSellerFilter('all');
    setStoreFilter('all');
    setManifestSearch('');
    setAgentSearch('');
    setDateFrom(undefined);
    setDateTo(undefined);
    await loadShipments();
    toast.success('Filters reset successfully');
  };

  const handleApplyFilters = async () => {
    setFilterDialogOpen(false);
    toast.success('Filters applied successfully');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateShort = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Count active filters
  const activeFiltersCount = [
    statusFilter.length > 0,
    sellerFilter !== 'all',
    storeFilter !== 'all',
    manifestSearch !== '',
    agentSearch !== '',
    dateFrom !== undefined,
    dateTo !== undefined,
  ].filter(Boolean).length;

  // Selection handlers
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }

      // console.log(newSet);

      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(new Set(paginatedShipments.map(s => s.id)));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedOrderIds(new Set());
  };

  // Calculate selected orders totals
  const selectedTotalProductCost = shipments
    .filter(s => selectedOrderIds.has(s.id))
    .reduce((sum, s) => sum + (s.productPrice || 0), 0);

  const selectedTotalDeliveryCost = shipments
    .filter(s => selectedOrderIds.has(s.id))
    .reduce((sum, s) => sum + (s.deliveryCost || 0), 0);
  const selectedTotalAmount = selectedTotalProductCost + selectedTotalDeliveryCost;


  // Bulk action handlers
  const handleBulkStatusChange = async () => {
    // Prevent sellers from changing status
    if (role === UserRole.Seller) {
      toast.error('You do not have permission to change order status');
      return;
    }

    // Validate agent selection for specific statuses
    if ([ShipmentStatusString.InPickupStage, ShipmentStatusString.DeliveredToAgent, ShipmentStatusString.Returned].includes(bulkStatus) && !selectedAgentId) {
      toast.error('Please select an agent for this status');
      return;
    }

    try {
      console.log(bulkStatus);

      // TODO: Connect to backend API
      await shipmentsAPI.bulkUpdateStatus({
        orderIdS: Array.from(selectedOrderIds),
        statusOrder: bulkStatus as unknown as ShipmentStatus,
        agentId: selectedAgentId ? parseInt(selectedAgentId) : undefined,
        // cancellednotes: bulkCancelledNotes,
      });

      // Update local state
      setShipments(prev =>
        prev.map(s =>
          selectedOrderIds.has(s.id)
            ? {
              ...s,
              status: bulkStatus,
              updatedAt: new Date().toISOString(),
              // Optimistically update assigned agent if selected
              ...(selectedAgentId ? { assignedAgent: { id: selectedAgentId, name: agents.find(a => a.id.toString() === selectedAgentId)?.name || 'Agent', phone: 'N/A' } } : {})
            }
            : s
        )
      );

      toast.success(`Successfully updated status for ${selectedOrderIds.size} orders`);
      setChangeStatusDialogOpen(false);
      setSelectedOrderIds(new Set());
      setSelectedAgentId(''); // Reset selection
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkAgentAssignment = async () => {
    // Prevent sellers from assigning agents
    if (role === UserRole.Seller) {
      toast.error('You do not have permission to assign agents');
      return;
    }

    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    try {
      // TODO: Connect to backend API
      await shipmentsAPI.bulkUpdateStatus({
        orderIdS: Array.from(selectedOrderIds),
        statusOrder: ShipmentStatus.DeliveredToAgent,
        agentId: selectedAgentId ? parseInt(selectedAgentId) : undefined,
        // cancellednotes: bulkCancelledNotes,
      });

      const selectedAgent = { id: selectedAgentId, name: 'Agent', phone: 'N/A' };

      // Update local state
      setShipments(prev =>
        prev.map(s =>
          selectedOrderIds.has(s.id)
            ? { ...s, assignedAgent: selectedAgent, updatedAt: new Date().toISOString() }
            : s
        )
      );

      toast.success(`Successfully assigned ${selectedOrderIds.size} orders to ${selectedAgent?.name}`);
      setAssignAgentDialogOpen(false);
      setSelectedOrderIds(new Set());
      setSelectedAgentId('');
    } catch (error) {
      toast.error('Failed to assign agent');
    }
  };

  const handleBulkPrint = async () => {
    if (selectedOrderIds.size === 0) {
      toast.error('Please select at least one order to print');
      return;
    }

    if (onNavigateToBulkBillOfLading) {
      try {
        const toastId = toast.loading('Preparing Bill of Lading...');

        const promises = Array.from(selectedOrderIds).map(id => shipmentsAPI.getById(id));
        const details = await Promise.all(promises);

        toast.dismiss(toastId);
        onNavigateToBulkBillOfLading(details as unknown as OrderResponseDetails[]);
      } catch (error) {
        console.error('Failed to load shipment details:', error);
        toast.error('Failed to load shipment details');
      }
    }
  };

  // TODO: Load agents from backend API
  const [agents, setAgents] = useState<AgentResponse[]>([]);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await agentsAPI.getAll();
      setAgents(response);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  // console.log('ShipmentsPage: Reaching return statement', {
  //   shipmentsCount: shipments.length,
  //   filteredCount: filteredShipments.length,
  //   loading
  // });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >

        <div>
          <h1 className="text-3xl flex items-center gap-2">
            <Package className="w-8 h-8" />
            Order Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track your order management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadShipments}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {role !== UserRole.agent && (
            <Button
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
              onClick={() => setAddShipmentModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <StatCard
            title="Total Orders"
            value={loadingStats ? "..." : totalOrders.toString()}
            icon={Package}
          // subtitle="Total shipments"
          />
        </div>

        <div>
          <StatCard
            title="Pending"
            value={loadingStats ? "..." : packagesInProgress.toString()}
            icon={Clock}
          // subtitle="In progress"
          />
        </div>

        <div>
          <StatCard
            title="Completed"
            value={loadingStats ? "..." : completedShipments.toString()}
            icon={CheckCircle}
          // subtitle="Completed shipments"
          />
        </div>
      </div>

      {/* Filter Button & Search Bar */}
      <div>
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by tracking number, sender, or recipient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setFilterDialogOpen(true)}
                className="gap-2 relative"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-500 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Active filters:
                </span>
                {statusFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {/* Status: {statusFilter.map(s => getStatusLabel(s)).join(', ')} */}

                  </Badge>
                )}
                {sellerFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Seller: {sellerFilter}

                  </Badge>
                )}
                {storeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Store: {storeFilter}

                  </Badge>
                )}
                {manifestSearch && (
                  <Badge variant="secondary" className="gap-1">
                    Manifest: {manifestSearch}

                  </Badge>
                )}
                {agentSearch && (
                  <Badge variant="secondary" className="gap-1">
                    Agent: {agentSearch}

                  </Badge>
                )}
                {(dateFrom || dateTo) && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {formatDateShort(dateFrom)} - {formatDateShort(dateTo)}

                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="ml-auto h-6 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selection Summary Card */}
      {selectedOrderIds.size > 0 && (
        <div>
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {selectedOrderIds.size} {selectedOrderIds.size === 1 ? 'Order' : 'Orders'} Selected
                    </span>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Product Cost</p>
                        <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          ${selectedTotalProductCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Delivery Cost</p>
                        <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          ${selectedTotalDeliveryCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total Amount</p>
                        <p className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-lg">
                          ${selectedTotalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {role !== UserRole.agent && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleBulkPrint}
                        className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        <Receipt className="w-4 h-4" />
                        Print Bill of Lading
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleExportSelected}
                        className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Selected
                      </Button>
                    </>
                  )}
                  {role !== UserRole.Seller && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setChangeStatusDialogOpen(true)}
                      className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      <Edit className="w-4 h-4" />
                      Change Status
                    </Button>
                  )}
                  {role === UserRole.Admin || role === UserRole.SuperAdmin && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAssignAgentDialogOpen(true)}
                      className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign to Agent
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <div>
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Manage and track your order management</CardDescription>
              </div>
              <div className="flex gap-2">
                {hiddenOrderIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHiddenOrdersDialogOpen(true)}
                    className="gap-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <EyeOff className="w-4 h-4" />
                    {hiddenOrderIds.size} Hidden {hiddenOrderIds.size === 1 ? 'Order' : 'Orders'}
                  </Button>
                )}
                {role !== UserRole.agent && (
                  <>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImport}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button> */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export {filteredShipments.length > 0 ? `(${filteredShipments.length})` : ''}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkPrint}
                      disabled={selectedOrderIds.size === 0}
                      className="gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      Print {selectedOrderIds.size > 0 ? `(${selectedOrderIds.size})` : ''}
                    </Button>
                  </>
                )}
                {role !== UserRole.agent && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                    onClick={() => setAddShipmentModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          // checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all orders"
                        />
                      </TableHead>
                      <TableHead>TRACKING ID</TableHead>
                      <TableHead>CUSTOMER</TableHead>
                      {role !== UserRole.Seller && <TableHead>MERCHANT</TableHead>}
                      {role !== UserRole.agent && <TableHead>AGENT</TableHead>}
                      <TableHead>DATE CREATED</TableHead>
                      <TableHead className="bg-slate-50 dark:bg-slate-800/50">PRODUCT COST</TableHead>
                      <TableHead className="bg-slate-50 dark:bg-slate-800/50">DELIVERY COST</TableHead>
                      <TableHead className="bg-slate-100 dark:bg-slate-800">TOTAL AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeletons
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={12}>
                            <Skeleton className="h-12 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : paginatedShipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Package className="w-12 h-12 opacity-20" />
                            <p>No shipments found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedShipments.map((shipment) => (
                        <tr
                          key={shipment.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedOrderIds.has(shipment.id)}
                              onCheckedChange={() => handleSelectOrder(shipment.id)}
                              aria-label={`Select order ${shipment.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {shipment.id}
                          </TableCell>
                          <TableCell>{shipment.clientName}</TableCell>
                          {role !== UserRole.Seller && <TableCell>{shipment.sellerName}</TableCell>}
                          {role !== UserRole.agent && (
                            <TableCell>
                              {shipment.agentName || (
                                <span className="text-slate-400">Unassigned</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>{formatDate(shipment.dateCreated)}</TableCell>
                          <TableCell className="font-mono bg-slate-50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 text-xs">$</span>
                              <span>{(shipment.productPrice || 0).toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono bg-slate-50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 text-xs">$</span>
                              <span>{(shipment.deliveryCost || 0).toFixed(2)}</span>
                            </div>
                          </TableCell>

                          <TableCell className="font-mono bg-slate-100 dark:bg-slate-800/50">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 text-xs">$</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {(shipment.totalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(shipment.statusOrder as ShipmentStatusString)}>
                              {shipment.statusOrder?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(shipment)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewBillOfLading(shipment)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View Bill of Lading"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              {
                                (
                                  (isRoleAdminOrSuperAdmin) ||
                                  (isRoleAgent && AGENT_CHANGEABLE_STATUSES.includes(shipment.statusOrder as ShipmentStatusString)) ||
                                  (isRoleSeller && SELLER_CHANGEABLE_STATUSES.includes(shipment.statusOrder as ShipmentStatusString))
                                ) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditShipment(shipment)}
                                    className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                    title="Edit Shipment"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )
                              }
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHideOrder(shipment.id)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title={
                                  role === UserRole.Seller && shipment.statusOrder !== ShipmentStatusString.New
                                    ? 'Cannot hide processed orders'
                                    : 'Hide Order'
                                }
                                disabled={role === UserRole.Seller && shipment.statusOrder !== ShipmentStatusString.New}
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Filter your shipments using multiple criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? formatDateShort(dateFrom) : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? formatDateShort(dateTo) : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seller & Store Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seller Name</Label>
                <Select value={sellerFilter} onValueChange={setSellerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sellers</SelectItem>
                    {uniqueSellers.map(seller => (
                      <SelectItem key={seller} value={seller as string}>
                        {seller}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label>Store / Branch</Label>
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {uniqueStores.map(store => (
                      <SelectItem key={store} value={store || ''}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Order Status {role !== UserRole.Admin || UserRole.SuperAdmin && <span className="text-xs text-slate-500">(Limited to your role)</span>}</Label>
                {statusFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter([])}
                    className="h-6 text-xs"
                  >
                    Clear ({statusFilter.length})
                  </Button>
                )}
              </div>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {availableStatuses.map(status => (
                      <div key={status} className="flex items-center gap-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={statusFilter.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilter([...statusFilter, status]);
                            } else {
                              setStatusFilter(statusFilter.filter(s => s !== status));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`status-${status}`}
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                          {getStatusLabel(status)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Search */}
            {role !== UserRole.agent && (<div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Select value={agentSearch} onValueChange={setAgentSearch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {uniqueAgents.map(agent => (
                      <SelectItem key={agent || 'unassigned'} value={agent || 'unassigned'}>
                        {agent || 'Unassigned'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>)}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset All
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal
        shipment={selectedShipment as OrderResponse}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Import Dialog */}
      {/* { <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Shipments
            </DialogTitle>
            <DialogDescription>
              Import shipments from an Excel file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Upload Excel File</Label>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">File</Label>
                      <Input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Status</Label>
                      <Badge
                        className={`${importingFile ? 'bg-blue-500' : 'bg-gray-500'
                          } text-white`}
                      >
                        {importingFile ? 'Importing...' : 'Ready'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Download 
            <div className="space-y-2">
              <Label>Download Template</Label>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Template</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>} */}

      {/* Change Status Dialog */}
      <Dialog open={changeStatusDialogOpen} onOpenChange={setChangeStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Change Status
            </DialogTitle>
            <DialogDescription>
              Update the status for {selectedOrderIds.size} selected {selectedOrderIds.size === 1 ? 'order' : 'orders'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New Status</Label>
              <Select value={bulkStatus} onValueChange={(value) => {
                setBulkStatus(value as ShipmentStatusString);
                // Reset agent selection when status changes
                if (![ShipmentStatusString.InPickupStage, ShipmentStatusString.DeliveredToAgent, ShipmentStatusString.Returned].includes(value as ShipmentStatusString)) {
                  setSelectedAgentId('');
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                        {getStatusLabel(status)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Selection for specific statuses */}
            {(role === UserRole.SuperAdmin || role === UserRole.Admin) &&
              (bulkStatus === ShipmentStatusString.InPickupStage ||
                bulkStatus === ShipmentStatusString.DeliveredToAgent ||
                bulkStatus === ShipmentStatusString.Returned) && (
                <div className="space-y-2">
                  <Label>Assign Agent</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                          No agents available. Connect to backend to load agents.
                        </div>
                      ) : (
                        agents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex flex-col">
                              <span>{agent.name}</span>
                              <span className="text-xs text-slate-500">{agent.phoneNumber}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>{selectedOrderIds.size}</strong> {selectedOrderIds.size === 1 ? 'order' : 'orders'} will be updated to: <strong>{getStatusLabel(bulkStatus)}</strong>
                {selectedAgentId && (
                  <> and assigned to <strong>{agents.find(a => a.id.toString() === selectedAgentId)?.name}</strong></>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkStatusChange}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Agent Dialog */}
      <Dialog open={assignAgentDialogOpen} onOpenChange={setAssignAgentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Assign to Agent
            </DialogTitle>
            <DialogDescription>
              Assign {selectedOrderIds.size} selected {selectedOrderIds.size === 1 ? 'order' : 'orders'} to an agent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No agents available. Connect to backend to load agents.
                    </div>
                  ) : (
                    agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        <div className="flex flex-col">
                          <span>{agent.name}</span>
                          <span className="text-xs text-slate-500">{agent.phoneNumber}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedAgentId && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>{selectedOrderIds.size}</strong> {selectedOrderIds.size === 1 ? 'order' : 'orders'} will be assigned to: <strong>{agents.find(a => a.id.toString() === selectedAgentId)?.name || 'Selected Agent'}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignAgentDialogOpen(false);
              setSelectedAgentId('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAgentAssignment}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
              disabled={!selectedAgentId}
            >
              Assign Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Orders Dialog */}
      <Dialog open={hiddenOrdersDialogOpen} onOpenChange={setHiddenOrdersDialogOpen}>
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-orange-600" />
              Hidden Orders ({hiddenOrderIds.size})
            </DialogTitle>
            <DialogDescription>
              View and restore previously hidden orders
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {hiddenOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <EyeOff className="w-12 h-12 opacity-20 mb-2" />
                <p>No hidden orders</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TRACKING ID</TableHead>
                      <TableHead>CUSTOMER</TableHead>
                      <TableHead>MERCHANT</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>TOTAL AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hiddenOrders.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono text-sm">
                          {shipment.id}
                        </TableCell>
                        <TableCell>{shipment.clientName}</TableCell>
                        <TableCell>{shipment.sellerName}</TableCell>
                        <TableCell>{formatDate(shipment.dateCreated)}</TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 text-xs">$</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {(shipment.totalPrice).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shipment.statusOrder as ShipmentStatusString)}>
                            {shipment.statusOrder?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreOrder(shipment.id)}
                            className="gap-2 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Eye className="w-4 h-4" />
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHiddenOrdersDialogOpen(false)}>
              Close
            </Button>
            {hiddenOrders.length > 0 && (
              <Button
                onClick={handleRestoreAllOrders}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                Restore All Orders
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Shipment Modal */}
      <AddShipmentModal
        isOpen={addShipmentModalOpen}
        onClose={() => setAddShipmentModalOpen(false)}
        onSuccess={loadShipments}

      />

      {/* Edit Shipment Modal */}
      <EditShipmentModal
        shipment={selectedShipment as OrderResponse}
        isOpen={editShipmentModalOpen}
        onClose={() => setEditShipmentModalOpen(false)}
        onSuccess={loadShipments}
        userRole={role}
      />
    </div>
  );
}

