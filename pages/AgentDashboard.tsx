import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, CheckCircle, Clock, DollarSign, } from 'lucide-react';
import { StatCard } from '../components/StatCard';

import { AgentOrdersTable } from '../components/AgentOrdersTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';


import { AgiOrderResponse, AgiOrderSummary, AgiOrderSummaryToday, ShipmentStatusString } from '../types';
import { shipmentsAPI } from '@/services/api';

interface AgentDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AgentDashboard({ onNavigate }: AgentDashboardProps) {
  const [selectedShipment, setSelectedShipment] = useState<AgiOrderResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignedShipments, setAssignedShipments] = useState<AgiOrderResponse[]>([]);
  const [summaryToday, setSummaryToday] = useState<AgiOrderSummaryToday | null>(null);
  const [summary, setSummary] = useState<AgiOrderSummary | null>(null);


  // Empty data - to be replaced with API calls

  const handleViewDetails = (shipment: AgiOrderResponse) => {
    setSelectedShipment(shipment);
    setDetailsModalOpen(true);
  };

  const fetchSummary = async () => {
    const summary = await shipmentsAPI.getSummary();
    setSummary(summary);
  };

  const fetchSummaryToday = async () => {
    const summaryToday = await shipmentsAPI.getSummaryToday();
    setSummaryToday(summaryToday);
  };


  const fetchShipments = async () => {
    const shipments = await shipmentsAPI.getAllAssignedShipments();
    setAssignedShipments(shipments);
  };
  useEffect(() => {
    const init = () => {
      fetchSummary();
      fetchSummaryToday();
      fetchShipments();
    }
    init();
  }, []);

  const handleStatusChanged = () => {
    // TODO: Refresh shipments list from API
    console.log('Status changed, refreshing list...');
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
            You have {assignedShipments.length} active shipments to deliver today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Shipments"
          value={assignedShipments.filter(s => [ShipmentStatusString.Returned, ShipmentStatusString.InPickupStage, ShipmentStatusString.DeliveredToAgent]
            .includes(s.statusOrder as ShipmentStatusString)).length}
          icon={Package}
          delay={0.1}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="In Pickup Stage"
          value={assignedShipments.filter(s => s.statusOrder === ShipmentStatusString.InPickupStage).length}
          icon={Clock}
          delay={0.2}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed Today"
          value={summaryToday?.totalOrder as number}
          icon={CheckCircle}
          trend={{ value: 20, positive: true }}
          delay={0.3}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Today's Earnings"
          value={`EGP${summaryToday?.totalOrder}`}
          icon={DollarSign}
          trend={{ value: 18, positive: true }}
          delay={0.4}
          gradient="from-yellow-500 to-yellow-600"
        />
      </div>
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