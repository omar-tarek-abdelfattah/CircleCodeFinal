import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Users, TrendingUp, DollarSign, Building2, Clock, RefreshCw, Download, Plus } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import { NewShipmentsTable } from '../components/NewShipmentsTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AgiOrderSummaryToday, OrderResponse, SellerResponse, ShipmentStatusString } from '../types';
import { Activity } from '../lib/mockData';
import { sellersAPI, agentsAPI, shipmentsAPI, log, branchesAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {

  const { role } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<OrderResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [shipmentsCount, setShipmentsCount] = useState(0);
  const [logData, setLogData] = useState<Activity[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsCount, setAgentsCount] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);

  const [completedShipments, setCompletedShipments] = useState(0);
  const [inPickupCount, setInPickupCount] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);
  const [orderSummaryToday, setOrderSummaryToday] = useState<AgiOrderSummaryToday>({} as AgiOrderSummaryToday);


  const loadShipments = async () => {
    setLoading(true);
    const shipmentsData = await shipmentsAPI.getAll();
    const reversedShipmentsData = shipmentsData.reverse().slice(0, 5);
    const shipmentsCountt = shipmentsData.length;
    setShipmentsCount(shipmentsCountt);
    setShipments(reversedShipmentsData);
    setLoading(false);
  }
  useEffect(() => {
    const fetchData = async () => {
      // Fetch all data
      const [sellersData, agentsData, agentsCount, shipmentsData, logsData, branchesData, orderSummaryToday] = await Promise.all([
        sellersAPI.getAll(),
        agentsAPI.getAll(),
        agentsAPI.getActiveCount(),
        shipmentsAPI.getAll(),
        log.getAll(),
        branchesAPI.getAll(),
        shipmentsAPI.getSummaryToday(),
      ]);

      // Filter active sellers & agents
      setSellers(sellersData);
      setAgents(agentsData);
      setAgentsCount(agentsCount);
      setBranches(branchesData.data || []); // branches API returns an object with `data` array
      const reversedShipmentsData = shipmentsData.reverse().slice(0, 5);
      const shipmentsCountt = shipmentsData.length;
      setShipmentsCount(shipmentsCountt);
      setShipments(reversedShipmentsData);
      setLogData(logsData);


      // Totals

      setCompletedShipments(shipmentsData.filter((s: OrderResponse) => s.statusOrder === ShipmentStatusString.Delivered).length);
      setInPickupCount(shipmentsData.filter((s: OrderResponse) =>
        s.statusOrder === ShipmentStatusString.InPickupStage
        || s.statusOrder === ShipmentStatusString.New
        || s.statusOrder === ShipmentStatusString.InWarehouse
        || s.statusOrder === ShipmentStatusString.DeliveredToAgent
        || s.statusOrder === ShipmentStatusString.Postponed
        || s.statusOrder === ShipmentStatusString.CustomerUnreachable
      ).length);
      setTotalCollection(
        shipmentsData
          .filter((s: OrderResponse) => s.statusOrder === ShipmentStatusString.Delivered || s.statusOrder === ShipmentStatusString.RejectedWithShippingFees) // بس الشحنات اللي تم توصيلها
          .reduce((sum: number, s: OrderResponse) => sum + (s.totalPrice || 0), 0)
      );
      setOrderSummaryToday(orderSummaryToday);
    };

    fetchData();
  }, []);

  // const totalShipments = shipments.length;
  const totalSellers = sellers.length;
  const activeSellers = sellers.filter((s: SellerResponse) => s.isActive).length;

  const handleViewDetails = (shipment: OrderResponse) => {
    setSelectedShipment(shipment);
    setDetailsModalOpen(true);
  };

  const handleAddShipment = () => {
    setAddShipmentModalOpen(true);
  };

  const handleShipmentCreated = () => {
    console.log('Shipment created, refreshing list...');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl mb-2">System Overview 📊</h1>
          <p className="text-purple-100">Monitor and manage all aspects of Circle Code System.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Shipments*" value={shipmentsCount} icon={Package} gradient="from-blue-500 to-blue-600" />
        <StatCard title="Shipments Today" value={orderSummaryToday?.totalOrder?.toString() || '0'} icon={Package} gradient="from-indigo-500 to-green-600" />
        <StatCard title="Pending Shipments*" value={inPickupCount} icon={Clock} gradient="from-orange-500 to-orange-600" />
        <StatCard title="Pending Today" value={orderSummaryToday?.totalPindingOrder?.toString() || '0'} icon={Clock} gradient="from-indigo-500 to-green-600" />
        <StatCard title="Completed Shipments*" value={completedShipments} icon={TrendingUp} gradient="from-green-500 to-green-600" />
        <StatCard title="Collection Amount" value={`$${totalCollection.toFixed(0)}`} icon={DollarSign} gradient="from-purple-500 to-purple-600" />
        <StatCard title="Our Revenue Today" value={`$${sellers.reduce((sum: number, s: SellerResponse) => sum + (s.deliveryCost || 0), 0).toFixed(0)}`} icon={DollarSign} gradient="from-purple-500 to-green-600" />
        <StatCard title="Active Agents" value={agentsCount} icon={Users} gradient="from-pink-500 to-pink-600" />
        <StatCard title="Assigned Shipments" value={shipments.filter((s: OrderResponse) => (
          s.statusOrder === ShipmentStatusString.InPickupStage
          || s.statusOrder === ShipmentStatusString.DeliveredToAgent
          || s.statusOrder === ShipmentStatusString.Returned
        )).length} icon={Users} gradient="from-pink-500 to-pink-600" />
        <StatCard title="Total Sellers" value={totalSellers} icon={Users} gradient="from-indigo-500 to-indigo-600" />
        <StatCard title="Active Sellers Today" value={activeSellers} icon={Users} gradient="from-indigo-500 to-green-600" />
      </div>

      {/* Recent Activity */}
      {role === UserRole.SuperAdmin && (
        <Card className="p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <RecentActivity activities={logData} />
        </Card>
      )}

      {/* New Shipments Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex gap-2 justify-end">

          <Button
            variant="outline"
            onClick={loadShipments}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4`} />
          </Button>
        </div>
        <NewShipmentsTable
          shipments={shipments.slice(0, 5)}
          onViewDetails={handleViewDetails}
          onAddShipment={handleAddShipment}
          showAddButton={true}
          onViewAll={() => onNavigate?.('shipments')}
        />
      </motion.div>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Agents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Performing Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No agents data available</p>
              ) : (
                <div className="space-y-3">
                  {agents
                    .sort((a, b) => (b.numberofOrder || 0) - (a.numberofOrder || 0))
                    .slice(0, 5)
                    .map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                            {index + 1}
                          </div>
                          <div>
                            <p>{agent.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{agent.branshName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p>{agent.numberofOrder || 0} Orders</p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Performing Branches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branch Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {branches.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No branches data available</p>
              ) : (
                <div className="space-y-3">
                  {branches
                    .sort((a, b) => (b.ordersNumber || 0) - (a.ordersNumber || 0))
                    .slice(0, 5)
                    .map((branch, index) => (
                      <motion.div
                        key={branch.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div>
                          <p>{branch.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{branch.address}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{branch.ordersNumber || 0} Orders</Badge>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal shipment={selectedShipment} isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} />

      {/* Add Shipment Modal */}
      <AddShipmentModal isOpen={addShipmentModalOpen} onClose={() => setAddShipmentModalOpen(false)} onSuccess={handleShipmentCreated} />
    </div>
  );
}
