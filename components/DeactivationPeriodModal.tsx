import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './ui/utils';
import { UserRole } from '@/contexts/AuthContext';
import { agentsAPI, sellersAPI, usersAPI } from '@/services/api';

interface DeactivationPeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Support both old props (for sellers) and new props (for agents)
  adminId?: string;
  adminName?: string;
  agentId?: string | number;
  agentName?: string;
  sellerId?: string | number;
  sellerName?: string;
  itemId?: string | number;
  itemName?: string;
  itemType?: string;
  currentFromDate?: string | any;
  currentToDate?: string;
  onSuccess?: (fromDate: string | any | null, toDate: string | any | null) => any;
}

export function DeactivationPeriodModal({
  open,
  onOpenChange,
  adminId,
  adminName,
  agentId,
  agentName,
  sellerId,
  sellerName,
  itemId,
  itemName,
  itemType,
  currentFromDate,
  currentToDate,
  onSuccess,
}: DeactivationPeriodModalProps) {
  // Use the new props if available, otherwise fall back to old props
  // const entityId = itemId || sellerId || agentId || adminId || '';
  const entityName = itemName || sellerName || agentName || adminName || '';
  const entityType = itemType || UserRole.Seller || UserRole.agent || UserRole.Admin;
  const [loading, setLoading] = useState(false);
  // fromDate is no longer needed as the backend handles it (defaults to now)
  const [toDate, setToDate] = useState<Date | undefined>(
    currentToDate ? new Date(currentToDate) : undefined
  );

  useEffect(() => {
    if (open) {
      setToDate(currentToDate ? new Date(currentToDate) : undefined);
    }
  }, [open, currentToDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!toDate) {
      toast.error('Please select an end date');
      return;
    }
    // Ensure toDate is in the future
    if (toDate < new Date()) {
      toast.error('End date must be in the future');
      return;
    }

    setLoading(true);

    try {
      if (adminId) {
        await usersAPI.lockout(Number(adminId), true, toDate.toISOString())
        toast.success('Lockout period set successfully');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(null, toDate.toISOString());
        }
      }

      if (agentId) {
        await agentsAPI.agentLockout(agentId.toString(), toDate.toISOString(), true)
        toast.success('Lockout period set successfully');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(null, toDate.toISOString());
        }
      }

      if (sellerId) {
        await sellersAPI.sellersLockout(sellerId.toString(), toDate.toISOString(), true)
        toast.success('Lockout period set successfully');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(null, toDate.toISOString());
        }
      }
    } catch (error) {
      console.error('Failed to set lockout period:', error);
      toast.error('Failed to set lockout period');
    } finally {
      setLoading(false);
    }
  };

  const handleClearPeriod = async () => {
    setLoading(true);

    try {
      if (adminId) {
        await usersAPI.lockout(Number(adminId), false, new Date().toISOString());
      }

      toast.success('Deactivation period cleared');

      setToDate(undefined);

      onOpenChange(false);

      // Notify parent component
      if (onSuccess) {
        onSuccess(null, null);
      }
    } catch (error) {
      console.error('Failed to clear deactivation period:', error);
      toast.error('Failed to clear deactivation period');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Deactivation Period</DialogTitle>
          <DialogDescription>
            Set a temporary deactivation period for <span className="font-semibold text-slate-900 dark:text-slate-100">{entityName}</span>.
            The account will be inactive until the selected date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* To Date */}
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !toDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Info Alert */}
            {toDate && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  The {entityType.toLowerCase()} will be unable to log in until{' '}
                  <span className="font-semibold">{format(toDate, 'PPP')}</span>.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearPeriod}
              disabled={loading}
              className="gap-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4" />
              Clear Period
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Period
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
