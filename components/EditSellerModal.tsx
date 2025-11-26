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
import { toast } from 'sonner';
import { Users, Loader2, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { BranchData, SellerResponse, SellerResponseDetails, SellerUpdateRequest } from '../types';
import { branchesAPI, sellersAPI } from '@/services/api';

interface EditSellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seller: SellerResponse | null;
  onSuccess?: () => void;
}

export function EditSellerModal({ open, onOpenChange, seller, onSuccess }: EditSellerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SellerUpdateRequest>({} as SellerUpdateRequest);
  const [sellerDetails, setSellerDetails] = useState<SellerResponseDetails | null>(null);

  const [branches, setBranches] = useState<BranchData[]>([])

  // Populate form when seller changes
  useEffect(() => {

    const init = async () => {
      setLoading(true);
      try {
        const branchesResponse = await branchesAPI.getAll();
        setBranches(branchesResponse.data);
        const fetchedSellerDetails = await sellersAPI.getById(seller?.id.toString() as string);
        setSellerDetails(fetchedSellerDetails);

        if (seller) {
          setFormData({
            name: seller.name as string,
            email: fetchedSellerDetails?.email as string,
            phone: fetchedSellerDetails?.phone as string,
            storeName: fetchedSellerDetails?.storeName as string,
            address: fetchedSellerDetails?.address as string,
            branchId: branchesResponse.data.find((branch) => branch.name === fetchedSellerDetails?.branchName)?.id as number,
            id: seller.id || 0,
            vip: false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }

    }
    init();
  }, [seller]);



  const handleRefresh = async () => {
    setLoading(true);
    try {
      const apiBranches = await branchesAPI.getAll();
      setBranches(apiBranches.data);
      const fetchedSellerDetails = await sellersAPI.getById(seller?.id.toString() as string);
      setSellerDetails(fetchedSellerDetails);

      setFormData({
        name: seller?.name as string,
        email: fetchedSellerDetails?.email as string,
        phone: fetchedSellerDetails?.phone as string,
        storeName: fetchedSellerDetails?.storeName as string,
        address: fetchedSellerDetails?.address as string,
        branchId: apiBranches.data.find((branch) => branch.name === fetchedSellerDetails?.branchName)?.id as number,
        id: seller?.id || 0,
        vip: false,
      });

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seller) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter seller name');
      return;
    }
    // if (!formData.email.trim()) {
    //   toast.error('Please enter email');
    //   return;
    // }
    // if (!formData.phone.trim()) {
    //   toast.error('Please enter phone number');
    //   return;
    // }

    // Email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(formData.email)) {
    //   toast.error('Please enter a valid email address');
    //   return;
    // }

    setLoading(true);

    try {
      // TODO: Connect to backend API
      await sellersAPI.update(formData);

      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Seller updated successfully');

      onOpenChange(false);

      // Refresh the sellers list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to update seller:', error);
      toast.error('Failed to update seller');
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
            Edit Seller
          </DialogTitle>
          <DialogDescription>
            Update the seller's information below.
          </DialogDescription>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Seller ID (read-only) */}
            {seller && (
              <div className="space-y-2">
                <Label htmlFor="sellerId">Seller ID</Label>
                <Input
                  id="sellerId"
                  value={seller.id}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
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
                Email Address <span className="text-red-500">*</span>
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
                Phone Number <span className="text-red-500">*</span>
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
                Store Name <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="storeName"
                placeholder="My Store"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch">
                Branch <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.branchId?.toString() || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: parseInt(value) }))}
                disabled={loading}
              >
                <SelectTrigger id="branch">
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
                <Label htmlFor="vip">VIP Seller</Label>
                <div className="text-sm text-slate-500">
                  Enable VIP status for this seller
                </div>
              </div>
              <Switch
                id="vip"
                checked={formData.vip || false}
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Seller'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
