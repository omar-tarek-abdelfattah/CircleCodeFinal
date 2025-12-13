import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from 'react';
import { NewBranchRequest, BranchData, BranchResponseDetails } from '../types';
import { Card } from '../components/ui/card';
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
import { AddBranchModal } from '../components/AddBranchModal';
import { EditBranchModal } from '../components/EditBranchModal';
import {
  Building2,
  CheckCircle2,
  DollarSign,
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  User,
  Package,
  Clock,
  RefreshCw,
  CircleX,
} from 'lucide-react';
import { toast } from 'sonner';
import { branchesAPI } from '@/services/api';
import { useAuth, UserRole } from '../contexts/AuthContext';

export function BranchesPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [branchDetails, setBranchDetails] = useState<BranchResponseDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hiddenBranchIds, setHiddenBranchIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hiddenBranchIds');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('hiddenBranchIds', JSON.stringify(Array.from(hiddenBranchIds)));
  }, [hiddenBranchIds]);
  const [hiddenBranchesDialogOpen, setHiddenBranchesDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalBranches: 0,
    activeBranches: 0,
    totalOrders: 0,
    totalAgents: 0,
    inactiveBranches: 0,
  });
  const itemsPerPage = 10;

  // Helper function to map BranchData[] to Branch[]
  const mapBranchDataToBranch = (branchData: BranchData): BranchData => ({
    id: branchData.id,
    name: branchData.name,
    address: branchData.address || '',
    country: branchData.country || '',
    managerName: branchData.managerName,
    ordersNumber: branchData.ordersNumber,
    agentsNumber: branchData.agentsNumber,
    isActive: branchData.isActive,
  });
  const getAllBranches = async () => {
    setLoading(true)
    try {
      const result = await branchesAPI.getAll();

      const mappedBranches: BranchData[] = (result.data || []).map(mapBranchDataToBranch) as BranchData[];

      setBranches(mappedBranches);
      setStats({
        totalBranches: result.totalBranch,
        activeBranches: result.activeBranchNumber,
        totalOrders: result.totalOrders,
        totalAgents: result.totalAgents,
        inactiveBranches: result.inActiveBranchNumber,
      });
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    }
    finally { setLoading(false) }
  };
  // Fetch branches on component mount
  useEffect(() => {
    getAllBranches();
  }, []);

  const handleRefresh = () => {
    getAllBranches()
  }

  // Calculate statistics


  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // Filter branches based on search and hidden status
  const filteredBranches = useMemo(() => {
    // First filter out hidden branches
    let visibleBranches = branches.filter(branch => !hiddenBranchIds.has(branch.id.toString()));

    // Filter by inactive status if enabled
    if (showInactiveOnly) {
      visibleBranches = visibleBranches.filter(branch => !branch.isActive);
    }

    if (!searchQuery.trim()) return visibleBranches;

    const query = searchQuery.toLowerCase();
    return visibleBranches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(query) ||
        branch.address?.toLowerCase().includes(query) ||
        branch.country?.toLowerCase().includes(query) ||
        branch.managerName?.toLowerCase().includes(query) ||
        branch.id?.toString().toLowerCase().includes(query)
    );
  }, [branches, searchQuery, hiddenBranchIds, showInactiveOnly]);

  // Get hidden branches
  const hiddenBranches = useMemo(() => {
    return branches.filter(branch => hiddenBranchIds.has(branch.id.toString()));
  }, [branches, hiddenBranchIds]);

  // Pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = async (branchId: string, currentStatus: boolean) => {

    await branchesAPI.toggleActivation(parseInt(branchId), currentStatus);

    setBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.id.toString() === branchId
          ? { ...branch, isActive: currentStatus }
          : branch
      )
    );
    toast.success(
      currentStatus === false
        ? 'Branch deactivated successfully'
        : 'Branch activated successfully'
    );
  };

  const handleViewDetails = (branch: BranchData) => {
    setSelectedBranch(branch);
    setIsViewModalOpen(true);
  };

  const handleEdit = (branch: BranchData) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (selectedBranch && isViewModalOpen) {
        setDetailsLoading(true);
        try {
          const details = await branchesAPI.getById(selectedBranch.id.toString());
          setBranchDetails(details);
        } catch (error) {
          console.error('Failed to fetch branch details:', error);
          toast.error('Failed to load branch details');
        } finally {
          setDetailsLoading(false);
        }
      } else {
        setBranchDetails(null);
      }
    };

    fetchBranchDetails();
  }, [selectedBranch, isViewModalOpen]);

  const handleHideBranch = (branchId: string) => {
    setHiddenBranchIds(prev => {
      const newSet = new Set(prev);
      newSet.add(branchId);
      return newSet;
    });
    toast.success('Branch hidden successfully');
  };

  const handleRestoreBranch = (branchId: string) => {
    setHiddenBranchIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(branchId);
      return newSet;
    });
    toast.success('Branch restored successfully');
  };

  const handleRestoreAllBranches = () => {
    setHiddenBranchIds(new Set());
    setHiddenBranchesDialogOpen(false);
    toast.success('All branches restored successfully');
  };

  const handleAddSuccess = (_newBranch: NewBranchRequest): void => {
    // Refresh branches list after adding a new branch
    const getAllBranches = async () => {
      try {
        const result = await branchesAPI.getAll();
        const mappedBranches: BranchData[] = (result.data || []).map(mapBranchDataToBranch);
        setBranches(mappedBranches);
      } catch (error) {
        console.error('Failed to refresh branches:', error);
      }
    };
    getAllBranches();
  };

  const handleEditSuccess = () => {
    getAllBranches();
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("All Branches")}</p>
              <p className="text-3xl font-bold mt-1">{stats.totalBranches}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("Active Now")}</p>
              <p className="text-3xl font-bold mt-1">{stats.activeBranches}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("Inactive")} </p>
              <p className="text-3xl font-bold mt-1">{stats.inactiveBranches}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <CircleX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("Total Orders")}</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t("Total Agents")}</p>
              <p className="text-3xl font-bold mt-1">{stats.totalAgents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Branch Management")}</h1>
        <div className="flex gap-2">
          {hiddenBranches.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setHiddenBranchesDialogOpen(true)}
              className="gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Hidden ({hiddenBranches.length})
            </Button>
          )}
          {role === UserRole.SuperAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("Add Branch")}
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="font-semibold">{t("Branches")}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("Manage and track your branches")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t("Refresh")}
            </Button>

          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t("Search branches...")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="inactive-filter"
                checked={showInactiveOnly}
                onCheckedChange={setShowInactiveOnly}
              />
              <label
                htmlFor="inactive-filter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("Show Inactive Only")}
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  {/* <TableHead className="w-16">ID</TableHead> */}
                  <TableHead>{t("BRANCH NAME")}</TableHead>
                  <TableHead>{t("ADDRESS")}</TableHead>
                  <TableHead>{t("COUNTRY")}</TableHead>
                  <TableHead>{t("MANAGER")}</TableHead>
                  <TableHead className="text-center">{t("ORDERS")}</TableHead>
                  <TableHead className="text-center">{t("AGENTS")}</TableHead>
                  {/* <TableHead>BUSINESS HOURS</TableHead> */}
                  <TableHead>{t("STATUS")}</TableHead>
                  <TableHead className="text-right">{t("ACTIONS")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBranches.map((branch) => (
                    <TableRow key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      {/* <TableCell className="font-medium">{branch.id}</TableCell> */}
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {branch.address}
                      </TableCell>
                      <TableCell>{branch.country}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {branch.managerName || 'Not assigned'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{branch.ordersNumber}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{branch.agentsNumber}</span>
                      </TableCell>
                      {/* <TableCell className="text-sm text-blue-600 dark:text-blue-400">
                        {branch. || 'Not specified'}
                      </TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={branch.isActive}
                            onCheckedChange={() => handleToggleStatus(branch.id.toString(), branch.isActive ? false : true)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Badge
                            variant={branch.isActive ? 'default' : 'secondary'}
                            className={
                              branch.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {branch.isActive ? t('Active') : t('Deactivate')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(branch)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {role === UserRole.SuperAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(branch)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              title="Edit Branch"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleHideBranch(branch.id.toString())}
                            className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            title="Hide Branch"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("Showing")} {paginatedBranches.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, filteredBranches.length)} {t("of")}{' '}
              {filteredBranches.length} {t("Branches")}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t("Previous")}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Branch Details
            </DialogTitle>
            <DialogDescription>
              View complete information about this branch
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : branchDetails ? (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={branchDetails.isActive ? 'default' : 'secondary'}
                  className={
                    branchDetails.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }
                >
                  {branchDetails.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Branch Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Building2 className="w-4 h-4" />
                      Branch Name
                    </div>
                    <p className="font-medium">{branchDetails.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </div>
                    <p className="font-medium">{branchDetails.address}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      Country
                    </div>
                    <p className="font-medium">{branchDetails.country}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <User className="w-4 h-4" />
                      Manager
                    </div>
                    <p className="font-medium">{branchDetails.managerName || 'Not assigned'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Package className="w-4 h-4" />
                      Total Orders
                    </div>
                    <p className="font-medium">{branchDetails.ordersNumber}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Users className="w-4 h-4" />
                      Total Agents
                    </div>
                    <p className="font-medium">{branchDetails.agentsNumber}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Clock className="w-4 h-4" />
                      Business Hours
                    </div>
                    <p className="font-medium">
                      {branchDetails.open} - {branchDetails.close}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Add Branch Modal */}
      <AddBranchModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Branch Modal */}
      <EditBranchModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        branch={selectedBranch}
        onSuccess={handleEditSuccess}
      />

      {/* Hidden Branches Dialog */}
      <Dialog open={hiddenBranchesDialogOpen} onOpenChange={setHiddenBranchesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5" />
              Hidden Branches ({hiddenBranches.length})
            </DialogTitle>
            <DialogDescription>
              Manage branches that have been hidden from the main list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hiddenBranches.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No hidden branches</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hiddenBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-slate-500">{branch.address}, {branch.country}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreBranch(branch.id.toString())}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHiddenBranchesDialogOpen(false)}>
              Close
            </Button>
            {hiddenBranches.length > 0 && (
              <Button
                onClick={handleRestoreAllBranches}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Restore All
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
