import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  UserCog,
  ShieldCheck,
  Briefcase,
  Filter,
  X,
  EyeOff,
  CalendarClock,
} from 'lucide-react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '../components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AddUserModal } from '../components/AddUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ViewUserModal } from '../components/ViewUserModal';
import { DeactivationPeriodModal } from '../components/DeactivationPeriodModal';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { usersAPI } from '../services/api';
import { UserRole } from '@/contexts/AuthContext';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [hiddenUserIds, setHiddenUserIds] = useState<Set<string>>(new Set());
  const [hiddenUsersDialogOpen, setHiddenUsersDialogOpen] = useState(false);
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
  const [userForDeactivation, setUserForDeactivation] = useState<User | null>(null);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Connect to backend API
      console.log()
      const response = await usersAPI.getAll();
      setUsers(response);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Empty state until backend is connected
      // setUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user is temporarily deactivated (within deactivation period)
  const isTemporarilyDeactivated = (user: User) => {
    if (!user.deactivationFrom || !user.deactivationTo) return false;
    const now = new Date();
    const from = new Date(user.deactivationFrom);
    const to = new Date(user.deactivationTo);
    return now >= from && now <= to;
  };

  // Helper function to check if deactivation is scheduled for future
  const isScheduledForFuture = (user: User) => {
    if (!user.deactivationFrom) return false;
    const now = new Date();
    const from = new Date(user.deactivationFrom);
    return from > now;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate stats (excluding hidden users)
  const visibleUsers = users.filter((u) => !hiddenUserIds.has(u.id));
  const totalUsers = visibleUsers.length;
  // const totalAdmins = visibleUsers.filter((u) => u.role === UserRole.Admin).length;
  // const totalSellers = visibleUsers.filter((u) => u.role === UserRole.Seller).length;
  // const totalAgents = visibleUsers.filter((u) => u.role === UserRole.agent).length;

  // Apply filters
  const filteredUsers = visibleUsers.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery?.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const userDate = new Date(user.registrationDate);
      if (dateFrom && dateTo) {
        matchesDateRange = userDate >= dateFrom && userDate <= dateTo;
      } else if (dateFrom) {
        matchesDateRange = userDate >= dateFrom;
      } else if (dateTo) {
        matchesDateRange = userDate <= dateTo;
      }
    }

    return matchesSearch && matchesRole && matchesDateRange;
  });

  //  Add User
  const handleAddUser = async (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    salary: number;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const createdUser = await usersAPI.create(userData);
      setUsers((prevUsers) => [createdUser, ...prevUsers]);
      toast.success(`User ${userData.name} added successfully`);
      setAddModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Error adding user");
    }
  };

  //  Update User
  const handleUpdateUser = async (user: any) => {
    // try {
    //   await usersAPI.update(userData.id, userData);
    //   setUsers(users.map((u) => (u.id === userData.id ? userData : u)));
    //   toast.success(`User ${userData.name} updated successfully`);
    //   setEditModalOpen(false);
    // } catch (error) {
    //   console.error("Error updating user:", error);
    //   toast.error("Error updating user");
    // }
    setSelectedUser(user);
    setEditModalOpen(true);

  };

  //  View details
  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  //  Delete User
  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await usersAPI.delete(userToDelete.id);
        setUsers(users.filter((u) => u.id !== userToDelete.id));
        toast.success(`User ${userToDelete.name} deleted successfully`);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Error deleting user");
      }
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  //  Activate / Deactivate User
  // const handleStatusToggle = async (userId: string, currentStatus: "active" | "inactive") => {
  //   const newStatus = currentStatus === "active" ? "inactive" : "active";
  //   try {
  //     await usersAPI.updateStatus(userId, newStatus);
  //     setUsers(
  //       users.map((u) =>
  //         u.id === userId ? { ...u, status: newStatus } : u
  //       )
  //     );
  //     toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     toast.error("Failed to update user status");
  //   }
  // };
  const handleHideUser = (userId: string) => {
    setHiddenUserIds((prev) => new Set([...prev, userId]));
    toast.success('User hidden successfully');
  };

  const handleRestoreUser = (userId: string) => {
    setHiddenUserIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    toast.success('User restored successfully');
  };

  const handleRestoreAllUsers = () => {
    setHiddenUserIds(new Set());
    setHiddenUsersDialogOpen(false);
    toast.success('All users restored successfully');
  };

  // const handleDeleteUser = (user: User) => {
  //   setUserToDelete(user);
  //   setDeleteDialogOpen(true);
  // };

  // const confirmDelete = () => {
  //   if (userToDelete) {
  //     setUsers(users.filter((u) => u.id !== userToDelete.id));
  //     toast.success(`User ${userToDelete.name} deleted successfully`);
  //     setDeleteDialogOpen(false);
  //     setUserToDelete(null);
  //   }
  // };

  const handleStatusToggle = (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers(
      users.map((u) =>
        u.id === userId
          ? {
            ...u,
            status: newStatus,
          }
          : u
      )
    );
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
  };

  const handleSetDeactivationPeriod = (user: User) => {
    setUserForDeactivation(user);
    setDeactivationModalOpen(true);
  };

  const handleSaveDeactivationPeriod = (dateFrom: Date | undefined, dateTo: Date | undefined) => {
    if (userForDeactivation) {
      setUsers(
        users.map((u) =>
          u.id === userForDeactivation.id
            ? {
              ...u,
              deactivationFrom: dateFrom?.toISOString(),
              deactivationTo: dateTo?.toISOString(),
            }
            : u
        )
      );

      if (dateFrom && dateTo) {
        const now = new Date();
        if (now >= dateFrom && now <= dateTo) {
          toast.success('User deactivation period set. User is currently deactivated.');
        } else if (dateFrom > now) {
          toast.success('User deactivation scheduled successfully.');
        }
      } else {
        toast.success('Deactivation period cleared.');
      }
    }
    setDeactivationModalOpen(false);
    setUserForDeactivation(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700';
      case UserRole.Seller:
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700';
      case UserRole.agent:
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return <ShieldCheck className="w-4 h-4" />;
      case UserRole.Seller:
        return <Briefcase className="w-4 h-4" />;
      case UserRole.agent:
        return <UserCog className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return 'bg-purple-500 text-white';
      case UserRole.Seller:
        return 'bg-orange-500 text-white';
      case UserRole.agent:
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (roleFilter !== 'all' ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-slate-900 dark:text-slate-100">User Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage users and their access to the system
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Admins</p>
                  <h2 className="text-slate-900 dark:text-slate-100">{totalUsers}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    All users in system
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Admins</p>
                  <h2 className="text-slate-900 dark:text-slate-100">{totalAdmins}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Administrators</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Sellers</p>
                  <h2 className="text-slate-900 dark:text-slate-100">{totalSellers}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sales team</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Agents</p>
                  <h2 className="text-slate-900 dark:text-slate-100">{totalAgents}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Delivery agents</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card> */}
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>Manage Admins and their access permissions</CardDescription>
              </div>
              <div className="flex gap-2">
                {hiddenUserIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHiddenUsersDialogOpen(true)}
                    className="gap-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <EyeOff className="w-4 h-4" />
                    {hiddenUserIds.size} Hidden {hiddenUserIds.size === 1 ? 'User' : 'Users'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={loadUsers}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAddAdminModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
                {/* <Button
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {/* <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        From: {dateFrom ? dateFrom.toLocaleDateString() : 'Select'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover> */}

                  {/* <span className="text-slate-500">To</span> */}

                  {/* <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        To: {dateTo ? dateTo.toLocaleDateString() : 'Select'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        disabled={(date) => (dateFrom ? date < dateFrom : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover> */}
                </div>

                <Button variant="default" size="sm" onClick={() => { }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filter
                </Button>

                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Role Filter Tabs */}
              <Tabs value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {/* <TabsTrigger value="admin">Admins</TabsTrigger> */}
                  {/* <TabsTrigger value="seller">Sellers</TabsTrigger> */}
                  {/* <TabsTrigger value="agent">Agents</TabsTrigger> */}
                </TabsList>
              </Tabs>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>USER ID</TableHead>
                      <TableHead>NAME</TableHead>
                      <TableHead>EMAIL</TableHead>
                      {/* <TableHead>PHONE</TableHead> */}
                      {/* <TableHead>ROLE</TableHead> */}
                      <TableHead>SALARY</TableHead>
                      <TableHead>STATUS</TableHead>
                      {/* <TableHead>REGISTRATION DATE</TableHead> */}
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
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className={getAvatarColor(user.role)}>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          {/* <TableCell>{user.phone}</TableCell> */}
                          {/* <TableCell> */}
                          {/* <Badge variant="outline" className={getRoleColor(user.role)}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1 capitalize">{user.role}</span>
                            </Badge> */}
                          {/* </TableCell> */}
                          <TableCell>${user.salary?.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={user.status === 'active' && !isTemporarilyDeactivated(user)}
                                  onCheckedChange={() => handleStatusToggle(user.id, user.status)}
                                  className="data-[state=checked]:bg-green-500"
                                />
                                <span className={`text-sm font-semibold ${user?.status === 'active' && !isTemporarilyDeactivated(user)
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                                  }`}>
                                  {user.status === 'active' && !isTemporarilyDeactivated(user) ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {isTemporarilyDeactivated(user) && user.deactivationTo && (
                                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-1.5">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <CalendarClock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                                    <span className="text-xs text-amber-900 dark:text-amber-200 font-semibold">Currently Deactivated</span>
                                  </div>
                                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                    Deactivated until {formatDate(user.deactivationTo)}. Cannot log in during this period.
                                  </p>
                                </div>
                              )}
                              {user.deactivationFrom && user.deactivationTo && !isTemporarilyDeactivated(user) && isScheduledForFuture(user) && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1.5">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <CalendarClock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 flex-shrink-0" />
                                    <span className="text-xs text-blue-900 dark:text-blue-200 font-semibold">Scheduled Deactivation</span>
                                  </div>
                                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                    From {formatDate(user.deactivationFrom)} to {formatDate(user.deactivationTo)}.
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {/* <TableCell>
                            {new Date(user.registrationDate).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                          </TableCell> */}
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDeactivationPeriod(user)}
                                className="gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Set Deactivation Period"
                              >
                                <CalendarClock className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(user)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateUser(user)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHideUser(user.id)}
                                className="gap-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Hide User"
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
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <AddUserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddUser}
      />
      <AddUserModal
        open={addAdminModalOpen}
        onOpenChange={setAddAdminModalOpen}
        onSubmit={handleAddUser}
        defaultRole={UserRole.Admin}
      />
      <ViewUserModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        user={selectedUser}
      />
      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdate={handleUpdateUser}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Users Dialog */}
      <AlertDialog open={hiddenUsersDialogOpen} onOpenChange={setHiddenUsersDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hidden Users ({hiddenUserIds.size})</AlertDialogTitle>
            <AlertDialogDescription>
              Manage hidden users. You can restore individual users or all at once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => hiddenUserIds.has(u.id))
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreUser(user.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreAllUsers} className="bg-green-600 hover:bg-green-700">
              Restore All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivation Period Modal */}
      <DeactivationPeriodModal
        open={deactivationModalOpen}
        onOpenChange={setDeactivationModalOpen}
        onSuccess={handleSaveDeactivationPeriod}
        currentFromDate={userForDeactivation?.deactivationFrom}
        currentToDate={userForDeactivation?.deactivationTo}
        itemName={userForDeactivation?.name || ''}
        itemType="User"
        adminId={userForDeactivation?.id}
      />
    </div>
  );
}
