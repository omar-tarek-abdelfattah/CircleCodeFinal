import { useState, useEffect } from 'react';
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
  Building2,
  CalendarClock,
  CheckCheck,
  X,
} from 'lucide-react';
import { SellerResponse, SellerResponseDetails } from '../types';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { StatCard } from '../components/StatCard';
import { toast } from 'sonner';
import { AddSellerModal } from '../components/AddSellerModal';
import { EditSellerModal } from '../components/EditSellerModal';
import { sellersAPI } from '../services/api.ts';
import { DeactivationPeriodModal } from '@/components/DeactivationPeriodModal.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';


export function SellersPage() {
  const [sellers, setSellers] = useState<SellerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<SellerResponse | null>(null);
  const [sellerDetails, setSellerDetails] = useState<SellerResponseDetails | null>(null);
  const [activeSellersCount, setActiveSellersCount] = useState(0);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addSellerModalOpen, setAddSellerModalOpen] = useState(false);
  const [editSellerModalOpen, setEditSellerModalOpen] = useState(false);
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
  const [hiddenSellerIds, setHiddenSellerIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hiddenSellerIds');
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse hidden sellers from local storage', e);
        }
      }
    }
    return new Set();
  });
  const [hiddenSellersDialogOpen, setHiddenSellersDialogOpen] = useState(false);
  const [lockedSellers, setLockedSellers] = useState<SellerResponse[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const loadSellers = async () => {
    setLoading(true);
    try {
      const response = await sellersAPI.getAll();
      setSellers(response);
    } catch (error) {
      console.error('Failed to load sellers:', error);
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSellersCount = async () => {
    try {
      const response = await sellersAPI.getActiveCount();
      console.log(response);

      setActiveSellersCount(response);
    } catch (error) {
      console.error('Failed to load active sellers count:', error);
      toast.error('Failed to load active sellers count');
    }
  }

  const loadLockedSellers = async () => {
    try {
      const response = await sellersAPI.getLockedSellers();
      setLockedSellers(response);
    } catch (error) {
      console.error('Failed to load locked sellers:', error);
      toast.error('Failed to load locked sellers');
    }
  };

  // Load sellers
  useEffect(() => {
    loadSellers();
    loadActiveSellersCount();
  }, []);

  useEffect(() => {
    if (activeTab === 'locked') {
      loadLockedSellers();
    } else if (activeTab === 'all') {
      loadSellers();
    }
  }, [activeTab]);

  // Save hidden sellers to local storage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hiddenSellerIds', JSON.stringify(Array.from(hiddenSellerIds)));
    }
  }, [hiddenSellerIds]);

  // Calculate statistics (excluding hidden sellers)
  const visibleSellers = sellers.filter(s => !hiddenSellerIds.has(s.id.toString()));
  const totalSellers = visibleSellers.length;

  // Total revenue (sum of all wallet balances)
  const totalRevenue = visibleSellers.reduce((sum, s) => sum + (s.deliveryCost || 0), 0);

  // Apply search filter (excluding hidden sellers)
  const filteredSellers = visibleSellers.filter(seller => {
    const query = searchQuery.toLowerCase();
    return (
      seller.name?.toLowerCase().includes(query) ||
      (seller.storeName?.toLowerCase().includes(query))
    );
  });

  // Get hidden sellers
  const hiddenSellers = sellers.filter(s => hiddenSellerIds.has(s.id.toString()));

  const handleViewDetails = async (seller: SellerResponse) => {
    setSelectedSeller(seller);
    setDetailsModalOpen(true);
    try {
      const details = await sellersAPI.getById(seller.id.toString());
      setSellerDetails(details);
    } catch (error) {
      console.error('Failed to load seller details:', error);
      toast.error('Failed to load seller details');
    }
  };

  const handleEditSeller = (seller: SellerResponse) => {
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

  const handleToggleConfirmation = async (sellerId: number, isConfirmed: boolean) => {
    if (isConfirmed) {
      // Unlocking (Locked -> Running)
      try {
        await sellersAPI.sellersLockout(sellerId.toString(), new Date().toISOString(), false);

        // Update local state
        setSellers(prev =>
          prev.map(s =>
            s.id === sellerId ? { ...s, isConfermid: true } : s
          )
        );
        setLockedSellers(prev => prev.filter(s => s.id !== sellerId));

        toast.success('Seller unlocked successfully');
      } catch (error) {
        console.error('Failed to unlock seller:', error);
        toast.error('Failed to unlock seller');
      }
    } else {
      // Locking (Running -> Locked)
      // Open the deactivation modal instead of locking immediately
      const seller = sellers.find(s => s.id === sellerId);
      if (seller) {
        handleSetDeactivationPeriod(seller);
      }
    }
  };

  const handleSetDeactivationPeriod = (seller: SellerResponse) => {
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

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'EGP 0.00';
    }
    return `EGP ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            value={sellers.filter(s => s.isActive).length.toString()}
            icon={UserCheck}

          />

        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Confirmed Sellers"
            value={activeSellersCount}
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
                placeholder="Search by name or store name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Sellers</TabsTrigger>
            <TabsTrigger value="locked">Locked Sellers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
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
                      <br /><span>shipments, profit, delivery cost and activity are for today</span>
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
                          <TableHead>NAME</TableHead>
                          <TableHead>STORE NAME</TableHead>
                          <TableHead>ADDRESS</TableHead>
                          <TableHead>SHIPMENTS</TableHead>
                          <TableHead>PROFIT</TableHead>
                          <TableHead>DELIVERY COST</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
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
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{seller.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                                {seller.address ? (
                                  <div className="flex items-center gap-2">
                                    <span>{seller.address}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={seller.numberofOrder > 0 ? "default" : "secondary"}
                                  className={seller.numberofOrder > 0 ? "bg-green-500" : ""}
                                >
                                  {seller.numberofOrder}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(seller.profit)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {formatCurrency(seller.deliveryCost)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-3">
                                    {seller.isActive ? (
                                      <CheckCheck className="data-[state=checked]:bg-green-500" />
                                    ) : (
                                      <X className="data-[state=checked]:bg-red-500" />
                                    )}
                                    <span className={`text-sm font-semibold ${seller.isActive
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                      }`}>
                                      {seller.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      checked={seller.isConfermid || false}
                                      onCheckedChange={(checked) => handleToggleConfirmation(seller.id, checked)}
                                      className="data-[state=checked]:bg-green-500"
                                    />
                                    <span className={`text-sm font-semibold ${seller.isConfermid
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                      }`}>
                                      {seller.isConfermid ? 'Running' : 'Locked'}
                                    </span>
                                  </div>
                                </div>
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
                                    onClick={() => handleHideSeller(seller.id.toString())}
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
        </TabsContent>

        <TabsContent value="locked" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Locked Sellers</CardTitle>
                    <CardDescription>
                      {lockedSellers.length} {lockedSellers.length === 1 ? 'seller' : 'sellers'} found
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NAME</TableHead>
                          <TableHead>STORE NAME</TableHead>
                          <TableHead>ADDRESS</TableHead>
                          <TableHead>TOTAL SHIPMENTS</TableHead>
                          <TableHead>PROFIT</TableHead>
                          <TableHead>DELIVERY COST</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lockedSellers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12">
                              <div className="flex flex-col items-center gap-2 text-slate-500">
                                <Users className="w-12 h-12 opacity-20" />
                                <p>No locked sellers found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          lockedSellers.map((seller, index) => (
                            <motion.tr
                              key={seller.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{seller.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                                {seller.address ? (
                                  <div className="flex items-center gap-2">
                                    <span>{seller.address}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={seller.numberofOrder > 0 ? "default" : "secondary"}
                                  className={seller.numberofOrder > 0 ? "bg-green-500" : ""}
                                >
                                  {seller.numberofOrder}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(seller.profit)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {formatCurrency(seller.deliveryCost)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-3">
                                    {seller.isActive ? (
                                      <CheckCheck className="data-[state=checked]:bg-green-500" />
                                    ) : (
                                      <X className="data-[state=checked]:bg-red-500" />
                                    )}
                                    <span className={`text-sm font-semibold ${seller.isActive
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                      }`}>
                                      {seller.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      checked={false}
                                      onCheckedChange={(checked) => handleToggleConfirmation(seller.id, checked)}
                                      className="data-[state=checked]:bg-green-500"
                                    />
                                    <span className={`text-sm font-semibold ${false
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                      }`}>
                                      {false ? 'Running' : 'Locked'}
                                    </span>
                                  </div>
                                </div>
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
        </TabsContent>
      </Tabs>

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
          {sellerDetails && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Joined Date</p>
                  <p className="font-semibold">{formatDate(sellerDetails.date)}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-3 pl-6">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                    <p className="font-semibold">{sellerDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                    <p>{sellerDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                    <p>{sellerDetails.phone}</p>
                  </div>
                  {sellerDetails.storeName && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Store Name</p>
                      <p className="font-semibold">{sellerDetails.storeName}</p>
                    </div>
                  )}
                  {sellerDetails.address && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Address</p>
                      <p>{sellerDetails.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Shipments</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {sellerDetails.numberofOrder}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(sellerDetails.profit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Account Status
                </h3>
                <div className="pl-6 flex gap-4">
                  <Badge variant={sellerDetails.isActive ? "default" : "destructive"}>
                    {sellerDetails.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={sellerDetails.isConfermid ? "default" : "destructive"}>
                    {sellerDetails.isConfermid ? "Running" : "Locked"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
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
                        {/* <TableCell>{seller.email}</TableCell>
                        <TableCell>{seller.phone}</TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">{seller.numberofOrder}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={seller.isActive ? 'default' : 'secondary'}
                            className={seller.isActive ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {seller.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreSeller(seller.id.toString())}
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
      {
        selectedSeller && (
          <DeactivationPeriodModal
            open={deactivationModalOpen}
            onOpenChange={setDeactivationModalOpen}
            sellerId={selectedSeller.id.toString()}
            sellerName={selectedSeller.name as string}
            onSuccess={handleDeactivationPeriodSuccess}
          />
        )
      }
    </div>
  );
}
