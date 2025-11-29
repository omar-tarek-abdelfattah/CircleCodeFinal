import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Filter,
  X,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import * as XLSX from 'xlsx';
import { UserRole } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Building2, Users } from 'lucide-react';
import { CardHeader, CardTitle } from '../components/ui/card';
import { agentsAPI, branchesAPI, shipmentsAPI } from '../services/api';
import { OrderResponse, ShipmentStatusString } from '../types';

// TODO: Connect to backend API to fetch reports data
// All mock data has been removed - ready for backend integration

type DateFilterType = 'today' | 'lastWeek' | 'lastMonth' | 'last3Months' | 'lastYear' | 'custom' | null;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('shipments');
  const [dateFilter, setDateFilter] = useState<DateFilterType>(null);
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { role } = useAuth();

  // Data states - empty until backend is connected
  const [shipmentTrend, setShipmentTrend] = useState<Array<{ month: string; shipments: number; delivered: number; pending: number }>>([]);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; cost: number; profit: number }>>([]);
  const [performanceData, setPerformanceData] = useState<Array<{ name: string; shipments: number; delivered: number; rating: number; revenue: number }>>([]);
  const [deliveryTimeData, setDeliveryTimeData] = useState<Array<{ range: string; count: number; percentage: number }>>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [shipments, setShipments] = useState<OrderResponse[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const shipmentsData = await shipmentsAPI.getAll();
        setShipments(shipmentsData);

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
  }, [role]);

  // TODO: Load data from backend API
  // useEffect(() => {
  //   loadReportsData();
  // }, [dateFilter, customDateRange]);
  //
  // const loadReportsData = async () => {
  //   try {
  //     const response = await reportsAPI.getData({ dateFilter, customDateRange });
  //     setShipmentTrend(response.shipmentTrend);
  //     setStatusDistribution(response.statusDistribution);
  //     setRevenueData(response.revenueData);
  //     setPerformanceData(response.performanceData);
  //     setBranchData(response.branchData);
  //     setDeliveryTimeData(response.deliveryTimeData);
  //   } catch (error) {
  //     console.error('Failed to load reports data:', error);
  //   }
  // };

  const handleFilterSelect = (filter: DateFilterType) => {
    setDateFilter(filter);
    if (filter !== 'custom') {
      setIsFilterOpen(false);
    }
  };

  const clearFilter = () => {
    setDateFilter(null);
    setCustomDateRange({ from: undefined, to: undefined });
  };

  const getFilterLabel = () => {
    if (!dateFilter) return 'All Time';

    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'lastWeek':
        return 'Last Week';
      case 'lastMonth':
        return 'Last Month';
      case 'last3Months':
        return 'Last 3 Months';
      case 'lastYear':
        return 'Last Year';
      case 'custom':
        if (customDateRange.from && customDateRange.to) {
          return `${customDateRange.from.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })} - ${customDateRange.to.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}`;
        }
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  const handleExport = () => {
    let dataToExport: any[] = [];
    let filename = 'report';

    switch (activeTab) {
      case 'shipments':
        dataToExport = shipmentTrend.map((item) => ({
          Month: item.month,
          'Total Shipments': item.shipments,
          Delivered: item.delivered,
          Pending: item.pending,
        }));
        filename = 'shipments-report';
        break;
      case 'revenue':
        dataToExport = revenueData.map((item) => ({
          Month: item.month,
          Revenue: item.revenue,
          Cost: item.cost,
          Profit: item.profit,
        }));
        filename = 'revenue-report';
        break;
      case 'performance':
        dataToExport = performanceData.map((item) => ({
          Agent: item.name,
          Shipments: item.shipments,
          Delivered: item.delivered,
          Rating: item.rating,
          Revenue: item.revenue,
        }));
        filename = 'performance-report';
        break;
      case 'delivery':
        dataToExport = deliveryTimeData.map((item) => ({
          'Time Range': item.range,
          Count: item.count,
          Percentage: `${item.percentage}%`,
        }));
        filename = 'delivery-time-report';
        break;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Summary statistics
  const totalShipments = shipments.length;
  const totalDelivered = (shipments.filter(s => s.statusOrder === ShipmentStatusString.Delivered).length / shipments.length) * 100;
  const totalRevenue = shipments
    .filter(s => s.statusOrder === ShipmentStatusString.Delivered || s.statusOrder === ShipmentStatusString.RejectedWithShippingFees)
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalProfit = totalRevenue; // As requested, profit is same as revenue
  const deliveryRate = totalShipments > 0 ? ((totalDelivered / totalShipments) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 dark:text-slate-100">Reports & Analytics</h1>
            {dateFilter && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm">
                <Filter className="w-3.5 h-3.5" />
                <span>{getFilterLabel()}</span>
                <button
                  onClick={clearFilter}
                  className="hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {dateFilter
              ? `Comprehensive analytics and insights for ${getFilterLabel().toLowerCase()}`
              : 'Comprehensive analytics and insights for your business'}
          </p>
        </div>
        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                {dateFilter ? 'Change Period' : 'Filter Period'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3">Date Range</h4>
                  <div className="space-y-2">
                    <Button
                      variant={dateFilter === 'today' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleFilterSelect('today')}
                    >
                      Today
                    </Button>
                    <Button
                      variant={dateFilter === 'lastWeek' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleFilterSelect('lastWeek')}
                    >
                      Last Week
                    </Button>
                    <Button
                      variant={dateFilter === 'lastMonth' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleFilterSelect('lastMonth')}
                    >
                      Last Month
                    </Button>
                    <Button
                      variant={dateFilter === 'last3Months' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleFilterSelect('last3Months')}
                    >
                      Last 3 Months
                    </Button>
                    <Button
                      variant={dateFilter === 'lastYear' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleFilterSelect('lastYear')}
                    >
                      Last Year
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3">Custom Range</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-500 dark:text-slate-400 mb-1 block">
                        From
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            size="sm"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {customDateRange.from ? (
                              customDateRange.from.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            ) : (
                              <span className="text-slate-500">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={customDateRange.from}
                            onSelect={(date) => {
                              setCustomDateRange({ ...customDateRange, from: date });
                              if (date && customDateRange.to) {
                                setDateFilter('custom');
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 dark:text-slate-400 mb-1 block">
                        To
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            size="sm"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {customDateRange.to ? (
                              customDateRange.to.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            ) : (
                              <span className="text-slate-500">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={customDateRange.to}
                            onSelect={(date) => {
                              setCustomDateRange({ ...customDateRange, to: date });
                              if (customDateRange.from && date) {
                                setDateFilter('custom');
                              }
                            }}
                            disabled={(date) =>
                              customDateRange.from ? date < customDateRange.from : false
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {customDateRange.from && customDateRange.to && (
                      <Button
                        variant="default"
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          setDateFilter('custom');
                          setIsFilterOpen(false);
                        }}
                      >
                        Apply Custom Range
                      </Button>
                    )}
                  </div>
                </div>

                {dateFilter && (
                  <>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        clearFilter();
                        setIsFilterOpen(false);
                      }}
                    >
                      Clear Filter
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              Total Shipments
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">{totalShipments.toLocaleString()}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all periods
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
              Delivery Rate
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">{totalDelivered.toLocaleString()}%</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Successfully delivered
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
                +18.2%
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              Total Revenue
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">
              ${totalRevenue.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Revenue generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                +22.1%
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              Total Profit
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">
              ${totalProfit.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Net profit margin
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
      )}

    </div>
  );
}
