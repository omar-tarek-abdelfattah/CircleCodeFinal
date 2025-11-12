import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { SellerDashboard } from './pages/SellerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { BillOfLadingPage } from './pages/BillOfLadingPage';
import { BulkBillOfLadingPage } from './pages/BulkBillOfLadingPage';
import { SellersPage } from './pages/SellersPage';
import { AgentsPage } from './pages/AgentsPage';
import { BranchesPage } from './pages/BranchesPage';
import { ZonesPage } from './pages/ZonesPage';
import WalletPage from './pages/WalletPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from './components/ui/sonner';
import { Shipment } from './types';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState('dashboard');
  const [selectedShipmentForBill, setSelectedShipmentForBill] = useState<Shipment | null>(null);
  const [selectedShipmentsForBulkBill, setSelectedShipmentsForBulkBill] = useState<Shipment[]>([]);

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigateToBillOfLading = (shipment: Shipment) => {
    setPreviousPage(currentPage);
    setSelectedShipmentForBill(shipment);
    setCurrentPage('bill-of-lading');
  };

  const handleNavigateToBulkBillOfLading = (shipments: Shipment[]) => {
    setPreviousPage(currentPage);
    setSelectedShipmentsForBulkBill(shipments);
    setCurrentPage('bulk-bill-of-lading');
  };

  const handleBackFromBillOfLading = () => {
    setSelectedShipmentForBill(null);
    setCurrentPage(previousPage);
  };

  const handleBackFromBulkBillOfLading = () => {
    setSelectedShipmentsForBulkBill([]);
    setCurrentPage(previousPage);
  };

  const renderPage = () => {
    // Bill of Lading Page
    if (currentPage === 'bill-of-lading') {
      return (
        <BillOfLadingPage 
          shipment={selectedShipmentForBill}
          onBack={handleBackFromBillOfLading}
        />
      );
    }

    // Bulk Bill of Lading Page
    if (currentPage === 'bulk-bill-of-lading') {
      return (
        <BulkBillOfLadingPage 
          shipments={selectedShipmentsForBulkBill}
          onBack={handleBackFromBulkBillOfLading}
        />
      );
    }

    // Dashboard
    if (currentPage === 'dashboard') {
      if (user.role === 'seller') return <SellerDashboard onNavigate={setCurrentPage} />;
      if (user.role === 'agent') return <AgentDashboard onNavigate={setCurrentPage} />;
      if (user.role === 'admin') return <AdminDashboard onNavigate={setCurrentPage} />;
    }

    // Shipments (for Seller and Admin)
    if (currentPage === 'shipments' && (user.role === 'seller' || user.role === 'admin')) {
      return <ShipmentsPage onNavigateToBillOfLading={handleNavigateToBillOfLading} onNavigateToBulkBillOfLading={handleNavigateToBulkBillOfLading} />;
    }

    // Assigned Shipments (for Agent)
    if (currentPage === 'assigned-shipments' && user.role === 'agent') {
      return <ShipmentsPage onNavigateToBillOfLading={handleNavigateToBillOfLading} onNavigateToBulkBillOfLading={handleNavigateToBulkBillOfLading} />;
    }

    // Sellers (for Admin only)
    if (currentPage === 'sellers' && user.role === 'admin') {
      return <SellersPage />;
    }

    // Agents (for Admin only)
    if (currentPage === 'agents' && user.role === 'admin') {
      return <AgentsPage />;
    }

    // Branches (for Admin only)
    if (currentPage === 'branches' && user.role === 'admin') {
      return <BranchesPage />;
    }

    // Zones (for Admin only)
    if (currentPage === 'zones' && user.role === 'admin') {
      return <ZonesPage />;
    }

    // Wallet (for all roles)
    if (currentPage === 'wallet') {
      return <WalletPage />;
    }

    // Reports (for all roles)
    if (currentPage === 'reports') {
      return <ReportsPage />;
    }

    // Users (for Admin only)
    if (currentPage === 'users' && user.role === 'admin') {
      return <UsersPage />;
    }

    // Profile (for all roles)
    if (currentPage === 'profile') {
      return <ProfilePage />;
    }

    // Placeholder for other pages
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl mb-2">
            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')} Page
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            This page is under development
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}