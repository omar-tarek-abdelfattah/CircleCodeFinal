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
import { AgentResponse, AgentUpdateRequest, BranchData } from '../types';
import { agentsAPI, branchesAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentResponse | null;
  onSuccess?: () => void;
}

export function EditAgentModal({ open, onOpenChange, agent, onSuccess }: EditAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgentUpdateRequest>({} as AgentUpdateRequest);
  const [branches, setBranches] = useState<BranchData[]>([]);

  // Populate form when agent changes

  const populateBranches = async () => {
    try {
      const response = await branchesAPI.getAll();
      setBranches(response.data as BranchData[]);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to fetch branches');
    }
  };
  useEffect(() => {
    populateBranches();
    if (agent) {
      setFormData({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phoneNumber,
        branchId: branches.find((branch) => branch.name === agent.branshName)?.id as number,

      });
    }
  }, [agent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agent) return;

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
    if (!formData.branchId) {
      toast.error('Please select a branch');
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
      await agentsAPI.update(agent.id.toString(), formData);

      // Simulate API call


      onOpenChange(false);

      // Refresh the agents list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent');
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
            Edit Agent
          </DialogTitle>
          <DialogDescription>
            Update the agent's information below.
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
              <Label htmlFor="branch">
                Branch <span className="text-slate-400">(Optional)</span>
              </Label>
              <Select
                value={branches.find((branch) => branch.id === formData.branchId)?.id.toString()}
                onValueChange={(value) => handleChange('branchId', value)}
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
                  Updating...
                </>
              ) : (
                'Update Agent'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
