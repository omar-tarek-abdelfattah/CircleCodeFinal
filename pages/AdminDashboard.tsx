import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Users, TrendingUp, DollarSign, Building2, Clock, RefreshCw } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import { NewShipmentsTable } from '../components/NewShipmentsTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { OrderResponse, ShipmentStatusString } from '../types';
import { Activity } from '../lib/mockData';
import { sellersAPI, agentsAPI, shipmentsAPI, log, branchesAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Checkbox } from '../components/ui/checkbox';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {

  const { role } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<OrderResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);

  // Data States
  const [shipments, setShipments] = useState<any[]>([]);
  const [shipmentsCount, setShipmentsCount] = useState(0);
  const [todayOrders, setTodayOrders] = useState<OrderResponse[]>([]);
  const [logData, setLogData] = useState<Activity[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsCount, setAgentsCount] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);

  // Stats States
  const [completedShipments, setCompletedShipments] = useState(0);
  const [inPickupCount, setInPickupCount] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);

  // View State
  const [isToday, setIsToday] = useState(false);

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
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data
      const [sellersData, agentsData, agentsCount, shipmentsData, logsData, branchesData, todayOrdersData] = await Promise.all([
        sellersAPI.getAll(),
        agentsAPI.getAll(),
        agentsAPI.getActiveCount(),
        shipmentsAPI.getAll(),
        log.getAll(),
        branchesAPI.getAll(),
        shipmentsAPI.getAllbyDate(today, today),
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
      setTodayOrders(todayOrdersData);

      // Totals Calculations
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
          .filter((s: OrderResponse) => s.statusOrder === ShipmentStatusString.Delivered || s.statusOrder === ShipmentStatusString.RejectedWithShippingFees)
          .reduce((sum: number, s: OrderResponse) => sum + (s.deliveryCost || 0), 0)
      );
    };

    fetchData();
  }, []);

  const totalSellers = sellers.length;

  // Calculate Today's Stats
  const todayStats = {
    shipments: todayOrders.length,
    pending: todayOrders.filter((s: OrderResponse) =>
      s.statusOrder === ShipmentStatusString.InPickupStage
      || s.statusOrder === ShipmentStatusString.New
      || s.statusOrder === ShipmentStatusString.InWarehouse
      || s.statusOrder === ShipmentStatusString.DeliveredToAgent
      || s.statusOrder === ShipmentStatusString.Postponed
      || s.statusOrder === ShipmentStatusString.CustomerUnreachable
    ).length,
    completed: todayOrders.filter((s: OrderResponse) => s.statusOrder === ShipmentStatusString.Delivered).length,
    collection: todayOrders
      .filter((s: OrderResponse) => s.statusOrder === ShipmentStatusString.Delivered || s.statusOrder === ShipmentStatusString.RejectedWithShippingFees)
      .reduce((sum: number, s: OrderResponse) => sum + (s.deliveryCost || 0), 0),
    activeAgents: new Set(todayOrders.map(o => o.agentName).filter(Boolean)).size,
    activeSellers: new Set(todayOrders.map(o => o.sellerName).filter(Boolean)).size
  };

  const currentStats = isToday ? {
    shipments: todayStats.shipments,
    pending: todayStats.pending,
    completed: todayStats.completed,
    collection: todayStats.collection,
    activeAgents: todayStats.activeAgents,
    sellers: todayStats.activeSellers,
    labels: {
      shipments: t("Today's Shipments"),
      pending: t("Pending Today"),
      completed: t("Completed Today"),
      collection: t("Collection Today"),
      agents: t("Agents Active Today"),
      sellers: t("Sellers Active Today")
    }
  } : {
    shipments: shipmentsCount,
    pending: inPickupCount,
    completed: completedShipments,
    collection: totalCollection,
    activeAgents: agentsCount,
    sellers: totalSellers,
    labels: {
      shipments: t("Total Shipments"),
      pending: t("Total Pending"),
      completed: t("Total Completed"),
      collection: t("Collection Amount"),
      agents: t("Active Agents"),
      sellers: t("Total Sellers")
    }
  };

  const handleViewDetails = (shipment: OrderResponse) => {
    setSelectedShipment(shipment);
    setDetailsModalOpen(true);
  };

  const handleAddShipment = () => {
    setAddShipmentModalOpen(true);
  };

  const handleShipmentCreated = () => {
    console.log('Shipment created, refreshing list...');
    loadShipments();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl p-8 text-white relative overflow-hidden w-full"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-3xl mb-2">{t("System Overview 📊")}</h1>
            <p className="text-purple-100">{t("Monitor and manage all aspects of Circle Code System.")}</p>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
            <Checkbox
              id="today-filter"
              checked={isToday}
              onCheckedChange={(checked) => setIsToday(checked as boolean)}
            />
            <label
              htmlFor="today-filter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t("Today's Data")}
            </label>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isToday ? 'xl:grid-cols-6' : 'xl:grid-cols-6'} gap-4`}>
        <StatCard
          title={currentStats.labels.shipments}
          value={currentStats.shipments}
          icon={Package}
          gradient={isToday ? "from-blue-500 to-green-500" : "from-blue-500 to-blue-600"}
          badge={isToday ? t("TODAY") : undefined}
        />
        <StatCard
          title={currentStats.labels.pending}
          value={currentStats.pending}
          icon={Clock}
          gradient={isToday ? "from-orange-500 to-green-500" : "from-orange-500 to-orange-600"}
          badge={isToday ? t("TODAY") : undefined}
        />
        <StatCard
          title={currentStats.labels.completed}
          value={currentStats.completed}
          icon={TrendingUp}
          gradient={isToday ? "from-green-500 to-green-400" : "from-green-500 to-green-600"}
          badge={isToday ? t("TODAY") : undefined}
        />
        <StatCard
          title={currentStats.labels.collection}
          value={`${t("EGP")} ${currentStats.collection.toFixed(0)}`}
          icon={DollarSign}
          gradient={isToday ? "from-purple-500 to-green-500" : "from-purple-500 to-purple-600"}
          badge={isToday ? t("TODAY") : undefined}
        />
        <StatCard
          title={currentStats.labels.agents}
          value={currentStats.activeAgents}
          icon={Users}
          gradient={isToday ? "from-pink-500 to-green-500" : "from-pink-500 to-pink-600"}
          badge={isToday ? t("TODAY") : undefined}
        />
        <StatCard
          title={currentStats.labels.sellers}
          value={currentStats.sellers}
          icon={Users}
          gradient={isToday ? "from-indigo-500 to-green-500" : "from-indigo-500 to-indigo-600"}
          badge={isToday ? t("TODAY") : undefined}
        />
      </div>

      {/* Recent Activity */}
      {role === UserRole.SuperAdmin && (
        <Card className="p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">{t("Recent Activities")}</h2>
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
                {t("Top Performing Agents")}
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
                          <p>{agent.numberofOrder || 0} {t("Orders")}</p>
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
                {t("Branch Performance")}
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
                          <Badge variant="secondary">{branch.ordersNumber || 0} {t("Orders")}</Badge>
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
