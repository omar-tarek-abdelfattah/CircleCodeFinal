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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Separator } from '../components/ui/separator';
import {
  DollarSign,
  FileText,
  TrendingUp,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet as WalletIcon,
  Filter,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { walletApi } from '../services/walletApi';
import { Transaction, WalletSummary } from '../types';

type DateFilterType = 'today' | 'lastWeek' | 'lastMonth' | 'last3Months' | 'custom' | null;

const WalletPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number }>>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  // Date filter states
  const [dateFilter, setDateFilter] = useState<DateFilterType>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Load wallet data on component mount
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      
      // Load all wallet data in parallel
      const [summary, transactionsData, revenueData] = await Promise.all([
        walletApi.getSummary(),
        walletApi.getTransactions(1, 100), // Load more transactions for filtering
        walletApi.getMonthlyRevenue(12),
      ]);

      setWalletSummary(summary);
      setAllTransactions(transactionsData);
      setTransactions(transactionsData);
      setMonthlyRevenue(revenueData);
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

  // Get date range based on filter type
  const getDateRange = (filterType: DateFilterType): { from: Date; to: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterType) {
      case 'today':
        return {
          from: today,
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      case 'lastWeek':
        return {
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          to: now,
        };
      case 'lastMonth':
        return {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now,
        };
      case 'last3Months':
        return {
          from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          to: now,
        };
      case 'custom':
        if (customDateRange.from && customDateRange.to) {
          return {
            from: customDateRange.from,
            to: customDateRange.to,
          };
        }
        return null;
      default:
        return null;
    }
  };

  // Filter transactions based on date range
  const filterTransactionsByDate = () => {
    if (!dateFilter) {
      setTransactions(allTransactions);
      return;
    }

    const dateRange = getDateRange(dateFilter);
    if (!dateRange) {
      setTransactions(allTransactions);
      return;
    }

    const filtered = allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    });

    setTransactions(filtered);
  };

  // Apply filter when date filter or custom range changes
  useEffect(() => {
    filterTransactionsByDate();
  }, [dateFilter, customDateRange, allTransactions]);

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

  // Get filter label
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
      case 'custom':
        if (customDateRange.from && customDateRange.to) {
          return `${customDateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${customDateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  // Get period label for the 4th card
  const getPeriodLabel = () => {
    if (!dateFilter) return 'This Month';
    
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'lastWeek':
        return 'Last Week';
      case 'lastMonth':
        return 'Last Month';
      case 'last3Months':
        return 'Last 3 Months';
      case 'custom':
        return 'Selected Period';
      default:
        return 'This Month';
    }
  };

  // Clear filter
  const clearFilter = () => {
    setDateFilter(null);
    setCustomDateRange({ from: undefined, to: undefined });
  };

  // Handle filter selection
  const handleFilterSelect = (filter: DateFilterType) => {
    setDateFilter(filter);
    if (filter !== 'custom') {
      setIsFilterOpen(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await walletApi.refresh();
      await loadWalletData();
      toast.success('Wallet data refreshed');
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
      toast.error('Failed to refresh wallet data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await walletApi.exportData('excel');
      toast.success('Wallet data exported successfully');
    } catch (error) {
      console.error('Error exporting wallet data:', error);
      toast.error('Failed to export wallet data');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 dark:text-slate-100">Wallet</h1>
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
              ? `Showing financial data for ${getFilterLabel().toLowerCase()}`
              : 'Track your revenue and manage your finances'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
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
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
                    {dateFilter ? 'Period Balance' : 'Current Balance'}
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : `$${filteredSummary?.balance.toLocaleString() || 0}`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Net for period' : 'Available funds'}
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
                    {dateFilter ? 'Period Earnings' : 'Total Earnings'}
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : `$${filteredSummary?.totalEarnings.toLocaleString() || 0}`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Credits received' : 'Lifetime earnings'}
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
                    Pending Amount
                  </p>
                  <h2 className="text-slate-900 dark:text-slate-100">
                    {isLoading ? '...' : `$${filteredSummary?.pendingAmount.toLocaleString() || 0}`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dateFilter ? 'Pending in period' : 'Awaiting clearance'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Month's Earnings Card */}
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
        </motion.div>
      </div>

      {/* Monthly Revenue Tracking Chart */}
      <motion.div
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
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              {transactions.length > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {dateFilter 
                    ? `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} in selected period`
                    : `Latest ${Math.min(transactions.length, 10)} transactions`
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
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            {dateFilter ? 'No transactions found for the selected date range' : 'No transactions found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'credit' ? (
                              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate">
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-slate-500">
                          {transaction.reference}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              transaction.type === 'credit'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {transaction.type === 'credit' ? '+' : '-'}$
                            {transaction.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === 'completed'
                                ? 'default'
                                : transaction.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {transactions.length > 10 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-500 mb-2">
                      Showing 10 of {transactions.length} transactions
                    </p>
                    <Button variant="outline">View All Transactions</Button>
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
