import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, CheckCircle, Clock, DollarSign, MapPin, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import { AgentOrdersTable } from '../components/AgentOrdersTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shipment } from '../types';
import { Activity } from '../lib/mockData';

interface AgentDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AgentDashboard({ onNavigate }: AgentDashboardProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  

  // Empty data - to be replaced with API calls
  const assignedShipments: Shipment[] = [];
  const activities: Activity[] = [];
  const activeShipments: Shipment[] = [];
  const completedToday = 0;
  const todayEarnings = 0;

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDetailsModalOpen(true);
  };

  const handleStatusChanged = () => {
    // TODO: Refresh shipments list from API
    console.log('Status changed, refreshing list...');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      picked_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl mb-2">Ready for deliveries! 🚚</h1>
          <p className="text-green-100">
            You have {activeShipments.length} active shipments to deliver today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Shipments"
          value={activeShipments.length}
          icon={Package}
          delay={0.1}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="In Pickup Stage"
          value={0}
          icon={Clock}
          delay={0.2}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          icon={CheckCircle}
          trend={{ value: 20, positive: true }}
          delay={0.3}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Today's Earnings"
          value={`$${todayEarnings.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 18, positive: true }}
          delay={0.4}
          gradient="from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RecentActivity activities={activities} />
      </motion.div>

      {/* Active Deliveries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <AgentOrdersTable
          shipments={assignedShipments}
          onViewDetails={handleViewDetails}
          onViewAll={() => onNavigate?.('shipments')}
          onStatusChanged={handleStatusChanged}
        />
      </motion.div>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal
        shipment={selectedShipment}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
}