import { useTranslation } from "react-i18next";
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
import { Loader2, RefreshCw } from 'lucide-react';
import { AdminResponse, BranchData, BranchUpdate } from '../types';
import { branchesAPI, usersAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditBranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: BranchData | null;
  onSuccess: (branch: any) => void;
}

export function EditBranchModal({ open, onOpenChange, branch, onSuccess }: EditBranchModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BranchUpdate>({} as BranchUpdate);
  const [managers, setManagers] = useState<AdminResponse[] | null>(null);

  const fetchData = async () => {
    if (branch && open) {
      setLoading(true);
      try {
        const [branchDetails, usersResult] = await Promise.all([
          branchesAPI.getById(branch.id.toString()),
          usersAPI.getAll()
        ]);

        setManagers(usersResult);

        // Parse times from businessHours or use defaults
        let openingTime = '09:00';
        let closingTime = '17:00';

        if (branchDetails?.open) {
          openingTime = branchDetails.open;
          closingTime = branchDetails.close;
        }

        setFormData({
          id: branch.id as unknown as number,
          name: branchDetails?.name || branch.name,
          managerId: usersResult.find((manager) => manager.name === branch.managerName)?.id || 0,
          address: branchDetails?.address || branch.address || '',
          country: branchDetails?.country || branch.country || '',
          open: openingTime,
          close: closingTime,
          isActive: branchDetails?.isActive ?? branch.isActive,
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load branch details');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
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
        console.log(formData);

        const result = await branchesAPI.update(branch.id.toString(), formData);

        onSuccess(result)

        onOpenChange(false)
      } catch (error) {
        console.error('failed to edit branch', error)
        toast.error('failed to edit branch')
      }


      // Format times to display format
      // const formatTime = (time: string) => {
      //   const [hours, minutes] = time.split(':');
      //   const hour = parseInt(hours as string);
      //   const ampm = hour >= 12 ? 'PM' : 'AM';
      //   const displayHour = hour % 12 || 12;
      //   return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      // };

      const updatedBranch: BranchUpdate = {
        id: branch.id,
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
        <DialogHeader className="flex flex-row items-center gap-2">
          <DialogTitle>{t("Edit Branch")}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            title="Refresh Details"
            className="h-6 w-6"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name and Manager ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("Branch Name")} <span className="text-red-500">*</span>
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
                {t("Manager")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.managerId?.toString() || '0'}
                onValueChange={(value) => setFormData({ ...formData, managerId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers?.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {t("Address")} <span className="text-red-500">*</span>
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
                {t("Country")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter country name"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Status")}</Label>
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
                  {t("Active")}
                </label>
              </div>
            </div>
          </div>

          {/* Opening Time and Closing Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingTime">
                {t("Opening Time")} <span className="text-red-500">*</span>
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
                {t("Closing Time")} <span className="text-red-500">*</span>
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
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Update Branch")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
