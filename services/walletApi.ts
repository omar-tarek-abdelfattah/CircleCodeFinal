import { Transaction, WalletSummary } from '../types';
import { apiCall } from './api.ts';

/**
 * Wallet API Service
 * 
 * This service is ready for backend integration.
 * All mock data has been removed - connect to your .NET API endpoints.
 * 
 * Backend Integration TODO:
 * 1. Replace empty data returns with fetch/axios calls to your .NET API
 * 2. Update endpoints to match your backend routes
 * 3. Add proper error handling
 * 4. Add authentication headers
 */

export const walletApi = {
  /**
   * Get wallet summary (balance, earnings, withdrawals, pending)
   * 
   * TODO: Replace with actual API call
   * Example: GET /api/wallet/summary
   */
  getSummary: async (): Promise<WalletSummary> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/api/wallet/summary`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // return await response.json();
    const {
      assigned,
      outstanding,
      collected,
    } = await apiCall('/Wallet') as any;
    console.log('Wallet summary from backend:', assigned, outstanding, collected);
    console.log('Type of data:');


    // Return empty data until backend is connected
    return {
      balance: assigned,
      totalEarnings: collected,
      totalWithdrawals: outstanding,
      pendingAmount: outstanding,
    };
  },

  /**
   * Get transaction history
   * 
   * TODO: Replace with actual API call
   * Example: GET /api/wallet/transactions?page=1&limit=10
   */
  getTransactions: async (page: number = 1, limit: number = 10): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual API call
    // const response = await fetch(
    //   `${API_BASE_URL}/api/wallet/transactions?page=${page}&limit=${limit}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );
    // return await response.json();

    // Return empty array until backend is connected
    return [];
  },

  /**
   * Get monthly revenue data for charts
   * 
   * TODO: Replace with actual API call
   * Example: GET /api/wallet/monthly-revenue?months=12
   */
  getMonthlyRevenue: async (months: number = 12): Promise<Array<{ month: string; revenue: number }>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Replace with actual API call
    // const response = await fetch(
    //   `${API_BASE_URL}/api/wallet/monthly-revenue?months=${months}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );
    // return await response.json();

    // Return empty array until backend is connected
    return [];
  },

  /**
   * Refresh wallet data
   * 
   * TODO: Replace with actual API call
   * Example: POST /api/wallet/refresh
   */
  refresh: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual API call
    // await fetch(`${API_BASE_URL}/api/wallet/refresh`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
  },

  /**
   * Export wallet data
   * 
   * TODO: Replace with actual API call
   * Example: GET /api/wallet/export?format=excel
   */
  exportData: async (format: 'excel' | 'pdf' = 'excel'): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Replace with actual API call
    // const response = await fetch(
    //   `${API_BASE_URL}/api/wallet/export?format=${format}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //     },
    //   }
    // );
    // const blob = await response.blob();
    // // Download file logic
  },
};
