import  { useState, useMemo } from 'react';
import { Branch } from '../types';
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
  Phone,
  User,
  Package,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hiddenBranchIds, setHiddenBranchIds] = useState<Set<string>>(new Set());
  const [hiddenBranchesDialogOpen, setHiddenBranchesDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate statistics
  const stats = useMemo(() => {
    const activeBranches = branches.filter(b => b.status === 'active').length;
    const totalOrders = branches.reduce((sum, b) => sum + b.totalOrders, 0);
    const totalAgents = branches.reduce((sum, b) => sum + b.totalAgents, 0);

    return {
      totalBranches: branches.length,
      activeBranches,
      totalOrders,
      totalAgents,
    };
  }, [branches]);

  // Filter branches based on search and hidden status
  const filteredBranches = useMemo(() => {
    // First filter out hidden branches
    const visibleBranches = branches.filter(branch => !hiddenBranchIds.has(branch.id));
    
    if (!searchQuery.trim()) return visibleBranches;

    const query = searchQuery.toLowerCase();
    return visibleBranches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query) ||
        branch.country.toLowerCase().includes(query) ||
        branch.manager?.toLowerCase().includes(query) ||
        branch.id.toLowerCase().includes(query)
    );
  }, [branches, searchQuery, hiddenBranchIds]);

  // Get hidden branches
  const hiddenBranches = useMemo(() => {
    return branches.filter(branch => hiddenBranchIds.has(branch.id));
  }, [branches, hiddenBranchIds]);

  // Pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = (branchId: string, currentStatus: string) => {
    setBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.id === branchId
          ? { ...branch, status: currentStatus === 'active' ? 'inactive' : 'active' }
          : branch
      )
    );
    toast.success(
      currentStatus === 'active' 
        ? 'Branch deactivated successfully' 
        : 'Branch activated successfully'
    );
  };

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };

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

  const handleAddSuccess = (newBranch: Branch) => {
    setBranches(prevBranches => [newBranch, ...prevBranches]);
  };

  const handleEditSuccess = (updatedBranch: Branch) => {
    setBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.id === updatedBranch.id ? updatedBranch : branch
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">All Branches</p>
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Now</p>
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Agents</p>
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
        <h1 className="text-2xl font-bold">Branch Management</h1>
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
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Branch
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="font-semibold">Branches ({filteredBranches.length})</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage and track your branches ({filteredBranches.length})
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>BRANCH NAME</TableHead>
                  <TableHead>ADDRESS</TableHead>
                  <TableHead>COUNTRY</TableHead>
                  <TableHead>MANAGER</TableHead>
                  <TableHead className="text-center">ORDERS</TableHead>
                  <TableHead className="text-center">AGENTS</TableHead>
                  <TableHead>BUSINESS HOURS</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
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
                      <TableCell className="font-medium">{branch.id}</TableCell>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {branch.address}
                      </TableCell>
                      <TableCell>{branch.country}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {branch.manager || 'Not assigned'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{branch.totalOrders}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{branch.totalAgents}</span>
                      </TableCell>
                      <TableCell className="text-sm text-blue-600 dark:text-blue-400">
                        {branch.businessHours || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={branch.status === 'active'}
                            onCheckedChange={() => handleToggleStatus(branch.id, branch.status)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Badge
                            variant={branch.status === 'active' ? 'default' : 'secondary'}
                            className={
                              branch.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {branch.status === 'active' ? 'Active' : 'Deactivate'}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(branch)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Edit Branch"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleHideBranch(branch.id)}
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
              Showing {paginatedBranches.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, filteredBranches.length)} of{' '}
              {filteredBranches.length} items
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
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
                Next
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

          {selectedBranch && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedBranch.status === 'active' ? 'default' : 'secondary'}
                  className={
                    selectedBranch.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }
                >
                  {selectedBranch.status === 'active' ? 'Active' : 'Inactive'}
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
                    <p className="font-medium">{selectedBranch.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </div>
                    <p className="font-medium">{selectedBranch.address}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      Country
                    </div>
                    <p className="font-medium">{selectedBranch.country}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="font-medium">{selectedBranch.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <User className="w-4 h-4" />
                      Manager
                    </div>
                    <p className="font-medium">{selectedBranch.manager || 'Not assigned'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Package className="w-4 h-4" />
                      Total Orders
                    </div>
                    <p className="font-medium">{selectedBranch.totalOrders}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Users className="w-4 h-4" />
                      Total Agents
                    </div>
                    <p className="font-medium">{selectedBranch.totalAgents}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <Clock className="w-4 h-4" />
                      Business Hours
                    </div>
                    <p className="font-medium">{selectedBranch.businessHours || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                      onClick={() => handleRestoreBranch(branch.id)}
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
