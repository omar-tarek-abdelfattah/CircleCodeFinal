import { useState, useEffect } from 'react';
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
import { AdminUpdateRequest, User } from '../types';
import { toast } from 'react-toastify';
import { usersAPI } from '../services/api';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdate: (updatedUser: User) => void;
}

export function EditUserModal({ open, onOpenChange, user, onUpdate }: EditUserModalProps) {
  const [formData, setFormData] = useState<AdminUpdateRequest>({} as AdminUpdateRequest);

  useEffect(() => {
    if (user) {
      setFormData({
        id: 0,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        salary: user.salary || 0,
      });
    }
  }, [user]);

  const validateForm = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill all required fields!');
      return false;
    }
    return true;
  };

  const handleClose = () => {
    setFormData({
      id: 0,
      name: '',
      email: '',
      phone: '',
      salary: 0,
    });
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    const updatedData = {
      ...user,
      ...formData,
    };

    try {
      const updatedUser = await usersAPI.update(user.id, updatedData);
      onUpdate(updatedUser);
      toast.success('User updated successfully');
      handleClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>


            <div className="grid gap-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
