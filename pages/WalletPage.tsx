import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  FileText,
  TrendingUp,

  ArrowUpRight,
  ArrowDownRight,
  Wallet as WalletIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { walletApi } from '../services/walletApi';
import { OrderResponse, ShipmentStatusString, Transaction, WalletSummary } from '../types';
import { shipmentsAPI } from '@/services/api';

type DateFilterType = 'today' | 'lastWeek' | 'lastMonth' | 'last3Months' | 'custom' | null;

const WalletPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // Date filter states
  const [dateFilter, setDateFilter] = useState<DateFilterType>(null);



  const [orders, setOrders] = useState<OrderResponse[]>([]);
  // Load wallet data on component mount

  const loadOrdersData = async () => {
    try {
      setIsLoading(true);
      const ordersData = await shipmentsAPI.getAll();
      const filteredData = ordersData.filter(order => order.statusOrder === ShipmentStatusString.Delivered
        || order.statusOrder === ShipmentStatusString.RejectedWithShippingFees);
      const reversedData = filteredData.reverse();
      setOrders(reversedData);
      // Reset to first page when data loads
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading orders data:', error);
      toast.error('Failed to load orders data');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadWalletData();
    loadOrdersData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);

      // Load all wallet data in parallel
      const [summary] = await Promise.all([
        walletApi.getSummary(),
      ]);

      setWalletSummary(summary);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };






  // Calculate filtered wallet summary based on date range
  const getFilteredSummary = () => {
    if (!dateFilter || transactions.length === 0) {
      return walletSummary;
    }

    // Calculate totals from filtered transactions
    const totalEarnings = transactions
      .filter(t => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebits = transactions
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalEarnings - totalDebits;

    return {
      balance,
      totalEarnings,
      pendingAmount,
      totalWithdrawn: totalDebits,
    };
  };

  const filteredSummary = getFilteredSummary();

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Get filter label


  // Get period label for the 4th card
  // const getPeriodLabel = () => {
  //   if (!dateFilter) return 'This Month';

  //   switch (dateFilter) {
  //     case 'today':
  //       return 'Today';
  //     case 'lastWeek':
  //       return 'Last Week';
  //     case 'lastMonth':
  //       return 'Last Month';
  //     case 'last3Months':
  //       return 'Last 3 Months';
  //     case 'custom':
  //       return 'Selected Period';
  //     default:
  //       return 'This Month';
  //   }
  // };

  // // Clear filter
  // const clearFilter = () => {
  //   setDateFilter(null);
  //   setCustomDateRange({ from: undefined, to: undefined });
  // };

  // // Handle filter selection
  // const handleFilterSelect = (filter: DateFilterType) => {
  //   setDateFilter(filter);
  //   if (filter !== 'custom') {
  //     setIsFilterOpen(false);
  //   }
  // };

  // const handleRefresh = async () => {
  //   setIsRefreshing(true);
  //   try {
  //     await walletApi.refresh();
  //     await loadWalletData();
  //     toast.success('Wallet data refreshed');
  //   } catch (error) {
  //     console.error('Error refreshing wallet data:', error);
  //     toast.error('Failed to refresh wallet data');
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  // const handleExport = async () => {
  //   try {
  //     await walletApi.exportData('excel');
  //     toast.success('Wallet data exported successfully');
  //   } catch (error) {
  //     console.error('Error exporting wallet data:', error);
  //     toast.error('Failed to export wallet data');
  //   }
  // };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 dark:text-slate-100">{t("Wallet")}</h1>
            {/* {dateFilter && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm">
                <Filter className="w-3.5 h-3.5" />
                <span>{getFilterLabel()}</span>
                <button
                  // onClick={clearFilter}
                  className="hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )} */}
          </div>
        </div>
        <div className="flex gap-2">
          {/* <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                {dateFilter ? 'Change Filter' : 'Filter Period'}
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
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing} */}
          {/* > */}
          {/* <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> */}
          {/* Refresh */}
          {/* </Button> */}
          {/* <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    {dateFilter ? 'Period Balance' : t('Current Balance')}
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : `${t("EGP")} ${((filteredSummary?.pendingAmount || 0) + (filteredSummary?.totalEarnings || 0)).toLocaleString()}`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Net for period' : t('Available funds')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <WalletIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    {dateFilter ? 'Period Earnings' : t('Total Earnings')}
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : `${t("EGP")} ${orders.filter((order) => order.statusOrder === ShipmentStatusString.Delivered || order.statusOrder === ShipmentStatusString.RejectedWithShippingFees).reduce((total, order) => total + order.deliveryCost, 0) || 0}`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Credits received' : t('Lifetime earnings')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Amount Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    {t("Pending Amount")}
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : `${t("EGP")} ${filteredSummary?.pendingAmount.toLocaleString() || 0}`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Pending in period' : t('Awaiting clearance')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Month's Earnings Card
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    {getPeriodLabel()}
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : dateFilter 
                      ? `$${filteredSummary?.totalEarnings.toLocaleString() || 0}`
                      : `$${monthlyRevenue.length > 0 ? monthlyRevenue[monthlyRevenue.length - 1].revenue.toLocaleString() : 0}`
                    }
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Earnings in period' : 'Current month earnings'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}
      </div>

      {/* Monthly Revenue Tracking Chart */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <div className="text-slate-500">Loading chart data...</div>
              </div>
            ) : (
              <>
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyRevenue}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                        labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{
                          fill: '#3b82f6',
                          strokeWidth: 2,
                          r: 4,
                          stroke: 'white',
                        }}
                        activeDot={{
                          r: 6,
                          fill: '#3b82f6',
                          stroke: 'white',
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Revenue
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-4">
                    Last 12 months performance
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("Transactions")} {orders.length}</CardTitle>
              {orders.length > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {dateFilter
                    ? `${orders.length} transaction${orders.length !== 1 ? 's' : ''} in selected period`
                    : `${t("Showing")} ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, orders.length)} ${t("of")} ${orders.length} ${t("transactions")}`
                  }
                </p>
              )}
            </div>  
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-slate-500">
                Loading transactions...
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Type")}</TableHead>
                        <TableHead>{t("client name")}</TableHead>
                        <TableHead>{t("Date")}</TableHead>
                        <TableHead>{t("Seller")}</TableHead>
                        <TableHead className="text-right">{t("Amount")}</TableHead>
                        <TableHead>{t("Status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            {dateFilter ? 'No transactions found for the selected date range' : 'No transactions found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {order.statusOrder === ShipmentStatusString.Delivered ||
                                  order.statusOrder === ShipmentStatusString.RejectedWithShippingFees ? (
                                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                    <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </div>
                                )}
                                <span className="capitalize">{order.statusOrder}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px] truncate">
                                {order.clientName}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {formatDate(order.dateCreated)}
                            </TableCell>
                            <TableCell className="text-sm font-mono text-slate-500">
                              {order.clientName}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  order.statusOrder === ShipmentStatusString.Delivered ||
                                    order.statusOrder === ShipmentStatusString.RejectedWithShippingFees
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }
                              >
                                {order.statusOrder === ShipmentStatusString.Delivered ||
                                  order.statusOrder === ShipmentStatusString.RejectedWithShippingFees
                                  ? '+' 
                                  : '-'
                                }{t("EGP")}
                                {order.totalPrice.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.statusOrder === ShipmentStatusString.Delivered ||
                                    order.statusOrder === ShipmentStatusString.RejectedWithShippingFees
                                    ? 'default'
                                    : order.statusOrder === ShipmentStatusString.InWarehouse
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {order.statusOrder}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {orders.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {t("Showing page")} {currentPage} {t("of")} {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t("Previous")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        {t("Next")}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WalletPage;
