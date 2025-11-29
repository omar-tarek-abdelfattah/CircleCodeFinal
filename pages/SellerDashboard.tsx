import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { NewShipmentsTable } from '../components/NewShipmentsTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';

import { AgiOrderSummary, OrderResponse, ShipmentStatusString } from '../types';

import { shipmentsAPI } from '../services/api';
import { useAuth } from '@/contexts/AuthContext';

interface SellerDashboardProps {
  onNavigate?: (page: string) => void;
}

export function SellerDashboard({ onNavigate }: SellerDashboardProps) {
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<OrderResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);

  const [shipments, setShipments] = useState<OrderResponse[]>([]);

  const [totalCollection, setTotalCollection] = useState(0);

  const [summary, setSummary] = useState<AgiOrderSummary>({});


  const fetchSummary = async () => {
    const summary = await shipmentsAPI.getSummary();
    setSummary(summary);
  };


  const fetchShipments = async () => {
    const shipments = await shipmentsAPI.getAll();
    setShipments(shipments);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchSummary();
        fetchShipments();
        setTotalCollection(shipments.filter(s => s.statusOrder === ShipmentStatusString.Delivered).reduce((total, shipment) => total + shipment.totalPrice, 0));

      } catch (error) {
        console.error("Failed to fetch seller dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (shipment: OrderResponse) => {
    if (shipment && (shipment.id)) {
      setSelectedShipment(shipment);
      setDetailsModalOpen(true);
    } else {
      console.error("Shipment selected is missing an ID.", shipment);
    }
  };

  const handleAddShipment = () => {
    setAddShipmentModalOpen(true);
  };

  const handleShipmentCreated = () => {
    console.log('Shipment created, refreshing list...');
    // قم باستدعاء fetchData لتحديث البيانات بعد إضافة شحنة جديدة
    // fetchData(); 
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
          <h1 className="text-3xl mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-blue-100">
            Monitor and manage your shipments effortlessly.
          </p>
        </div>
      </motion.div>

      {/* --- */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Shipments"
          value={summary?.totalOrder as number}
          icon={Package}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="In Pickup Stage"
          value={summary?.totalPindingOrder as number}
          icon={Clock}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed"
          value={summary?.totalDeliveredOrder as number}
          icon={TrendingUp}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Collection Amount"
          value={`$${totalCollection.toFixed(0)}`}
          icon={DollarSign}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* --- */}

      {/* Recent Activity */}

      {/* --- */}

      {/* New Shipments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <NewShipmentsTable
          shipments={shipments.slice(0, 5)}
          onViewDetails={handleViewDetails}
          onAddShipment={handleAddShipment}
          showAddButton={true}
          onViewAll={() => onNavigate?.('shipments')}
        />
      </motion.div>

      {/* --- */}

      {/* Quick Actions */}
      {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Create a new shipment or check your full profile details.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleAddShipment} className="bg-green-600 hover:bg-green-700">
                <Package className="w-4 h-4 mr-2" /> Add New Shipment
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.('profile')}>
                View Profile <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* --- */}

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