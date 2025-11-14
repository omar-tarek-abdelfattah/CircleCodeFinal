import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  RefreshCw,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  UserCheck,
  Package,
  Eye,
  Edit,
  EyeOff,
  MailIcon,
  Phone,
  Building2,
  Calendar,
  CalendarClock,
} from 'lucide-react';
import { Seller } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { StatCard } from '../components/StatCard';
import { toast } from 'sonner';
import { AddSellerModal } from '../components/AddSellerModal';
import { EditSellerModal } from '../components/EditSellerModal';
import { DeactivationPeriodModal } from '../components/DeactivationPeriodModal';
import { sellersAPI } from '../services/api.ts';


export function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addSellerModalOpen, setAddSellerModalOpen] = useState(false);
  const [editSellerModalOpen, setEditSellerModalOpen] = useState(false);
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
  const [hiddenSellerIds, setHiddenSellerIds] = useState<Set<string>>(new Set());
  const [hiddenSellersDialogOpen, setHiddenSellersDialogOpen] = useState(false);

  // Load sellers
  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    setLoading(true);
    try {
      // TODO: Connect to backend API
      const response = await sellersAPI.getAll();
      // setSellers(response);
      console.log(response)
      
      // Simulate API delay
      // await new Promise(resolve => setTimeout(resolve, 800));
      
      // Empty state until backend is connected
      setSellers(response);
    } catch (error) {
      console.error('Failed to load sellers:', error);
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics (excluding hidden sellers)
  const visibleSellers = sellers.filter(s => !hiddenSellerIds.has(s.id));
  const totalSellers = visibleSellers.length;
  
  // Active sellers (those with active shipments or recent activity - for demo, we'll use those with active shipments > 0)
  const activeSellers = visibleSellers.filter(s => s.activeShipments > 0).length;
  
  // Total revenue (sum of all wallet balances)
  const totalRevenue = visibleSellers.reduce((sum, s) => sum + s.walletBalance, 0);

  // Apply search filter (excluding hidden sellers)
  const filteredSellers = visibleSellers.filter(seller => {
    const query = searchQuery.toLowerCase();
    return (
      seller.name.toLowerCase().includes(query) ||
      seller.email.toLowerCase().includes(query) ||
      (seller.storeName && seller.storeName.toLowerCase().includes(query)) ||
      seller.phone.includes(query)
    );
  });

  // Get hidden sellers
  const hiddenSellers = sellers.filter(s => hiddenSellerIds.has(s.id));

  const handleViewDetails = (seller: Seller) => {
    setSelectedSeller(seller);
    setDetailsModalOpen(true);
  };

  const handleEditSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setEditSellerModalOpen(true);
  };

  const handleHideSeller = (sellerId: string) => {
    setHiddenSellerIds(prev => {
      const newSet = new Set(prev);
      newSet.add(sellerId);
      return newSet;
    });
    toast.success('Seller hidden successfully');
  };

  const handleRestoreSeller = (sellerId: string) => {
    setHiddenSellerIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(sellerId);
      return newSet;
    });
    toast.success('Seller restored successfully');
  };

  const handleRestoreAllSellers = () => {
    setHiddenSellerIds(new Set());
    setHiddenSellersDialogOpen(false);
    toast.success('All sellers restored successfully');
  };

  const handleToggleStatus = async (sellerId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // TODO: Connect to backend API
      // await sellersAPI.updateStatus(sellerId, newStatus);
      
      // Update local state
      setSellers(prev =>
        prev.map(s =>
          s.id === sellerId ? { ...s, status: newStatus } : s
        )
      );
      
      toast.success(`Seller ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update seller status');
    }
  };

  const handleSetDeactivationPeriod = (seller: Seller) => {
    setSelectedSeller(seller);
    setDeactivationModalOpen(true);
  };

  const handleDeactivationPeriodSuccess = (fromDate: string | null, toDate: string | null) => {
    if (!selectedSeller) return;

    // Update the seller in the list
    setSellers(prev =>
      prev.map(s =>
        s.id === selectedSeller.id
          ? {
              ...s,
              deactivationFrom: fromDate || undefined,
              deactivationTo: toDate || undefined,
            }
          : s
      )
    );
  };

  const isTemporarilyDeactivated = (seller: Seller): boolean => {
    if (!seller.deactivationFrom || !seller.deactivationTo) return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
    
    const from = new Date(seller.deactivationFrom);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date(seller.deactivationTo);
    to.setHours(23, 59, 59, 999); // End of day
    
    return now >= from && now <= to;
  };

  const isScheduledForFuture = (seller: Seller): boolean => {
    if (!seller.deactivationFrom) return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const from = new Date(seller.deactivationFrom);
    from.setHours(0, 0, 0, 0);
    
    return from > now;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl flex items-center gap-2">
            <Users className="w-8 h-8" />
            Sellers Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track all sellers in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadSellers}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Sellers"
            value={totalSellers.toString()}
            icon={Users}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Active Sellers"
            value={activeSellers.toString()}
            icon={UserCheck}
            
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
          />
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by name, email, store name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sellers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sellers</CardTitle>
                <CardDescription>
                  {filteredSellers.length} {filteredSellers.length === 1 ? 'seller' : 'sellers'} found
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {hiddenSellerIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHiddenSellersDialogOpen(true)}
                    className="gap-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <EyeOff className="w-4 h-4" />
                    {hiddenSellerIds.size} Hidden {hiddenSellerIds.size === 1 ? 'Seller' : 'Sellers'}
                  </Button>
                )}
                <Button 
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
                  onClick={() => setAddSellerModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Seller
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SELLER ID</TableHead>
                      <TableHead>NAME</TableHead>
                      <TableHead>STORE NAME</TableHead>
                      <TableHead>CONTACT</TableHead>
                      <TableHead>TOTAL SHIPMENTS</TableHead>
                      <TableHead>ACTIVE SHIPMENTS</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>JOINED DATE</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeletons
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={9}>
                            <Skeleton className="h-12 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredSellers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Users className="w-12 h-12 opacity-20" />
                            <p>No sellers found</p>
                            {searchQuery && (
                              <p className="text-sm">Try adjusting your search</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSellers.map((seller, index) => (
                        <motion.tr
                          key={seller.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <TableCell className="font-mono text-sm">
                            {seller.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{seller.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {seller.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {seller.storeName ? (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span>{seller.storeName}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">{seller.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold">{seller.totalShipments}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={seller.activeShipments > 0 ? "default" : "secondary"}
                              className={seller.activeShipments > 0 ? "bg-green-500" : ""}
                            >
                              {seller.activeShipments}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={seller.status === 'active' && !isTemporarilyDeactivated(seller)}
                                  onCheckedChange={() => handleToggleStatus(seller.id, seller.status)}
                                  className="data-[state=checked]:bg-green-500"
                                />
                                <span className={`text-sm font-semibold ${
                                  seller.status === 'active' && !isTemporarilyDeactivated(seller)
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {seller.status === 'active' && !isTemporarilyDeactivated(seller) ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {isTemporarilyDeactivated(seller) && seller.deactivationTo && (
                                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-1.5">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <CalendarClock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                                    <span className="text-xs text-amber-900 dark:text-amber-200 font-semibold">Currently Deactivated</span>
                                  </div>
                                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                    Deactivated until {formatDate(seller.deactivationTo)}. Cannot log in during this period.
                                  </p>
                                </div>
                              )}
                              {seller.deactivationFrom && seller.deactivationTo && !isTemporarilyDeactivated(seller) && isScheduledForFuture(seller) && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1.5">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <CalendarClock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 flex-shrink-0" />
                                    <span className="text-xs text-blue-900 dark:text-blue-200 font-semibold">Scheduled Deactivation</span>
                                  </div>
                                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                    From {formatDate(seller.deactivationFrom)} to {formatDate(seller.deactivationTo)}.
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(seller.joinedDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDeactivationPeriod(seller)}
                                className="gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Set Deactivation Period"
                              >
                                <CalendarClock className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(seller)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSeller(seller)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Seller"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHideSeller(seller.id)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Hide Seller"
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seller Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Seller Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the seller
            </DialogDescription>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Seller ID</p>
                  <p className="font-mono font-semibold">{selectedSeller.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Joined Date</p>
                  <p className="font-semibold">{formatDate(selectedSeller.joinedDate)}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MailIcon className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-3 pl-6">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                    <p className="font-semibold">{selectedSeller.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                    <p>{selectedSeller.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                    <p>{selectedSeller.phone}</p>
                  </div>
                  {selectedSeller.storeName && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Store Name</p>
                      <p className="font-semibold">{selectedSeller.storeName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Account Status
                </h3>
                <div className="pl-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={selectedSeller.status === 'active' && !isTemporarilyDeactivated(selectedSeller) ? 'default' : 'secondary'}
                      className={selectedSeller.status === 'active' && !isTemporarilyDeactivated(selectedSeller) ? 'bg-green-500' : 'bg-red-500'}
                    >
                      {selectedSeller.status === 'active' && !isTemporarilyDeactivated(selectedSeller) ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {isTemporarilyDeactivated(selectedSeller) && selectedSeller.deactivationTo && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                      <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4" />
                        Account deactivated until <span className="font-semibold">{formatDate(selectedSeller.deactivationTo)}</span>
                      </p>
                    </div>
                  )}
                  {selectedSeller.deactivationFrom && selectedSeller.deactivationTo && !isTemporarilyDeactivated(selectedSeller) && isScheduledForFuture(selectedSeller) && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Scheduled deactivation: {formatDate(selectedSeller.deactivationFrom)} - {formatDate(selectedSeller.deactivationTo)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Shipments</p>
                      <p className="text-2xl font-bold">{selectedSeller.totalShipments}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active</p>
                      <p className="text-2xl font-bold text-green-600">{selectedSeller.activeShipments}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Wallet</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(selectedSeller.walletBalance)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Seller Modal */}
      <AddSellerModal
        open={addSellerModalOpen}
        onOpenChange={setAddSellerModalOpen}
        onSuccess={loadSellers}
      />

      {/* Edit Seller Modal */}
      <EditSellerModal
        open={editSellerModalOpen}
        onOpenChange={setEditSellerModalOpen}
        seller={selectedSeller}
        onSuccess={loadSellers}
      />

      {/* Hidden Sellers Dialog */}
      <Dialog open={hiddenSellersDialogOpen} onOpenChange={setHiddenSellersDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-orange-600" />
              Hidden Sellers ({hiddenSellerIds.size})
            </DialogTitle>
            <DialogDescription>
              View and restore previously hidden sellers
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {hiddenSellers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <EyeOff className="w-12 h-12 opacity-20 mb-2" />
                <p>No hidden sellers</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SELLER ID</TableHead>
                      <TableHead>NAME</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>PHONE</TableHead>
                      <TableHead>TOTAL SHIPMENTS</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hiddenSellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="font-mono text-sm">
                          {seller.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{seller.name}</p>
                            {seller.storeName && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {seller.storeName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>{seller.phone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">{seller.totalShipments}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={seller.status === 'active' ? 'default' : 'secondary'}
                            className={seller.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {seller.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreSeller(seller.id)}
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
            <Button variant="outline" onClick={() => setHiddenSellersDialogOpen(false)}>
              Close
            </Button>
            {hiddenSellers.length > 0 && (
              <Button
                onClick={handleRestoreAllSellers}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                Restore All Sellers
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivation Period Modal */}
      {selectedSeller && (
        <DeactivationPeriodModal
          open={deactivationModalOpen}
          onOpenChange={setDeactivationModalOpen}
          sellerId={selectedSeller.id}
          sellerName={selectedSeller.name}
          currentFromDate={selectedSeller.deactivationFrom}
          currentToDate={selectedSeller.deactivationTo}
          onSuccess={handleDeactivationPeriodSuccess}
        />
      )}
    </div>
  );
}
