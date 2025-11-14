import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, TrendingUp, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import { NewShipmentsTable } from '../components/NewShipmentsTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shipment } from '../types';
import { Activity } from '../lib/mockData';

interface SellerDashboardProps {
  onNavigate?: (page: string) => void;
}

export function SellerDashboard({ onNavigate }: SellerDashboardProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);

  // Empty data - to be replaced with API calls
  const shipments: Shipment[] = [];
  const activities: Activity[] = [];
  
  const recentShipments = shipments.slice(0, 5);
  const completedCount = 0;
  const pendingCount = 0;
  const inPickupCount = 0;
  const totalShipments = 0;
  const totalCollection = 0;

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      picked_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl mb-2">Welcome back, Seller! 👋</h1>
          <p className="text-blue-100">
            Here's what's happening with your shipments today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          delay={0.2}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={TrendingUp}
          trend={{ value: 8, positive: true }}
          delay={0.3}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Collection Amount"
          value={`$${totalCollection.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 15, positive: true }}
          delay={0.4}
          gradient="from-purple-500 to-purple-600"
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

      {/* Recent Shipments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <NewShipmentsTable
          shipments={recentShipments}
          onViewDetails={handleViewDetails}
          onAddShipment={handleAddShipment}
          showAddButton={true}
          onViewAll={() => onNavigate?.('shipments')}
        />
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