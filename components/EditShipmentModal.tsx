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
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { Edit, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Agent, AgentResponse, OrderResponse, OrderResponseDetails, OrderUpdate, Seller, SellerResponse, ShipmentStatus, ShipmentStatusString, StatusOrderDto, ZoneRegion, ZoneResponse, ZonesForSellerResponse } from '../types';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { agentsAPI, sellersAPI, shipmentsAPI, zonesAPI } from '@/services/api';
import { getAvailableStatuses, getStatusLabel } from '@/lib/statusUtils';

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  description?: string
}

// const statusKeys = Object.keys(ShipmentStatus) as Array<keyof typeof ShipmentStatus>;


interface EditShipmentModalProps {
  shipment: OrderResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userRole?: UserRole;
}

export function EditShipmentModal({
  shipment,
  isOpen,
  onClose,
  onSuccess,
  userRole,
}: EditShipmentModalProps) {
  const [loading, setLoading] = useState(false);

  const { role } = useAuth();

  const [shipmentDetails, setShipmentDetails] = useState<Partial<OrderResponseDetails>>({} as OrderResponseDetails)
  const [agents, setAgents] = useState<AgentResponse[]>([])
  const [sellers, setSellers] = useState<SellerResponse[]>([])
  const [sellerZones, setSellerZones] = useState<ZonesForSellerResponse[]>([])

  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [regions, setRegions] = useState<ZoneRegion[]>([])
  // Check if seller is trying to edit a processed order
  const canEdit = !userRole || userRole !== UserRole.Seller || shipment?.statusOrder === ShipmentStatusString.New;

  // Form Data
  const [formData, setFormData] = useState<OrderUpdate>({
    id: '',
    clientName: '',
    phone1: '',
    phone2: '',
    apartmentNumber: 0,
    zoneId: 0,
    address: '',
    notes: '',
    regionName: '',
    bulidingNumber: 0,
    sellerId: 0,
    agentId: 0,
    statusOrder: 1,
    items: [],
    cancellednotes: '',
  });

  // Products
  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', name: '', quantity: 1, price: 0, description: '' },
  ]);

  const availableStatuses = userRole ? getAvailableStatuses(userRole) : [];

  const populateModalDetails = async () => {
    setLoading(true)
    try {
      if (shipment?.id) {
        const response = await shipmentsAPI.getById(shipment.id)
        setShipmentDetails(response)
        return response
      }
      else {
        toast.error('Shipment not found')
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
    return null
  }

  const populateAgents = async (details?: Partial<OrderResponseDetails>) => {
    setLoading(true)
    try {
      const response = await agentsAPI.getAll()
      setAgents(response)
      const targetName = details?.agentName || shipmentDetails.agentName
      const defaultAgent = response.find((agent) => agent.name === targetName)
      if (defaultAgent) {
        setFormData((prev) => ({
          ...prev,
          agentId: parseInt(defaultAgent.id.toString()),
        }))
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

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



  const populateSellers = async (details?: Partial<OrderResponseDetails>) => {
    setLoading(true)
    try {
      const response = await sellersAPI.getAll()
      // console.log("sellers", response);

      setSellers(response)
      const targetName = details?.sellerName || shipmentDetails.sellerName
      const defaultSeller = response.find((seller) => seller.name === targetName)
      console.log("defaultSeller", defaultSeller);
      if (defaultSeller) {
        setFormData((prev) => ({
          ...prev,
          sellerId: defaultSeller.id,
        }))
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  const populateZones = async () => {
    setLoading(true)
    try {
      const response = await zonesAPI.getAll()
      setZones(response)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  const populateRegions = async (zoneId: number) => {
    setLoading(true)
    try {
      const response = await zonesAPI.getById(zoneId)
      setRegions(response.regions)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  // Populate form when shipment changes
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      if (shipment && isOpen) {
        if (role === UserRole.Seller) {
          await populateZonesForSeller()
        }
        const details = await populateModalDetails()
        console.log(details);

        if (details) {
          setFormData({
            id: details.id as string || 'UNKNOWN',
            sellerId: 0,
            zoneId: 0,
            agentId: 0,
            clientName: details.clientName || '',
            phone2: details.phone2 || '',
            address: details.address || '',
            notes: details.notes || '',
            regionName: '',
            phone1: details.phone1 || '',
            apartmentNumber: details.apartmentNumber || 0,
            bulidingNumber: details.bulidingNumber || 0,
            statusOrder: parseInt(ShipmentStatus[details.statusOrder as keyof typeof ShipmentStatus]) as StatusOrderDto,
            items: details.items || [],
            cancellednotes: details.notes || '',
          });

          // Set product from shipment price
          setProducts(details.items?.map((item) => {
            return { id: item.id, name: item.name, price: item.price, quantity: item.quantity, description: item.description || '' }
          }) as ProductItem[]);

          populateZones()
          populateSellers(details)
          populateAgents(details)
        }
      }
      setLoading(false)
    }
    init()
  }, [isOpen, shipment?.id, shipment]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddItem = () => {
    const newProduct: ProductItem = {
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
    field: keyof ProductItem,
    value: string | number
  ) => {
    setProducts(
      products?.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRefresh = () => {
    populateModalDetails()
    populateZones()
    populateSellers()
    populateAgents()
    setFormData({
      id: shipmentDetails.id as string || 'UNKNOWN',
      sellerId: 0,
      zoneId: 0,
      clientName: shipmentDetails.clientName || '',
      agentId: 0,
      phone2: shipmentDetails.phone2 || '',
      address: shipmentDetails.address || '',
      notes: shipmentDetails.notes || '',
      regionName: '',
      phone1: shipmentDetails.phone1 || '',
      apartmentNumber: shipmentDetails.apartmentNumber || 0,
      bulidingNumber: shipmentDetails.bulidingNumber || 0,
      statusOrder: parseInt(ShipmentStatus[shipmentDetails.statusOrder as keyof typeof ShipmentStatus]) as StatusOrderDto,
      items: shipmentDetails.items || [],
      cancellednotes: shipmentDetails.notes || '',
    });
    setProducts(shipmentDetails.items?.map((item) => {
      return { id: item.id, name: item.name, price: item.price, quantity: item.quantity, description: item.description || '' }
    }) as ProductItem[]);
  }

  const calculateProductsTotal = () => {
    return products?.reduce((sum, product) => {
      return sum + product.quantity * product.price;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateProductsTotal()
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipment) return;

    // Check if seller can edit
    if (userRole === UserRole.Seller && shipment.statusOrder !== 'New') {
      toast.error('You cannot edit orders that have been processed by admin or agent');
      onClose();
      return;
    }

    // Validation
    if (userRole !== UserRole.agent) {
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
      if (!formData.regionName.trim()) {
        toast.error('Please select a region');
        return;
      }
      if (!formData.apartmentNumber) {
        toast.error('Please enter apartment number');
        return;
      }
      if (!formData.bulidingNumber) {
        toast.error('Please enter building number');
        return;
      }
      if (products.some((p) => !p.name || p.price <= 0)) {
        toast.error('Please complete all product information');
        return;
      }
    }

    if (userRole === UserRole.Admin || userRole === UserRole.SuperAdmin) {
      if (!formData.agentId) {
        toast.error('Please select an agent');
        return;
      }
    }
    if (products.some((p) => !p.name || p.price <= 0)) {
      toast.error('Please complete all product information');
      return;
    }

    setLoading(true);

    try {
      // console.log(formData);

      if (role === UserRole.Seller) {
        await shipmentsAPI.updateForSeller(shipment.id, {
          address: formData.address,
          agentId: formData.agentId,
          apartmentNumber: formData.apartmentNumber,
          bulidingNumber: formData.bulidingNumber,
          clientName: formData.clientName,
          cancelledNotes: formData.notes,
          phone1: formData.phone1 as string,
          phone2: formData.phone2 as string,
          regionName: formData.regionName,
          statusOrder: formData.statusOrder as unknown as ShipmentStatus,
          zoneId: formData.zoneId,
          items: products,
          id: shipment.id,

        });
        toast.success('Shipment updated successfully');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        return;
      }
      if (role === UserRole.agent) {
        await shipmentsAPI.updateForAgent(shipment.id, {
          id: shipment.id,
          statusOrder: formData.statusOrder as unknown as ShipmentStatus,
          cancelledNotes: formData.cancellednotes,
        });
        toast.success('Shipment updated successfully');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      await shipmentsAPI.update(shipment.id, {
        ...formData,
        id: shipment.id,
        items: products,
        statusOrder: parseInt(formData.statusOrder as unknown as string) as StatusOrderDto,
        zoneId: parseInt(formData.zoneId as unknown as string),
        agentId: parseInt(formData.agentId as unknown as string),
        sellerId: parseInt(formData.sellerId as unknown as string),
      });

      toast.success('Shipment updated successfully');
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to update shipment:', error);
      toast.error('Failed to update shipment');
    } finally {
      setLoading(false);
    }

  };

  if (!shipment) return null;

  const isAgent = userRole === UserRole.agent;
  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.SuperAdmin;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Shipment - {shipment.id}
          </DialogTitle>
          <DialogDescription>
            {!canEdit ? (
              <span className="text-red-500">
                You cannot edit orders that have been processed by admin or agent.
              </span>
            ) : (
              'Update the shipment details below.'
            )}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Customer Information Section - Hidden for Agents */}
            {!isAgent && (
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
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      disabled={loading || !canEdit}
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
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={loading || !canEdit}
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
                    disabled={loading || !canEdit}
                  />
                </div>
              </div>
            )}

            {/* Delivery Address Section - Hidden for Agents */}
            {!isAgent && (
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
                    disabled={loading || !canEdit}
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
                    disabled={loading || !canEdit}
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
                      value={formData.zoneId?.toString()}
                      onValueChange={(value) => {
                        if (role === UserRole.Seller) {
                          const selectedZone = sellerZones.find(z => z.id.toString() === value);
                          if (selectedZone) {
                            // Map RegionDetails to ZoneRegion
                            const regions: ZoneRegion[] = selectedZone.regions.map(r => ({
                              name: r.name,
                              price: r.price
                            }));
                            setRegions(regions);
                          }
                        } else {
                          populateRegions(parseInt(value))
                        }
                        handleChange('zoneId', value);
                        handleChange('regionName', '');
                      }}
                      disabled={loading || !canEdit}
                    >
                      <SelectTrigger id="zone">
                        <SelectValue placeholder="Select Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id.toString()}>
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
                      onValueChange={(value) => handleChange('regionName', value)}
                      disabled={loading || !canEdit}
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem onSelect={() => handleChange('regionName', region.name)} key={region.name} value={region.name}>
                            {region.name}
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
                      disabled={loading || !canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildingNumber">
                      Building Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="buildingNumber"
                      placeholder="Building 456"
                      value={formData.bulidingNumber.toString()}
                      onChange={(e) => handleChange('buildingNumber', e.target.value)}
                      disabled={loading || !canEdit}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Seller Section - Only for Admin */}
            {isAdmin && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Seller
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="sellerId">
                    Select Seller <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.sellerId?.toString()}
                    onValueChange={(value) => handleChange('sellerId', value)}
                    disabled={loading || !canEdit}
                  >
                    <SelectTrigger id="sellerId">
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

            {/* Agent & status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agent Assignment - Only for Admin */}
              {isAdmin && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Assign Agent
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="agent">
                      Select Agent <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.agentId?.toString()}
                      onValueChange={(value) => handleChange('agentId', value)}
                      disabled={loading || !canEdit}
                    >
                      <SelectTrigger id="agent">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}


              {/* Status Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Status
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Select Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.statusOrder?.toString()}
                    onValueChange={(value) => handleChange('statusOrder', value)}
                    disabled={loading || !canEdit}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={ShipmentStatus[status]}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cancelled Notes - Visible for Agent and Admin */}
            {(isAgent || isAdmin) && (
              <div className="space-y-2">
                <Label htmlFor="cancellednotes">
                  Cancelled Notes <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
                </Label>
                <Textarea
                  id="cancellednotes"
                  placeholder="Reason for cancellation or rejection"
                  value={formData.cancellednotes as string}
                  onChange={(e) => handleChange('cancellednotes', e.target.value)}
                  disabled={loading || !canEdit}
                  rows={2}
                  className="resize-none"
                />
              </div>
            )}

            {/* Products Section - Hidden for Agents */}
            {!isAgent && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Products
                </h3>

                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                    <div className="col-span-5">
                      Item Name (up) & Description(low) <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-2">
                      Qty <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-2">
                      Price <span className="text-red-500">*</span>
                    </div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Product Items */}
                  {products?.map((product) => (
                    <div key={product.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <Input
                          placeholder="Item name"
                          value={product.name}
                          onChange={(e) =>
                            handleProductChange(product.id, 'name', e.target.value)
                          }
                          disabled={loading || !canEdit}
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
                              product.id,
                              'quantity',
                              parseInt(e.target.value) || 1
                            )
                          }
                          disabled={loading || !canEdit}
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
                          disabled={loading || !canEdit}
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
                            disabled={loading || !canEdit}
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
                    disabled={loading || !canEdit}
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
                      ${calculateProductsTotal()?.toFixed(2)}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Delivery Fee:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={10}
                    onChange={(e) =>
                      handleChange('deliveryFee', parseFloat(e.target.value) || 0)
                    }
                    disabled={loading || !canEdit}
                    className="w-24 h-8 text-right"
                  />
                </div> */}
                  <div className="flex justify-between text-base pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Grand Total:
                    </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      ${calculateGrandTotal()?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {canEdit ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
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
                  'Update Shipment'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

}

