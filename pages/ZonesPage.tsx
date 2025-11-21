import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zone } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { AddZoneModal } from '../components/AddZoneModal';
import { EditZoneModal } from '../components/EditZoneModal';
import {
  MapPin,
  Maximize,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Package,
  Navigation,
  Map as MapIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { zonesAPI } from '@/services/api';

export function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [branches] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hiddenZoneIds, setHiddenZoneIds] = useState<Set<string>>(new Set());
  const [hiddenZonesDialogOpen, setHiddenZonesDialogOpen] = useState(false);
  const [mapCentered, setMapCentered] = useState(true);

  // Fetch zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await zonesAPI.getAll();
        // Map ZoneResponse to Zone format
        const mappedZones: Zone[] = response.map((zone) => ({
          id: zone.id,
          name: zone.name,
          regions: [], // ZoneResponse doesn't include regions, will be empty initially
          associatedBranches: [], // ZoneResponse doesn't include branches, will be empty initially
          orders: zone.noOrders,
          status: zone.isActive ? 'active' : 'inactive',
        }));
        setZones(mappedZones);
      } catch (error) {
        console.error('Failed to fetch zones:', error);
        toast.error('Failed to load zones');
      }
    };

    fetchZones();
  }, []);

  // Helper function to get branch name
  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
  };



  // Calculate statistics
  const totalZones = zones.filter(z => !hiddenZoneIds.has(z.id)).length;
  const totalRegions = zones
    .filter(z => !hiddenZoneIds.has(z.id))
    .reduce((sum, zone) => sum + (zone.regions?.length || 0), 0);
  const totalOrders = zones
    .filter(z => !hiddenZoneIds.has(z.id))
    .reduce((sum, zone) => sum + zone.orders, 0);

  // Get visible and hidden zones
  const visibleZones = useMemo(() => {
    return zones.filter(zone => !hiddenZoneIds.has(zone.id));
  }, [zones, hiddenZoneIds]);

  const hiddenZones = useMemo(() => {
    return zones.filter(zone => hiddenZoneIds.has(zone.id));
  }, [zones, hiddenZoneIds]);

  const handleToggleStatus = async (zoneId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      // TODO: Connect to backend API
      // await zonesAPI.updateStatus(zoneId, newStatus);

      setZones(prev =>
        prev.map(z =>
          z.id === zoneId ? { ...z, status: newStatus } : z
        )
      );

      toast.success(`Zone ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update zone status');
    }
  };

  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setIsEditModalOpen(true);
  };

  const handleHideZone = (zoneId: string) => {
    setHiddenZoneIds(prev => {
      const newSet = new Set(prev);
      newSet.add(zoneId);
      return newSet;
    });
    toast.success('Zone hidden successfully');
  };

  const handleRestoreZone = (zoneId: string) => {
    setHiddenZoneIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(zoneId);
      return newSet;
    });
    toast.success('Zone restored successfully');
  };

  const handleRestoreAllZones = () => {
    setHiddenZoneIds(new Set());
    setHiddenZonesDialogOpen(false);
    toast.success('All zones restored successfully');
  };

  const handleAddSuccess = (newZone: Zone) => {
    setZones(prev => [newZone, ...prev]);
  };

  const handleEditSuccess = (updatedZone: Zone) => {
    setZones(prev =>
      prev.map(zone =>
        zone.id === updatedZone.id ? updatedZone : zone
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Zones</p>
                  <h3 className="text-3xl mt-2">{totalZones}</h3>
                  <p className="text-sm text-slate-500 mt-1">Coverage areas</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Regions</p>
                  <h3 className="text-3xl mt-2">{totalRegions}</h3>
                  <p className="text-sm text-slate-500 mt-1">Across all zones</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                  <h3 className="text-3xl mt-2">{totalOrders}</h3>
                  <p className="text-sm text-slate-500 mt-1">In all zones</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-600 dark:bg-slate-700 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Zone Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Delivery Zone Map</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMapCentered(!mapCentered)}
                    className="gap-2"
                  >
                    <MapIcon className="w-4 h-4" />
                    Center
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Maximize className="w-4 h-4" />
                    Fullscreen
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Zone
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Interactive Delivery Zone Map */}
              <div className="relative w-full h-[500px] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Map Background */}
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1542382257-80dedb725088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwYWVyaWFsfGVufDF8fHx8MTc2MjAwMzYwMnww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Delivery Zone Map"
                    className="w-full h-full object-cover opacity-30 dark:opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-50/50 dark:from-slate-900/80 dark:to-slate-800/80" />
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-slate-800"
                    title="Center Map"
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-slate-800"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>

                {/* Map Legend */}
                <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-medium mb-2 text-slate-700 dark:text-slate-300">Delivery Zones</h4>
                  <div className="space-y-1.5">
                    {visibleZones.map((zone) => (
                      <div key={zone.id} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-800"

                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {zone.name}
                        </span>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Zone Boundaries and Markers */}
                {visibleZones.map((zone, index) => {
                  const positions = [
                    { left: '20%', top: '25%' },
                    { left: '50%', top: '35%' },
                    { left: '75%', top: '50%' },
                  ];
                  const pos = positions[index % positions.length];

                  return (
                    <div key={zone.id}>
                      {/* Zone Boundary Polygon */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 1 }}
                      >
                        <defs>
                          <filter id={`glow-${zone.id}`}>
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <polygon
                          points={
                            index === 0
                              ? "10,15 35,10 40,35 15,40"
                              : index === 1
                                ? "42,20 65,25 60,50 38,45"
                                : "68,35 90,40 85,65 70,60"
                          }

                          fillOpacity="0.15"

                          strokeWidth="2"
                          strokeDasharray="5,5"
                          filter={`url(#glow-${zone.id})`}
                          className="transition-all duration-300"
                        />
                      </svg>

                      {/* Zone Marker with Info */}
                      <motion.div
                        className="absolute z-20 cursor-pointer"
                        style={{
                          left: pos?.left,
                          top: pos?.top,
                          transform: 'translate(-50%, -50%)',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Main Zone Circle */}
                        <div
                          className="relative rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
                          style={{}}
                        >
                          {/* Pulsing Ring */}
                          {zone.status === 'active' && (
                            <div
                              className="absolute inset-0 rounded-full animate-ping opacity-20"
                              style={{}}
                            />
                          )}

                          {/* Content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Package className="w-3 h-3" />

                            </div>
                            <div className="text-[10px] opacity-90">orders</div>
                          </div>

                          {/* Agents Indicator */}

                        </div>

                        {/* Zone Label */}
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {zone.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {zone.regions?.length || 0} regions
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Agent Markers within Zone */}

                    </div>
                  );
                })}

                {/* Empty State */}
                {visibleZones.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg">
                      <MapIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-300 mb-2">No zones to display</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Add delivery zones to see them on the map
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zone List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-slate-200 dark:border-slate-800 h-[calc(100vh-20rem)] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Zone List</CardTitle>
                {hiddenZones.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHiddenZonesDialogOpen(true)}
                    className="gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hidden ({hiddenZones.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visibleZones.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No zones found</p>
                  </div>
                ) : (
                  visibleZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Color Indicator */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                        // style={{ backgroundColor: zone.color }}
                        />

                        {/* Zone Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">{zone.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <span>{zone.regions?.length || 0} regions</span>
                            <span>•</span>
                            <span>{zone.orders} orders</span>
                            <span>•</span>
                            <Badge
                              variant={zone.status === 'active' ? 'default' : 'secondary'}
                              className={
                                zone.status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }
                            >
                              {zone.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {zone.associatedBranches.length > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              Branch: {getBranchName(zone.associatedBranches[0] as string)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {zone.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(zone.id, zone.status)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(zone.id, zone.status)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(zone)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Edit Zone"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleHideZone(zone.id)}
                            className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            title="Hide Zone"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Zone Modal */}
      <AddZoneModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Zone Modal */}
      <EditZoneModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        zone={selectedZone}
        onSuccess={handleEditSuccess}
      />

      {/* Hidden Zones Dialog */}
      <Dialog open={hiddenZonesDialogOpen} onOpenChange={setHiddenZonesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5" />
              Hidden Zones ({hiddenZones.length})
            </DialogTitle>
            <DialogDescription>
              Manage zones that have been hidden from the main list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hiddenZones.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No hidden zones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hiddenZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                      // style={{ backgroundColor: `${zone.color}20` }}
                      >
                        {/* <MapPin className="w-5 h-5" style={{ color: zone.color }} /> */}
                      </div>
                      <div>
                        <p className="font-medium">{zone.name}</p>
                        <p className="text-sm text-slate-500">
                          {zone.regions?.length || 0} regions · {zone.orders} orders · Branch: {getBranchName(zone.associatedBranches[0] as string)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreZone(zone.id)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHiddenZonesDialogOpen(false)}>
              Close
            </Button>
            {hiddenZones.length > 0 && (
              <Button
                onClick={handleRestoreAllZones}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Restore All
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}
