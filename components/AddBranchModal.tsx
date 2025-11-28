import React, { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminResponse, NewBranchRequest, User } from '../types';
import { branchesAPI, usersAPI } from '@/services/api';


interface AddBranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newBranch: NewBranchRequest) => void;
}

export function AddBranchModal({ open, onOpenChange, onSuccess }: AddBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewBranchRequest>({
    name: '',
    managerId: 0,
    address: '',
    country: '',
    open: '09:00',
    close: '17:00',
    isActive: true,
  });

  const [admins, setAdmins] = useState<AdminResponse[]>([]);

  const getAdmins = async () => {
    const adminsResponse = await usersAPI.getAll();
    setAdmins(adminsResponse);
  }

  useEffect(() => {
    getAdmins();
    console.log(admins);

  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Format times to .NET System.TimeOnly format (HH:mm:ss)
      const formatTimeOnly = (time: string): string => {
        // If time is already in HH:mm:ss format, return as is
        if (time.split(':').length === 3) {
          return time;
        }
        // If time is in HH:mm format, add :00 for seconds
        if (time.split(':').length === 2) {
          return `${time}:00`;
        }
        return time;
      };

      const newBranch: NewBranchRequest = {
        name: formData.name,
        address: formData.address,
        country: formData.country,
        managerId: formData.managerId,
        open: formatTimeOnly(formData.open),
        close: formatTimeOnly(formData.close),
        isActive: formData.isActive ? true : false,
      };
      await branchesAPI.create(newBranch)

      onSuccess(newBranch);
      toast.success('Branch added successfully');
      onOpenChange(false);

      // Reset form
      setFormData({
        name: '',
        managerId: 0,
        address: '',
        country: '',
        open: '09:00',
        close: '17:00',
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to add branch:', error);
      toast.error('Failed to add branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name and Manager */}
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
                Manager <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.managerId === 0 ? '' : String(formData.managerId)}
                onValueChange={
                  (value) => {


                    setFormData({
                      ...formData, managerId: parseInt(value || '0')
                    })
                  }
                }
              >
                <SelectTrigger id="managerId">
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  {admins
                    .map((admin) => (
                      <SelectItem key={admin.id} value={String(admin.id)}>
                        {admin.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                  id="status"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <label
                  htmlFor="status"
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
              Create Branch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
