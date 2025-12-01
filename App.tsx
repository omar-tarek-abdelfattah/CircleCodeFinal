import { useState, useEffect, type ComponentType } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
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
import { OrderResponseDetails } from './types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignUpPage } from './components/SignUpPage';
import ResetPasswordPage from './pages/ResetPass';


type ShipmentsNavigationHandlers = {
  onNavigateToBillOfLading?: (shipment: OrderResponseDetails) => void;
  onNavigateToBulkBillOfLading?: (shipments: OrderResponseDetails[]) => void;
};

const ShipmentsPageComponent = ShipmentsPage as unknown as ComponentType<ShipmentsNavigationHandlers>;

function AppContent() {
  const { user, role } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState('dashboard');
  const [selectedShipmentForBill, setSelectedShipmentForBill] = useState<OrderResponseDetails | null>(null);
  const [selectedShipmentsForBulkBill, setSelectedShipmentsForBulkBill] = useState<OrderResponseDetails[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !role) {
      setCurrentPage('dashboard');
    }
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigateToBillOfLading = (shipment: OrderResponseDetails) => {
    setPreviousPage(currentPage);
    setSelectedShipmentForBill(shipment);
    setCurrentPage('bill-of-lading');
  };

  const handleNavigateToBulkBillOfLading = (shipments: OrderResponseDetails[]) => {
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


    // Bill of Lading Pages
    if (currentPage === 'bill-of-lading') {
      if (role === UserRole.Seller || role === UserRole.Admin || role === UserRole.SuperAdmin || role === UserRole.agent) {
        return <BillOfLadingPage shipment={selectedShipmentForBill} onBack={handleBackFromBillOfLading} />;
      }
      return null;
    }

    if (currentPage === 'bulk-bill-of-lading') {
      if (role === UserRole.Seller || role === UserRole.Admin || role === UserRole.SuperAdmin || role === UserRole.agent) {
        return <BulkBillOfLadingPage shipments={selectedShipmentsForBulkBill} onBack={handleBackFromBulkBillOfLading} />;
      }
      return null;
    }

    // Dashboard
    if (currentPage === 'dashboard') {
      if (role === UserRole.Seller) return <SellerDashboard onNavigate={setCurrentPage} />;
      if (role === UserRole.agent) return <AgentDashboard onNavigate={setCurrentPage} />;
      if (role === UserRole.Admin || role === UserRole.SuperAdmin) return <AdminDashboard onNavigate={setCurrentPage} />;
      return null;
    }

    // Shipments
    if (currentPage === 'shipments' && (role === UserRole.Seller || role === UserRole.Admin || role === UserRole.SuperAdmin)) {
      return <ShipmentsPageComponent onNavigateToBillOfLading={handleNavigateToBillOfLading} onNavigateToBulkBillOfLading={handleNavigateToBulkBillOfLading} />;
    }

    if (currentPage === 'assigned-shipments' && role === UserRole.agent) {
      return <ShipmentsPageComponent onNavigateToBillOfLading={handleNavigateToBillOfLading} onNavigateToBulkBillOfLading={handleNavigateToBulkBillOfLading} />;
    }

    // Admin only pages
    if (currentPage === 'sellers' && (role === UserRole.Admin || role === UserRole.SuperAdmin)) return <SellersPage />;
    if (currentPage === 'agents' && (role === UserRole.Admin || role === UserRole.SuperAdmin)) return <AgentsPage />;
    if (currentPage === 'branches' && (role === UserRole.Admin || role === UserRole.SuperAdmin)) return <BranchesPage />;
    if (currentPage === 'zones' && (role === UserRole.Admin || role === UserRole.SuperAdmin)) return <ZonesPage />;
    if (currentPage === 'users' && (role === UserRole.SuperAdmin)) return <UsersPage />;
    if (currentPage === 'users' && (role === UserRole.Admin)) return <AdminDashboard />;

    // Pages available to all roles
    if (currentPage === 'wallet') return <WalletPage />;
    if (currentPage === 'reports') return <ReportsPage />;
    if (currentPage === 'profile') return <ProfilePage />;

    // Default placeholder
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl mb-2">{currentPage}</h2>
          <p className="text-slate-600 dark:text-slate-400">This page is not available for your role.</p>
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
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
