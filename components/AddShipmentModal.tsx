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
import type { ItemsRequest, OrderRequest, Seller, SellerResponse, ZoneRegion, ZoneResponse, ZonesForSellerResponse } from '@/types';
import { sellersAPI, shipmentsAPI, zonesAPI } from '@/services/api';
import { useAuth, UserRole } from '@/contexts/AuthContext';



interface AddShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddShipmentModal({ isOpen, onClose, onSuccess }: AddShipmentModalProps) {
  const [loading, setLoading] = useState(false);


  const { role } = useAuth()


  // Customer Information
  const [formData, setFormData] = useState<OrderRequest>({
    clientName: '',
    phone1: '',
    phone2: '',
    address: '',
    notes: '',
    zoneId: 0,
    regionName: '',
    apartmentNumber: '',
    bulidingNumber: '',
    sellerId: 0,
    items: []
  });

  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [sellerZones, setSellerZones] = useState<ZonesForSellerResponse[]>([])
  const [selectedRegions, setSelectedRegions] = useState<ZoneRegion[]>([])
  const [sellers, setSellers] = useState<SellerResponse[]>([])


  const populateZonesForSeller = async () => {
    setLoading(true)
    try {
      const result = await shipmentsAPI.getAllZonesForSeller()
      setSellerZones(result);
      setZones(result.map(z => ({ id: z.id, name: z.name, noOrders: 0, isActive: true })));
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
    finally {
      setLoading(false)
    }
  }

  const populateZonesRequest = async () => {
    try {
      const result = await zonesAPI.getAll()
      setZones(result);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
    finally {
      setLoading(false)
    }
  }

  const populateRegionRequest = async (id: number) => {
    setLoading(true)
    try {
      const result = await zonesAPI.getById(id)

      result.regions.map(region => {
        setSelectedRegions(() => [region])
      })
    } catch (error) {
      console.error(error)
    }
    finally {
      setLoading(false)
    }
  }

  const populateSellersRequest = async () => {
    setLoading(true)
    try {
      const result = await sellersAPI.getAll()

      setSellers(result)
    } catch (error) {
      console.error(error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      populateZonesRequest()
      populateSellersRequest()
      if (role === UserRole.Seller) {
        populateZonesForSeller()
      }
    }
  }, [isOpen])


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
    handleChange('regionName', regionId);

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
    name: string,
    field: keyof ItemsRequest,
    value: string | number
  ) => {
    setProducts(
      products.map((p) => (p.name === name ? { ...p, [field]: value } : p))
    );

    setFormData((prev) => ({
      ...prev,
      items: products,
    }));
  };

  const calculateProductsTotal = () => {
    return products.reduce((sum, product) => {
      return sum + product.quantity * product.price;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateProductsTotal()
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clientName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!formData.phone1.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter delivery address');
      return;
    }
    if (!formData.zoneId) {
      toast.error('Please select a zone');
      return;
    }
    if (!formData.regionName) {
      toast.error('Please select a region');
      return;
    }
    if (!formData.apartmentNumber.trim()) {
      toast.error('Please enter apartment number');
      return;
    }
    if (!formData.bulidingNumber.trim()) {
      toast.error('Please enter building number');
      return;
    }
    if (!formData.sellerId && role !== UserRole.Seller) {
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
      if (role === UserRole.Seller) {
        await shipmentsAPI.createForSeller({
          clientName: formData.clientName,
          phone1: formData.phone1,
          phone2: formData.phone2,
          apartmentNumber: Number(formData.apartmentNumber),
          address: formData.address,
          zoneId: formData.zoneId,
          regionName: formData.regionName,
          bulidingNumber: Number(formData.bulidingNumber),
          notes: formData.notes,
          items: formData.items,
        })
        toast.success('Shipment created successfully');

        setFormData({
          address: '',
          clientName: '',
          phone1: '',
          phone2: '',
          apartmentNumber: '',
          bulidingNumber: '',
          zoneId: 0,
          regionName: '',
          notes: '',
          items: [],
          sellerId: 0,
        });

        setProducts([{ id: '1', name: '', quantity: 1, price: 0 }]);

        if (onSuccess) {
          onSuccess();
        }

        return
      }
      await shipmentsAPI.create(formData)

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
        clientName: '',
        phone1: '',
        phone2: '',
        address: '',
        notes: '',
        zoneId: 0,
        regionName: '',
        apartmentNumber: '',
        bulidingNumber: '',
        sellerId: 0,
        items: []
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
          <div className="space-y-4 py-4">
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
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
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
                    value={formData.phone1}
                    onChange={(e) => handleChange('phone1', e.target.value)}
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
                  value={formData.phone2 as string}
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
                  value={formData.notes as string}
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
                    value={formData.zoneId.toString()}
                    onValueChange={(value) => {
                      if (role === UserRole.Seller) {
                        const selectedZone = sellerZones.find(z => z.id.toString() === value);
                        if (selectedZone) {
                          // Map RegionDetails to ZoneRegion
                          const regions: ZoneRegion[] = selectedZone.regions.map(r => ({
                            name: r.name,
                            price: r.price
                          }));
                          setSelectedRegions(regions);
                        }
                      } else {
                        populateRegionRequest(parseInt(value))
                      }
                      handleChange('zoneId', parseInt(value));
                      handleChange('regionName', '');
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem onSelect={() => { }} key={zone.id} value={zone.id.toString()}>
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
                    value={formData.regionName}
                    onValueChange={handleRegionChange}
                    disabled={loading || !formData.zoneId}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder={formData.zoneId ? "Select Region" : "Select Zone First"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedRegions.map((region) => {
                        return (
                          <SelectItem onSelect={() => { }} key={region.name} value={region.name.toString()}>
                            {region.name}
                          </SelectItem>
                        )
                      })}

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
                    value={formData.bulidingNumber}
                    onChange={(e) => handleChange('bulidingNumber', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Seller Section */}
            {role === UserRole.Admin || role === UserRole.SuperAdmin && (
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
                    value={formData.sellerId.toString()}
                    onValueChange={(value) => handleChange('sellerId', parseInt(value))}
                    disabled={loading}
                  >
                    <SelectTrigger id="seller">
                      <SelectValue placeholder="Select Seller" />
                    </SelectTrigger>
                    <SelectContent>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id.toString()}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Products
              </h3>

              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                  <div className="col-span-5">Item Name (up) & Description (down) <span className="text-red-500">*</span></div>
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
                        className='py-2'
                        placeholder="Item name"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(product.name, 'name', e.target.value)
                        }
                        disabled={loading}
                      />
                      {role === UserRole.Seller ? (
                        <Input
                          className='py-2'
                          placeholder="Item Description"
                          value={product.description}
                          onChange={(e) =>
                            handleProductChange(product.name, 'description', e.target.value)
                          }
                          disabled={loading}
                        />
                      ) : null}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            product.name,
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
                            product.name,
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
