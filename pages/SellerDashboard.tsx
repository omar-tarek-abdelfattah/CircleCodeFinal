import { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; 
import { Package, TrendingUp, Clock, DollarSign, ArrowRight, X } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import { NewShipmentsTable } from '../components/NewShipmentsTable';
import { ShipmentDetailsModal } from '../components/ShipmentDetailsModal';
import { AddShipmentModal } from '../components/AddShipmentModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Shipment } from '../types'; 
import { Activity } from '../lib/mockData';
import { shipmentsAPI, log, sellersAPI } from '../services/api'; 

// يجب استبدال هذا الـ ID بالـ ID الفعلي للبائع الذي تم تسجيل دخوله
const MOCK_SELLER_ID = 'seller_123'; 

interface SellerDashboardProps {
  onNavigate?: (page: string) => void;
  sellerId?: string; // يجب تمرير هذا الـ ID من الـ Auth Context
}

export function SellerDashboard({ onNavigate, sellerId }: SellerDashboardProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addShipmentModalOpen, setAddShipmentModalOpen] = useState(false);
  
  // حالات تخزين البيانات
  const [shipments, setShipments] = useState<any[]>([]);
  const [logData, setLogData] = useState<Activity[]>([]);
  const [sellerName, setSellerName] = useState('Seller'); 

  // حالات الإحصائيات
  const [completedShipments, setCompletedShipments] = useState(0);
  const [inPickupCount, setInPickupCount] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);
  const [totalShipments, setTotalShipments] = useState(0);
  
  const currentSellerId = sellerId || MOCK_SELLER_ID; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الشحنات والتصفية محليًا
        const [allShipmentsData, allLogsData, sellerData] = await Promise.all([
             shipmentsAPI.getAll(),
             log.getAll(),
             sellersAPI.getById(currentSellerId), // نفترض وجود getById للبائع
        ]);

        // 1. تصفية شحنات البائع
        const sellerShipments = allShipmentsData.filter(
          (s: any) => s.sellerId === currentSellerId 
        );
        
        // 2. تصفية سجل النشاطات للبائع
        const sellerLogs = allLogsData.filter(
            (activity: any) => activity.sellerId === currentSellerId 
        );
        
        setSellerName(sellerData?.name || 'Seller');
        setShipments(sellerShipments);
        setLogData(sellerLogs);
        setTotalShipments(sellerShipments.length);

        // حساب الإحصائيات
        const completed = sellerShipments.filter((s: any) => s.statusOrder === 'Delivered').length;
        const inPickup = sellerShipments.filter((s: any) => s.statusOrder === 'DeliveredToAgent').length; 
        const collection = sellerShipments
          .filter((s: any) => s.statusOrder === 'Delivered')
          .reduce((sum: number, s: any) => sum + (s.totalPrice || 0), 0);

        setCompletedShipments(completed);
        setInPickupCount(inPickup);
        setTotalCollection(collection);

      } catch (error) {
        console.error("Failed to fetch seller dashboard data:", error);
        // التعامل مع حالات الـ API غير المتوفرة (مثل 404 أو الدالة غير الموجودة)
      }
    };

    fetchData();
  }, [currentSellerId]); 

  const handleViewDetails = (shipment: Shipment) => {
    // التأكد من أن الشحنة تحتوي على ID قبل الفتح (لإصلاح خطأ 'Invalid ID undefined')
    // نفترض أن الـ ID موجود إما في خاصية 'id' أو 'ID'
    if (shipment && (shipment.id || shipment.ID)) { 
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
          <h1 className="text-3xl mb-2">Welcome back, {sellerName}! 👋</h1>
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
          value={totalShipments}
          icon={Package}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="In Pickup Stage"
          value={inPickupCount}
          icon={Clock}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed"
          value={completedShipments}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <RecentActivity activities={logData} />
        </Card>
      </motion.div>

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