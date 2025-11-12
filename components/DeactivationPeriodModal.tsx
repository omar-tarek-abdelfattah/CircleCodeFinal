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

interface DeactivationPeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Support both old props (for sellers) and new props (for agents)
  sellerId?: string;
  sellerName?: string;
  itemId?: string;
  itemName?: string;
  itemType?: string;
  currentFromDate?: string;
  currentToDate?: string;
  onSuccess?: (fromDate: string | null, toDate: string | null) => void;
}

export function DeactivationPeriodModal({
  open,
  onOpenChange,
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
  const entityId = itemId || sellerId || '';
  const entityName = itemName || sellerName || '';
  const entityType = itemType || 'Seller';
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    currentFromDate ? new Date(currentFromDate) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    currentToDate ? new Date(currentToDate) : undefined
  );

  useEffect(() => {
    if (open) {
      setFromDate(currentFromDate ? new Date(currentFromDate) : undefined);
      setToDate(currentToDate ? new Date(currentToDate) : undefined);
    }
  }, [open, currentFromDate, currentToDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fromDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!toDate) {
      toast.error('Please select an end date');
      return;
    }
    if (toDate < fromDate) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect to backend API
      // await sellersAPI.setDeactivationPeriod(sellerId, {
      //   from: fromDate.toISOString(),
      //   to: toDate.toISOString(),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Deactivation period set successfully');

      onOpenChange(false);

      // Notify parent component
      if (onSuccess) {
        onSuccess(fromDate.toISOString(), toDate.toISOString());
      }
    } catch (error) {
      console.error('Failed to set deactivation period:', error);
      toast.error('Failed to set deactivation period');
    } finally {
      setLoading(false);
    }
  };

  const handleClearPeriod = async () => {
    setLoading(true);

    try {
      // TODO: Connect to backend API
      // await sellersAPI.clearDeactivationPeriod(sellerId);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Deactivation period cleared');

      setFromDate(undefined);
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

  const hasExistingPeriod = currentFromDate && currentToDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Deactivation Period</DialogTitle>
          <DialogDescription>
            Set a temporary deactivation period for <span className="font-semibold text-slate-900 dark:text-slate-100">{entityName}</span>. 
            The account will be inactive during this period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* From Date */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !fromDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

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
                      if (fromDate) {
                        return date < fromDate || date < today;
                      }
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Info Alert */}
            {fromDate && toDate && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  The {entityType.toLowerCase()} will be unable to log in from{' '}
                  <span className="font-semibold">{format(fromDate, 'PPP')}</span> to{' '}
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
