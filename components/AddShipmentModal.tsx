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
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Package, Loader2, Plus, Trash2 } from 'lucide-react';
import { mockSellers, mockZones } from '../lib/mockData';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { shipmentsAPI } from '@/services/api';
import { ItemsRequest } from '@/types';



interface AddShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddShipmentModal({ isOpen, onClose, onSuccess }: AddShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const { notifyOrderCreated } = useNotifications();
  const { user } = useAuth();



  // Customer Information
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    phone2: '',
    address: '',
    notes: '',
    zone: '',
    region: '',
    apartmentNumber: '',
    buildingNumber: '',
    selectedSeller: '',
    deliveryFee: 0,
  });

  // Products
  const [products, setProducts] = useState<ItemsRequest[]>([
    { id: '', name: '', quantity: 1, price: 0, description: '' },
  ]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle region change and auto-fill delivery fee
  const handleRegionChange = (regionId: string) => {
    handleChange('region', regionId);

    // Find the selected zone
    const selectedZone = mockZones.find(z => z.id === formData.zone);
    if (selectedZone) {
      // Find the selected region in the zone
      const selectedRegion: any = null
      // || selectedZone.regions.find(r => r.id === regionId);
      if (selectedRegion) {
        // Auto-fill the delivery fee with the region's price
        handleChange('deliveryFee', selectedRegion.price);
        toast.success(`Delivery fee set to $${selectedRegion.price} for ${selectedRegion.name}`);
      }
    }
  };

  const handleAddItem = () => {
    const newProduct: ItemsRequest = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
    };
    setProducts([...products, newProduct]);
  };

  const handleRemoveItem = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleProductChange = (
    id: string,
    field: keyof ItemsRequest,
    value: string | number
  ) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const calculateProductsTotal = () => {
    return products.reduce((sum, product) => {
      return sum + product.quantity * product.price;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateProductsTotal() + formData.deliveryFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter delivery address');
      return;
    }
    if (!formData.zone) {
      toast.error('Please select a zone');
      return;
    }
    if (!formData.region) {
      toast.error('Please select a region');
      return;
    }
    if (!formData.apartmentNumber.trim()) {
      toast.error('Please enter apartment number');
      return;
    }
    if (!formData.buildingNumber.trim()) {
      toast.error('Please enter building number');
      return;
    }
    if (!formData.selectedSeller) {
      toast.error('Please select a seller');
      return;
    }
    if (products.some((p) => !p.name || p.price <= 0)) {
      toast.error('Please complete all product information');
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect to backend API
      const result = await shipmentsAPI.create({
        clientName: formData.customerName,
        phone1: formData.phone,
        phone2: formData.phone2,
        apartmentNumber: formData.apartmentNumber,
        address: formData.address,
        zoneId: 1,
        regionName: 'فرع الغربية',
        bulidingNumber: formData.buildingNumber,
        notes: formData.notes,
        items: products,
        sellerId: 1
      });

      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate tracking number (in real app, this comes from backend)
      // const trackingNumber = `CCT${Date.now()}`;
      // const orderId = `order-${Date.now()}`;

      // Get seller name
      // const selectedSellerData = mockSellers.find(s => s.id === formData.selectedSeller);
      // const sellerName = selectedSellerData?.name || user?.name || 'Unknown Seller';

      // Notify admins about new order creation
      // await notifyOrderCreated(,);

      toast.success('Shipment created successfully');

      // Reset form
      setFormData({
        customerName: '',
        phone: '',
        phone2: '',
        address: '',
        notes: '',
        zone: '',
        region: '',
        apartmentNumber: '',
        buildingNumber: '',
        selectedSeller: '',
        deliveryFee: 0,
      });
      setProducts([{ id: '1', name: '', quantity: 1, price: 0 }]);

      onClose();

      // Refresh the shipments list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create shipment:', error);
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add New Shipment
          </DialogTitle>
          <DialogDescription>
            Enter the shipment details below to create a new order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Customer Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Customer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    disabled={loading}
                  />
                </div>

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
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone2">
                  Phone 2 <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
                </Label>
                <Input
                  id="phone2"
                  type="tel"
                  placeholder="Second phone number"
                  value={formData.phone2}
                  onChange={(e) => handleChange('phone2', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Delivery Address
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter full delivery address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Delivery Notes <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional delivery instructions"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={loading}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zone">
                    Zone <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.zone}
                    onValueChange={(value) => {
                      handleChange('zone', value);
                      // Reset region when zone changes
                      handleChange('region', '');
                      handleChange('deliveryFee', 0);
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">
                    Region <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={handleRegionChange}
                    disabled={loading || !formData.zone}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder={formData.zone ? "Select Region" : "Select Zone First"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.zone && mockZones.find(z => z.id === formData.zone)?.regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name} (${region.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apartmentNumber">
                    Apartment Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apartmentNumber"
                    placeholder="Apt 123"
                    value={formData.apartmentNumber}
                    onChange={(e) => handleChange('apartmentNumber', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingNumber">
                    Building Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="buildingNumber"
                    placeholder="Building 456"
                    value={formData.buildingNumber}
                    onChange={(e) => handleChange('buildingNumber', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Seller Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Seller
              </h3>

              <div className="space-y-2">
                <Label htmlFor="seller">
                  Select Seller <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.selectedSeller}
                  onValueChange={(value) => handleChange('selectedSeller', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="seller">
                    <SelectValue placeholder="Select Seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Products
              </h3>

              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                  <div className="col-span-5">Item Name <span className="text-red-500">*</span></div>
                  <div className="col-span-2">Qty <span className="text-red-500">*</span></div>
                  <div className="col-span-2">Price <span className="text-red-500">*</span></div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Product Items */}
                {products.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item name"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(product.id, 'name', e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                        disabled={loading}
                        className="text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="col-span-2 flex items-center h-9 px-3 text-sm text-slate-700 dark:text-slate-300">
                      ${(product.quantity * product.price).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {products.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(product.id)}
                          disabled={loading}
                          className="h-9 w-9 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Item Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={loading}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Products Total:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    ${calculateProductsTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Delivery Fee:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={(e) =>
                      handleChange('deliveryFee', parseFloat(e.target.value) || 0)
                    }
                    disabled={loading}
                    className="w-24 h-8 text-right"
                  />
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Grand Total:
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    ${calculateGrandTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Creating...
                </>
              ) : (
                'Add Shipment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
