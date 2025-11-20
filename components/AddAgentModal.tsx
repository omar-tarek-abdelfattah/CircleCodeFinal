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
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';
import { agentsAPI } from '../services/api';
import { parse } from 'path';

interface AddAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddAgentModal({ open, onOpenChange, onSuccess }: AddAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branshId: 0,
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter agent name');
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
      console.log('Submitting new agent:', formData);
      await agentsAPI.create(formData);
      

      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Agent added successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        branshId: 0,
        password: '',
        confirmPassword: ''
      });
      
      onOpenChange(false);
      
      // Refresh the agents list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to add agent:', error);
      toast.error('Failed to add agent');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
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
            Add New Agent
          </DialogTitle>
          <DialogDescription>
            Enter the details of the new agent below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branshId">
                Branch <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="branshId"
                placeholder="1,2,3,"
                // value={formData.branchId}
                onChange={(e) => handleChange('branshId', parseInt(e.target.value))}
                disabled={loading}
              />
            </div>

            {/* Zone */}
            {/* <div className="space-y-2">
              <Label htmlFor="zone">
                Zone <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="zone"
                placeholder="Brooklyn Zone"
                value={formData.zone}
                onChange={(e) => handleChange('zone', e.target.value)}
                disabled={loading}
              />
            </div> */}
             <div className="space-y-2">
              <Label htmlFor="passowrd">
                Password <span className="text-slate-400"></span>
              </Label>
              <Input
                id="password"
                placeholder="Abc.123!"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassowrd">
                Confirm Password <span className="text-slate-400"></span>
              </Label>
              <Input
                id="confirmPassword"
                placeholder="Abc.123!"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Agent'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
