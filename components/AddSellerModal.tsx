import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';
import { branchesAPI, sellersAPI } from '../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BranchData } from '@/types';
import { Switch } from './ui/switch';

interface AddSellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddSellerModal({ open, onOpenChange, onSuccess }: AddSellerModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    address: '',
    password: '',
    confirmPassword: '',
    branchId: 0,
    vip: true,
  });

  const loadBranches = async () => {
    try {
      const response = await branchesAPI.getAll();
      if (response && response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast.error('Failed to load branches');
    }
  };

  useEffect(() => {
    loadBranches();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter username');
      return;
    }

    // Username validation (alphanumeric only)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(formData.name)) {
      toast.error('Username must contain only letters and numbers');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter email');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      console.log('Form Data Submitted:', formData);

      const addedSeller = await sellersAPI.create(formData);
      console.log('Added Seller:', addedSeller);

      toast.success('Seller added successfully');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        storeName: '',
        address: '',
        password: '',
        confirmPassword: '',
        branchId: 0,
        vip: true,
      });

      onOpenChange(false);

      // Refresh the sellers list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to add seller:', error);
      toast.error('Failed to add seller');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("Add New Seller")}
          </DialogTitle>
          <DialogDescription>
            {t("Enter the details of the new seller below.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("UserName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {t("Email Address")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("Phone Number")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="storeName">
                {t("Store Name")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeName"
                placeholder="My Store"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                {t("Address")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City, Country"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("Password")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("Confirm Password")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchId">
                {t("Branch")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.branchId.toString()}
                onValueChange={(e) => handleChange('branchId', e)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* VIP Status */}
            <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="vip">{t("VIP Seller")}</Label>
                <div className="text-sm text-slate-500">
                  {t("Enable VIP status for this seller")}
                </div>
              </div>
              <Switch
                id="vip"
                checked={formData.vip}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vip: checked }))}
                disabled={loading}
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
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                t("Add Seller")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
