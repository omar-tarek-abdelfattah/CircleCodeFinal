import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Users, TrendingUp, DollarSign, Building2, MapPin, Clock } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import { NewShipmentsTable } from '../components/NewShipmentsTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Shipment } from '../types';
import { Activity } from '../lib/mockData';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);

  // Empty data - to be replaced with API calls
  const shipments: Shipment[] = [];
  const activities: Activity[] = [];
  const agents: any[] = [];
  const branches: any[] = [];
  const zones: any[] = [];
  const sellers: any[] = [];

  const totalShipments = 0;
  const completedShipments = 0;
  const inPickupCount = 0;
  const totalCollection = 0;
  const activeAgents = 0;

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDetailsModalOpen(true);
  };

  const handleAddShipment = () => {
    setAddShipmentModalOpen(true);
  };

  const handleShipmentCreated = () => {
    // TODO: Refresh shipments list from API
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
          <p className="text-purple-100">
            Monitor and manage all aspects of Circle Code System.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Shipments"
          value={totalShipments}
          icon={Package}
          trend={{ value: 12, positive: true }}
          delay={0.1}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="In Pickup Stage"
          value={inPickupCount}
          icon={Clock}
          delay={0.15}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed"
          value={completedShipments}
          icon={TrendingUp}
          trend={{ value: 8, positive: true }}
          delay={0.2}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Collection Amount"
          value={`$${totalCollection.toFixed(0)}`}
          icon={DollarSign}
          trend={{ value: 15, positive: true }}
          delay={0.25}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Active Agents"
          value={activeAgents}
          icon={Users}
          delay={0.3}
          gradient="from-pink-500 to-pink-600"
        />
        <StatCard
          title="Total Sellers"
          value={sellers.length}
          icon={Users}
          delay={0.35}
          gradient="from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RecentActivity activities={activities} />
      </motion.div>

      {/* New Shipments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Performing Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No agents data available
                </p>
              ) : (
                <div className="space-y-3">
                  {agents
                    .sort((a, b) => b.completedShipments - a.completedShipments)
                    .slice(0, 3)
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
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {agent.zone}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p>{agent.completedShipments}</p>
                          <div className="flex items-center gap-1 text-sm text-yellow-600">
                            <span>★</span>
                            <span>{agent.rating}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Branches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branch Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {branches.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No branches data available
                </p>
              ) : (
                <div className="space-y-3">
                  {branches.map((branch, index) => (
                    <motion.div
                      key={branch.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div>
                        <p>{branch.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {branch.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {branch.activeShipments || 0} active
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Zones Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Coverage Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {zones.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No zones data available
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <h4 className="mb-2">{zone.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {zone.coverage}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Active Agents</span>
                      <Badge variant="secondary">{zone.activeAgents || 0}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal
        shipment={selectedShipment}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Add Shipment Modal */}
      <AddShipmentModal
        isOpen={addShipmentModalOpen}
        onClose={() => setAddShipmentModalOpen(false)}
        onSuccess={handleShipmentCreated}
      />
    </div>
  );
}