import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, CheckCheck, Trash2, Package, AlertCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
// import { toast } from 'sonner';

// Format timestamp to relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();

  // Check if timestamp has timezone info (Z or +HH:mm or -HH:mm)
  // If not, assume it's from the server in UTC-8 (PST) which causes the 10h offset (UTC+2 vs UTC-8)
  let dateStr = timestamp;
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(timestamp);
  if (!hasTimezone) {
    dateStr += '-08:00';
  }

  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order_created':
      return <Package className="w-4 h-4 text-blue-500" />;
    case 'order_assigned':
      return <Package className="w-4 h-4 text-green-500" />;
    case 'status_changed':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return <Bell className="w-4 h-4 text-slate-500" />;
  }
};

export function NotificationDropdown() {
  const { role } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    inactiveAgents,
    inactiveSellers,
    refreshInactiveUsers,
    activateSeller,
    activateAgent,
    todayOrdersCount
  } = useNotifications();

  if (role === UserRole.agent || role === UserRole.Seller) {
    return null;
  }

  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'inactive'>('notifications');
  const [vipStates, setVipStates] = useState<Record<string, boolean>>({});

  // Refresh inactive users when dropdown opens
  useEffect(() => {
    if (open) {
      refreshInactiveUsers();
    }
  }, [open]);

  const handleVipChange = (id: string, checked: boolean) => {
    setVipStates(prev => ({ ...prev, [id]: checked }));
  };

  const handleActivate = async (id: string, type: 'agent' | 'seller') => {
    if (type === 'seller') {
      await activateSeller(id, vipStates[id] || false);
    } else {
      const agent = inactiveAgents.find(a => a.id.toString() === id);
      // Use branchId from agent or default to "1" if missing (should be present)
      await activateAgent(id, agent?.branshName || "1");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {todayOrdersCount > 0 && (
            <Badge
              className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500 hover:bg-blue-600"
            >
              {todayOrdersCount > 99 ? '99+' : todayOrdersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <button
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors flex items-center ${activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
              <div className="flex gap-1 ml-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
                {todayOrdersCount > 0 && (
                  <Badge className="h-5 px-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    {todayOrdersCount} today
                  </Badge>
                )}
              </div>
            </button>
            {role === UserRole.SuperAdmin && (
              <button
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${activeTab === 'inactive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive Users
                {(inactiveAgents.length + inactiveSellers.length) > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {inactiveAgents.length + inactiveSellers.length}
                  </Badge>
                )}
              </button>
            )}
          </div>

          {activeTab === 'notifications' && notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={markAllAsRead}
                  className="h-7 w-7"
                  title="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={clearNotifications}
                className="h-7 w-7"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )
          }
        </div >

        <ScrollArea className="h-[400px]">
          {activeTab === 'notifications' ? (
            notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">
                              {formatRelativeTime(notification.timestamp)}
                            </span>
                            {notification.orderNumber && (
                              <Badge variant="outline" className="text-xs h-5 px-1.5">
                                #{notification.orderNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {inactiveAgents.length === 0 && inactiveSellers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No inactive users found
                  </p>
                </div>
              ) : (
                <>
                  {inactiveAgents.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Agents
                    </div>
                  )}
                  {inactiveAgents.map((agent) => (
                    <div key={`agent-${agent.id}`} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{agent.name}</h4>
                        <p className="text-xs text-slate-500">Agent - {agent.email}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleActivate(agent.id.toString(), 'agent')}>
                        Activate
                      </Button>
                    </div>
                  ))}

                  {inactiveSellers.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Sellers
                    </div>
                  )}
                  {inactiveSellers.map((seller) => (
                    <div key={`seller-${seller.id}`} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{seller.name}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id={`vip-${seller.id}`}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={vipStates[seller.id] || false}
                            onChange={(e) => handleVipChange(seller.id.toString(), e.target.checked)}
                          />
                          <label htmlFor={`vip-${seller.id}`} className="text-xs text-slate-600 cursor-pointer select-none">VIP</label>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleActivate(seller.id.toString(), 'seller')}>
                          Activate
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {
          activeTab === 'notifications' && notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3 text-center">

              </div>
            </>
          )
        }
      </PopoverContent >
    </Popover >
  );
}
