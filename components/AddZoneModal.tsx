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
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { Zone, ZoneRegion, BranchData } from '../types';
import { zonesAPI, branchesAPI } from '../services/api';

interface AddZoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (zone: Zone) => void;
}

export function AddZoneModal({ open, onOpenChange, onSuccess }: AddZoneModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [regions, setRegions] = useState<ZoneRegion[]>([
    { name: '', price: 0 }
  ]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (open) {
      loadBranches();
    }
  }, [open]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await branchesAPI.getAll();
      if (response && response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleAddRegion = () => {
    setRegions([...regions, { name: '', price: 0 }]);
  };

  const handleRemoveRegion = (index: number) => {
    if (regions.length > 1) {
      setRegions(regions.filter((_, i) => i !== index));
    }
  };

  const handleRegionChange = (index: number, field: 'name' | 'price', value: string | number) => {
    const newRegions = [...regions];
    if (newRegions[index]) {
      if (field === 'name') {
        newRegions[index] = { ...newRegions[index], name: value as string };
      } else {
        newRegions[index] = { ...newRegions[index], price: parseFloat(value as string) || 0 };
      }
      setRegions(newRegions);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!zoneName.trim()) {
      toast.error('Zone name is required');
      return;
    }

    const validRegions = regions.filter(r => r.name.trim());
    if (validRegions.length === 0) {
      toast.error('At least one region is required');
      return;
    }

    if (!selectedBranch) {
      toast.error('Associated branch is required');
      return;
    }

    setLoading(true);

    try {
      const response = await zonesAPI.create({
        name: zoneName,
        branchId: [parseInt(selectedBranch)],
        regions: validRegions
      });

      // Map ZoneResponseDetails to Zone format
      const newZone: Zone = {
        id: response.id,
        name: response.name,
        regions: response.regions || [],
        associatedBranches: [selectedBranch],
        orders: 0,
        status: response.isActive ? 'active' : 'inactive',
      };

      onSuccess(newZone);
      toast.success('Zone created successfully');
      onOpenChange(false);

      // Reset form
      setZoneName('');
      setRegions([{ name: '', price: 0 }]);
      setSelectedBranch('');
    } catch (error) {
      console.error('Failed to create zone:', error);
      toast.error('Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("Add New Zone")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {/* Zone Name */}
              <div className="space-y-2">
                <Label htmlFor="zoneName">
                  {t("Zone Name")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zoneName"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Enter zone name"
                />
              </div>

              {/* Regions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    {t("regions")} <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddRegion}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("Add Region")}
                  </Button>
                </div>

                <div className="space-y-2">
                  {regions.map((region, index) => (
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          value={region.name}
                          onChange={(e) => handleRegionChange(index, 'name', e.target.value)}
                          placeholder="Region name"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={region.price || ''}
                          onChange={(e) => handleRegionChange(index, 'price', e.target.value)}
                          placeholder="Price"
                        />
                      </div>
                      {regions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRegion(index)}
                          className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch">
                  {t("Associated Branch")} <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={loadingBranches}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select a branch"} />
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
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Create Zone")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
