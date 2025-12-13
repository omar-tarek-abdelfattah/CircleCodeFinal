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
  Globe, // ما زلنا نحتفظ بها للاستخدام في مكان آخر أو كرمز للغة
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; 
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

// ⚠️ سأفترض أن لديك مكون Switch في مكتبة UI الخاصة بك. إذا لم يكن متوفراً، استخدم HTML input type="checkbox"
// (يجب أن تستبدل <LanguageSwitchComponent> بمكون Switch الفعلي)
const LanguageSwitchComponent = ({ checked, onCheckedChange }) => (
    <div className="flex items-center space-x-2 p-2">
        <span className={`text-sm font-medium ${!checked ? 'text-blue-500' : 'text-slate-500'}`}>EN</span>
        {/* هذا هو المكون الافتراضي للـ Switch. استخدم هنا المكون الفعلي لديك */}
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={e => onCheckedChange(e.target.checked)}
            className="w-10 h-6 appearance-none bg-slate-300 rounded-full cursor-pointer transition-colors relative 
                       checked:bg-blue-500 after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 
                       after:bg-white after:rounded-full after:transition-all checked:after:translate-x-4 dark:bg-slate-700"
            style={{ minWidth: '40px' }} 
        />
        <span className={`text-sm font-medium ${checked ? 'text-blue-500' : 'text-slate-500'}`}>AR</span>
    </div>
);


// المفاتيح التي تم تعديلها لاستخدام دالة الترجمة t()
interface NavItem {
  labelKey: string; 
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  showBadge?: (user: any, newOrdersCount: number) => boolean;
  badgeCount?: (newOrdersCount: number) => number;
}

const navItems: NavItem[] = [
  { labelKey: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: "dashboard", roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'shipments', icon: <Package className="w-5 h-5" />, path: "shipments", roles: [UserRole.Seller, UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'assigned_shipments', icon: <Truck className="w-5 h-5" />, path: 'assigned-shipments', roles: [UserRole.agent] },
  { labelKey: 'sellers', icon: <Users className="w-5 h-5" />, path: 'sellers', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'agents', icon: <Users className="w-5 h-5" />, path: 'agents', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'branches', icon: <Building2 className="w-5 h-5" />, path: 'branches', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'zones', icon: <MapPin className="w-5 h-5" />, path: 'zones', roles: [UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'wallet', icon: <Wallet className="w-5 h-5" />, path: 'wallet', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'reports', icon: <FileText className="w-5 h-5" />, path: 'reports', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
  { labelKey: 'admins', icon: <User className="w-5 h-5" />, path: 'users', roles: [UserRole.SuperAdmin] },
  { labelKey: 'profile', icon: <User className="w-5 h-5" />, path: 'profile', roles: [UserRole.Seller, UserRole.agent, UserRole.Admin, UserRole.SuperAdmin] },
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
  
  const { i18n, t } = useTranslation(); 

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // دالة تغيير اللغة (بدون تغيير الاتجاه RTL/LTR)
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // ⚠️ تم حذف السطر: document.documentElement.dir = ...
  };
  
  // دالة لمعالجة التبديل
  const handleLanguageToggle = (isChecked: boolean) => {
    // إذا كان الزر في وضع التشغيل (checked) = اللغة العربية (ar)
    // إذا كان الزر في وضع الإيقاف (unchecked) = اللغة الإنجليزية (en)
    const newLang = isChecked ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  // الحالة الحالية للزر (Checked = ar)
  const isArabic = i18n.language.includes('ar');


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">

      {/* Top Navbar */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 print:hidden">
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
              <span className="text-xl hidden sm:block">{t('Circle Code') || 'Circle Code'}</span> 
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* 4. زر تبديل اللغة (Language Switch) */}
            <LanguageSwitchComponent 
                checked={isArabic} 
                onCheckedChange={handleLanguageToggle}
            />

            {/* زر تغيير الثيم (Theme Toggle) */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <NotificationDropdown />
            
            {/* قائمة المستخدم المنسدلة (User Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hidden sm:flex">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{user.name}</span>
                    <Badge variant="secondary" className="text-xs capitalize">{t(user.role) || user.role}</Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('My Account') || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')}><User className="w-4 h-4 mr-2" />{t('profile') || 'Profile'}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600"><LogOut className="w-4 h-4 mr-2" />{t('logout') || 'Logout'}</DropdownMenuItem>
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
              className={`fixed left-0 top-16 bottom-0 z-40 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-800 ${mobileMenuOpen ? 'block' : 'hidden lg:block'} print:hidden`}
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
                    {/* استخدام دالة t لترجمة عناوين القائمة الجانبية */}
                    <span className="flex-1 text-left">{t(item.labelKey) || item.labelKey}</span> 
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
      <main className={`pt-20 pb-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} print:p-0 print:m-0 print:w-full`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-4 lg:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-8rem)] print:p-0 print:m-0 print:w-full print:max-w-none">
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} print:hidden`}>
        <div className="px-4 lg:px-6 py-3">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {t("All Rights Reserved By")} <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{t("Circle Code")}</span> — {t("Design and development") || 'All Rights Reserved'} © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}