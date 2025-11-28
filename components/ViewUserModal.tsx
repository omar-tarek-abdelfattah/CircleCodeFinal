import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { AdminResponse } from '../types';
import { Users, Mail, DollarSign } from 'lucide-react';


interface ViewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminResponse | null;
}

export function ViewUserModal({ open, onOpenChange, user }: ViewUserModalProps) {
  if (!user) return null;



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
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Registration Date</p>
              <p className="font-semibold">{formatDate(user.hiringDate)}</p>
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
              {/* <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Phone className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="font-semibold">{user.}</p>
                </div>
              </div> */}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Status</h3>
            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Status</p>
                <Badge
                  variant="outline"
                  className={
                    user.isLock
                      ? 'text-slate-600 border-slate-600'
                      : 'text-green-600 border-green-600'
                  }
                >
                  {user.isLock ? 'INACTIVE' : 'ACTIVE'}
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
