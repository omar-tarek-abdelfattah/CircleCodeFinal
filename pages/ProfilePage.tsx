import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Calendar, Shield, Lock, Bell, Eye, EyeOff, Camera, Save, X, Edit, ShieldCheck, Briefcase, UserCog, DollarSign, Package, TrendingUp, Clock, Sparkles, } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { changePasswordApi } from '../services/api.ts';

export default function ProfilePage() {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile sections editing states
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // Personal information state
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // phone: user?.phone || '',
    role: user?.role || 'admin',
    // joinedDate: user?.joinedDate || new Date().toISOString(),
    // salary: user?.salary || 0,
  });


  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  // Mock statistics based on role
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Set role-specific statistics
      if (personalInfo.role === 'seller') {
        setStatistics({
          totalOrders: 342,
          activeOrders: 28,
          completedOrders: 314,
          revenue: 45680,
        });
      } else if (personalInfo.role === 'agent') {
        setStatistics({
          totalOrders: 156,
          activeOrders: 12,
          completedOrders: 144,
          revenue: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (personalInfo.role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700';
      case 'seller':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700';
      case 'agent':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  const getRoleIcon = () => {
    switch (personalInfo.role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'seller':
        return <Briefcase className="w-4 h-4" />;
      case 'agent':
        return <UserCog className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Personal information updated successfully');
      setEditingPersonal(false);
    } catch (error) {
      toast.error('Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPersonalEdit = () => {
    setEditingPersonal(false);
    // Reset to original values
    loadProfileData();
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      // استدعي الـ API
      await changePasswordApi(
        personalInfo.email,
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setEditingPassword(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };


  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification preferences updated');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-700 shadow-lg">
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(personalInfo.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {personalInfo.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={getRoleColor()}>
                    {getRoleIcon()}
                    <span className="ml-1 capitalize">{personalInfo.role}</span>
                  </Badge>
                  {/* <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(personalInfo.joinedDate)}</span>
                  </div> */}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300">{personalInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500" />
                    {/* <span className="text-slate-700 dark:text-slate-300">{personalInfo.phone}</span> */}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards (for Seller and Agent roles) */}
      {(personalInfo.role === 'seller' || personalInfo.role === 'agent') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {statistics.totalOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {statistics.activeOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {statistics.completedOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {personalInfo.role === 'seller' && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      ${statistics.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!editingPersonal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPersonal(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={personalInfo.name}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, name: e.target.value })
                  }
                  disabled={!editingPersonal}
                  className={!editingPersonal ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                  disabled={!editingPersonal}
                  className={!editingPersonal ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  // value={personalInfo.phone}
                  // onChange={(e) =>
                  //   setPersonalInfo({ ...personalInfo, phone: e.target.value })
                  // }
                  disabled={!editingPersonal}
                  className={!editingPersonal ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge variant="outline" className={getRoleColor()}>
                    {getRoleIcon()}
                    <span className="ml-1 capitalize">{personalInfo.role}</span>
                  </Badge>
                </div>
              </div>

              {role === UserRole.Admin && (
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <div className="flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
                    <DollarSign className="w-5 h-5" />
                    {personalInfo.salary.toLocaleString()}
                  </div>
                </div>
              )}

              {editingPersonal && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePersonalInfo}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelPersonalEdit}
                      disabled={saving}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Change Password */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600"
              >
                <Shield className="w-4 h-4 mr-2" />
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferences
              </CardTitle>
              <CardDescription>Manage your notification and display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>

              <Separator />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label>Email Notifications</Label>
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Coming Soon
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Receive email updates
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={() => { }}
                        disabled
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature will be available in the next update</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Updates</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get notified about order status changes
                  </p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={() => handleNotificationChange('orderUpdates')}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Important system notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.systemAlerts}
                  onCheckedChange={() => handleNotificationChange('systemAlerts')}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label>Marketing Emails</Label>
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Coming Soon
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Promotional content and offers
                        </p>
                      </div>
                      <Switch
                        checked={notifications.marketingEmails}
                        onCheckedChange={() => { }}
                        disabled
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature will be available in the next update</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
