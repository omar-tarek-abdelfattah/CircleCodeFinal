import React, { useState } from 'react';
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
import { Branch } from '../types';
import { mockUsers } from '../lib/mockData';

interface AddBranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (branch: Branch) => void;
}

export function AddBranchModal({ open, onOpenChange, onSuccess }: AddBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    managerId: '',
    address: '',
    country: '',
    openingTime: '09:00',
    closingTime: '17:00',
    status: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!formData.managerId.trim()) {
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
    if (!formData.openingTime) {
      toast.error('Opening time is required');
      return;
    }
    if (!formData.closingTime) {
      toast.error('Closing time is required');
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect to backend API
      // await branchesAPI.create(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Format times to display format
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      };

      // Find the selected manager's name
      const selectedManager = mockUsers.find(u => u.id === formData.managerId);

      const newBranch: Branch = {
        id: `${Date.now()}`,
        name: formData.name,
        address: formData.address,
        country: formData.country,
        managerId: formData.managerId,
        manager: selectedManager?.name || '',
        phone: '', // Set default or get from backend
        totalOrders: 0,
        totalAgents: 0,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        businessHours: `${formatTime(formData.openingTime)} - ${formatTime(formData.closingTime)}`,
        status: formData.status ? 'active' : 'inactive',
        createdAt: new Date().toISOString(),
      };

      onSuccess(newBranch);
      toast.success('Branch added successfully');
      onOpenChange(false);

      // Reset form
      setFormData({
        name: '',
        managerId: '',
        address: '',
        country: '',
        openingTime: '09:00',
        closingTime: '17:00',
        status: true,
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
                value={formData.managerId}
                onValueChange={(value) => setFormData({ ...formData, managerId: value })}
              >
                <SelectTrigger id="managerId">
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers
                    .filter(user => user.role === 'admin' && user.status === 'active')
                    .map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
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
                  checked={formData.status}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, status: checked as boolean })
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
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">
                Closing Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closingTime"
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
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
    </Dialog>
  );
}
