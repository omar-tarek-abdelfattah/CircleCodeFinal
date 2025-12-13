import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Download,
  Printer,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Building2,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { UserRole } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { CardHeader, CardTitle } from '../components/ui/card';
import { agentsAPI, branchesAPI, shipmentsAPI } from '../services/api';
import { Checkbox } from '../components/ui/checkbox';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [isToday, setIsToday] = useState(false);
  const { role } = useAuth();

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Orders based on checkbox
        let ordersData;
        if (isToday) {
          const today = new Date().toISOString().split('T')[0];
          ordersData = await shipmentsAPI.getAllbyDate(today, today);
        } else {
          ordersData = await shipmentsAPI.getAll();
        }
        setOrders(ordersData);

        // Fetch other data if SuperAdmin
        if (role === UserRole.SuperAdmin) {
          const [agentsData, branchesData] = await Promise.all([
            agentsAPI.getAll(),
            branchesAPI.getAll(),
          ]);
          setAgents(agentsData.filter((a: any) => a.isctive || a.isactive === true));
          setBranches(branchesData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      }
    };
    fetchData();
  }, [role, isToday]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Export logic can be re-implemented if needed based on current data
  };

  // Calculate display values
  const totalShipments = orders.length;
  // Delivery Rate: (Delivered / Total) * 100.
  const deliveredOrders = orders.filter((order) => order.statusOrder === 'Delivered' || order.statusOrder === 'RejectedWithShippingFees');
  const deliveredCount = deliveredOrders.length;
  const deliveryRate = totalShipments > 0 ? ((deliveredCount / totalShipments) * 100).toFixed(1) : '0';

  // Revenue: Sum of deliveryCost for all orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.deliveryCost || 0), 0);
  const sellerRevenue = orders.filter((order) => order.statusOrder === 'Delivered')
    .reduce((sum, order) => sum + (order.productPrice || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 dark:text-slate-100">{t("Reports & Analytics")}</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isToday
              ? t("Comprehensive analytics and insights for today")
              : t("Comprehensive analytics and insights for your business")}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800">
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

          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            {t("Print")}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t("Export")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              {t("Total Shipments")}
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">{totalShipments.toLocaleString()}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isToday ? t("Today's shipments") : t("Across all periods")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>

            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              {t("Delivery Rate")}
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">{deliveryRate}%</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("Successfully delivered")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              {t("Total Revenue")}
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">
              ${role === UserRole.Seller ? sellerRevenue.toLocaleString() : totalRevenue.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              
            </p>
          </CardContent>
        </Card>
      </div>

      {role === UserRole.SuperAdmin && (
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
      )}

    </div>
  );
}
