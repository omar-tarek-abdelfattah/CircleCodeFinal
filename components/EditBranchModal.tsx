import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Branch, BranchUpdate } from '../types';
import { branchesAPI } from '@/services/api';

interface EditBranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSuccess: (branch: any) => void;
}

export function EditBranchModal({ open, onOpenChange, branch, onSuccess }: EditBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BranchUpdate>({} as BranchUpdate);


  const populateForm = async () => {
    setLoading(true)
    try {
      const result = await branchesAPI.getById(branch?.id.toString() as string)
      return result;
    } catch (error) {
      console.error('failed to get branch details', error)
      return null;
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (branch && open) {
        const details = await populateForm();

        // Parse times from businessHours or use defaults
        let openingTime = '09:00';
        let closingTime = '17:00';

        if (details?.open) {
          openingTime = details.open;
          closingTime = details.close;
        }

        setFormData({
          id: branch?.id as unknown as number,
          name: details?.name as string || branch.name,
          managerId: 1,
          address: details?.address as string || branch.address,
          country: details?.country as string || branch.country,
          open: openingTime,
          close: closingTime,
          isActive: details?.isActive ?? (branch.status === 'active'),
        });
      }
    };
    init();
  }, [branch, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branch) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!formData.managerId) {
      toast.error('Manager ID is required');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!formData.country.trim()) {
      toast.error('Country is required');
      return;
    }
    if (!formData.open) {
      toast.error('Opening time is required');
      return;
    }
    if (!formData.close) {
      toast.error('Closing time is required');
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect to backend API
      try {
        const result = await branchesAPI.update(branch.id, formData);

        onSuccess(result)

        onOpenChange(false)
      } catch (error) {
        console.error('failed to edit branch', error)
        toast.error('failed to edit branch')
      }

      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // Format times to display format
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours as string);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      };

      const updatedBranch: BranchUpdate = {
        id: parseInt(branch.id),
        name: formData.name,
        managerId: 1,
        address: formData.address,
        country: formData.country,
        open: formData.open,
        close: formData.close,
        isActive: formData.isActive,
      };

      onSuccess(updatedBranch);
      toast.success('Branch updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update branch:', error);
      toast.error('Failed to update branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name and Manager ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Branch Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter branch name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerId">
                Manager ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="managerId"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: parseInt(e.target.value) })}
                placeholder="Enter manager ID"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter branch address"
            />
          </div>

          {/* Country and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter country name"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center h-10 space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <label
                  htmlFor="isActive"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Opening Time and Closing Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingTime">
                Opening Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="openingTime"
                type="time"
                value={formData.open}
                onChange={(e) => setFormData({ ...formData, open: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">
                Closing Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closingTime"
                type="time"
                value={formData.close}
                onChange={(e) => setFormData({ ...formData, close: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Branch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
