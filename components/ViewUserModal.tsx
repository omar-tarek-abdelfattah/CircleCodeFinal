import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { User } from '../types';
import { Users, Mail, Phone, ShieldCheck, Briefcase, UserCog, DollarSign, Calendar } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

interface ViewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ViewUserModal({ open, onOpenChange, user }: ViewUserModalProps) {
  if (!user) return null;

  const getRoleColor = () => {
    switch (user.role) {
      case UserRole.SuperAdmin:
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700';
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

  const getRoleIcon = () => {
    switch (user.role) {
      case UserRole.SuperAdmin:
        return <ShieldCheck className="w-4 h-4" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Details
          </DialogTitle>
          <DialogDescription>Detailed information about the user</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">User ID</p>
              <p className="font-mono font-semibold">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Registration Date</p>
              <p className="font-semibold">{formatDate(user.registrationDate)}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Contact Information
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Users className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Mail className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Phone className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="font-semibold">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Role & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Role</p>
                <Badge variant="outline" className={getRoleColor()}>
                  {getRoleIcon()}
                  <span className="ml-1 capitalize">{user.role}</span>
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Status</p>
                <Badge
                  variant="outline"
                  className={
                    user.status === 'active'
                      ? 'text-green-600 border-green-600'
                      : 'text-slate-600 border-slate-600'
                  }
                >
                  {user.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Financial Information
            </h3>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-green-700 dark:text-green-400">Salary</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${user.salary?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
