import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Clock,
  MapPin,
  BarChart3,
  FileText,
  Filter,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import * as XLSX from 'xlsx';

// TODO: Connect to backend API to fetch reports data
// All mock data has been removed - ready for backend integration

type DateFilterType = 'today' | 'lastWeek' | 'lastMonth' | 'last3Months' | 'lastYear' | 'custom' | null;

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('shipments');
  const [dateFilter, setDateFilter] = useState<DateFilterType>(null);
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Data states - empty until backend is connected
  const [shipmentTrend, setShipmentTrend] = useState<Array<{month: string; shipments: number; delivered: number; pending: number}>>([]);
  const [statusDistribution, setStatusDistribution] = useState<Array<{name: string; value: number; color: string}>>([]);
  const [revenueData, setRevenueData] = useState<Array<{month: string; revenue: number; cost: number; profit: number}>>([]);
  const [performanceData, setPerformanceData] = useState<Array<{name: string; shipments: number; delivered: number; rating: number; revenue: number}>>([]);
  const [branchData, setBranchData] = useState<Array<{branch: string; shipments: number; revenue: number; efficiency: number}>>([]);
  const [deliveryTimeData, setDeliveryTimeData] = useState<Array<{range: string; count: number; percentage: number}>>([]);
  
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
  const totalShipments = shipmentTrend.reduce((sum, item) => sum + item.shipments, 0);
  const totalDelivered = shipmentTrend.reduce((sum, item) => sum + item.delivered, 0);
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
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
              <Badge variant="outline" className="text-green-600 border-green-600">
                +12.5%
              </Badge>
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
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {deliveryRate}%
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-4">
              Delivery Rate
            </p>
            <h2 className="text-slate-900 dark:text-slate-100">{totalDelivered.toLocaleString()}</h2>
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

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shipments">
            <Package className="w-4 h-4 mr-2" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Users className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Clock className="w-4 h-4 mr-2" />
            Delivery Time
          </TabsTrigger>
        </TabsList>

        {/* Shipments Report */}
        <TabsContent value="shipments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={shipmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="shipments"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Branch Performance - Only visible for Admin */}
          {user?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchData.map((branch) => (
                      <TableRow key={branch.branch}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {branch.branch}
                          </div>
                        </TableCell>
                        <TableCell>{branch.shipments}</TableCell>
                        <TableCell>${branch.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${branch.efficiency}%` }}
                              />
                            </div>
                            <span className="text-sm">{branch.efficiency}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stackId="3"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((item) => (
                      <TableRow key={item.month}>
                        <TableCell>{item.month}</TableCell>
                        <TableCell className="text-blue-600">
                          ${item.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600">
                          ${item.cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-green-600">
                          ${item.profit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                    <Bar dataKey="profit" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Report */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Shipments</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((agent) => (
                    <TableRow key={agent.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          {agent.name}
                        </div>
                      </TableCell>
                      <TableCell>{agent.shipments}</TableCell>
                      <TableCell>{agent.delivered}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {((agent.delivered / agent.shipments) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span>{agent.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>${agent.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="shipments" fill="#3b82f6" />
                  <Bar dataKey="delivered" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Time Report */}
        <TabsContent value="delivery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deliveryTimeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {deliveryTimeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deliveryTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Time Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryTimeData.map((item, index) => (
                    <TableRow key={item.range}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {item.range}
                        </div>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${
                                index === 0
                                  ? 'bg-green-500'
                                  : index === 1
                                  ? 'bg-blue-500'
                                  : index === 2
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{item.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            index === 0
                              ? 'text-green-600 border-green-600'
                              : index === 1
                              ? 'text-blue-600 border-blue-600'
                              : index === 2
                              ? 'text-amber-600 border-amber-600'
                              : 'text-red-600 border-red-600'
                          }
                        >
                          {index === 0
                            ? 'Excellent'
                            : index === 1
                            ? 'Good'
                            : index === 2
                            ? 'Average'
                            : 'Needs Improvement'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
