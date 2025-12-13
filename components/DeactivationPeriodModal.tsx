import { useTranslation } from "react-i18next";
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
import { Input } from './ui/input';
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
  itemName,
  itemType,
  currentToDate,
  onSuccess,
}: DeactivationPeriodModalProps) {
  const { t } = useTranslation();
  // Use the new props if available, otherwise fall back to old props
  // const entityId = itemId || sellerId || agentId || adminId || '';
  const entityName = itemName || sellerName || agentName || adminName || '';
  const entityType = itemType || UserRole.Seller || UserRole.agent || UserRole.Admin;
  const [loading, setLoading] = useState(false);
  // fromDate is no longer needed as the backend handles it (defaults to now)
  const [toDate, setToDate] = useState<Date | undefined>(
    currentToDate ? new Date(currentToDate) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(
    currentToDate ? format(new Date(currentToDate), 'HH:mm') : '00:00'
  );

  useEffect(() => {
    if (open) {
      const date = currentToDate ? new Date(currentToDate) : undefined;
      setToDate(date);
      setSelectedTime(date ? format(date, 'HH:mm') : '00:00');
    }
  }, [open, currentToDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!toDate) {
      toast.error('Please select an end date');
      return;
    }

    // Combine date and time
    const finalDate = new Date(toDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    finalDate.setHours(hours || 0, minutes || 0, 0, 0);

    // Ensure finalDate is in the future
    if (finalDate < new Date()) {
      toast.error('End date and time must be in the future');
      return;
    }

    setLoading(true);

    try {
      if (adminId) {
        await usersAPI.lockout(Number(adminId), true, finalDate.toISOString())
        toast.success('Lockout period set successfully');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(null, finalDate.toISOString());
        }
      }

      if (agentId) {
        await agentsAPI.agentLockout(agentId.toString(), finalDate.toISOString(), true)
        toast.success('Lockout period set successfully');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(null, finalDate.toISOString());
        }
      }

      if (sellerId) {
        await sellersAPI.sellersLockout(sellerId.toString(), finalDate.toISOString(), true)
        toast.success('Lockout period set successfully');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(null, finalDate.toISOString());
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
          <DialogTitle>{t("Set Deactivation Period")}</DialogTitle>
          <DialogDescription>
            {t("Set a temporary deactivation period for The account will be inactive until the selected date.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* To Date */}
            {/* To Date and Time */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label>{t("To Date")}</Label>
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
              <div className="w-32 space-y-2">
                <Label>{t("Time")}</Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>

            {/* Info Alert */}
            {toDate && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  The {entityType.toLowerCase()} will be unable to log in until{' '}
                  <span className="font-semibold">
                    {format(toDate, 'PPP')} at {selectedTime}
                  </span>.
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
              {t("Clear Period")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("Save Period")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
