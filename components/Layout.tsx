import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Package,
  LayoutDashboard,
  Wallet,
  User,
  Users,
  MapPin,
  Building2,
  FileText,
  Truck,
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { NotificationDropdown } from './NotificationDropdown';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  showBadge?: (user: any, newOrdersCount: number) => boolean;
  badgeCount?: (newOrdersCount: number) => number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: 'dashboard', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Shipments', icon: <Package className="w-5 h-5" />, path: 'shipments', roles: [UserRole.Seller, UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Assigned Shipments', icon: <Truck className="w-5 h-5" />, path: 'assigned-shipments', roles: [UserRole.agent] },
  { label: 'Sellers', icon: <Users className="w-5 h-5" />, path: 'Sellers', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Agents', icon: <Users className="w-5 h-5" />, path: 'agents', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Branches', icon: <Building2 className="w-5 h-5" />, path: 'branches', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Zones', icon: <MapPin className="w-5 h-5" />, path: 'zones', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Wallet', icon: <Wallet className="w-5 h-5" />, path: 'wallet', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Reports', icon: <FileText className="w-5 h-5" />, path: 'reports', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Users', icon: <User className="w-5 h-5" />, path: 'users', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { label: 'Profile', icon: <User className="w-5 h-5" />, path: 'profile', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
];

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { newOrdersCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      
      {/* Top Navbar */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex"><Menu className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl hidden sm:block">Circle Code</span>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <NotificationDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hidden sm:flex">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{user.name}</span>
                    <Badge variant="secondary" className="text-xs capitalize">{user.role}</Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')}><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')}><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <>
            {mobileMenuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-16 bottom-0 z-40 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-800 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}
            >
              <nav className="p-4 space-y-2">
                {filteredNavItems.map((item, idx) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => { onNavigate(item.path); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.path ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.showBadge && item.badgeCount && item.showBadge(user, newOrdersCount) && (
                      <Badge variant="secondary" className={`ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs ${currentPage === item.path ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {item.badgeCount(newOrdersCount)}
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`pt-20 pb-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-4 lg:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-8rem)]">
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <div className="px-4 lg:px-6 py-3">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Design & Development by <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Circle Code</span> — All Rights Reserved © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
