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
import { Users, Loader2 } from 'lucide-react';
import { Seller } from '../types';

interface EditSellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seller: Seller | null;
  onSuccess?: () => void;
}

export function EditSellerModal({ open, onOpenChange, seller, onSuccess }: EditSellerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
  });

  // Populate form when seller changes
  useEffect(() => {
    if (seller) {
      setFormData({
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        storeName: seller.storeName || '',
      });
    }
  }, [seller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seller) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter seller name');
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
      // TODO: Connect to backend API
      // await sellersAPI.update(seller.id, formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

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
