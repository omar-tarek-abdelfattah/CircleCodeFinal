import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Notification, NotificationType, ShipmentStatus } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { notificationsAPI } from '../services/api';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  newOrdersCount: number; // Count of "new" status orders that haven't been actioned
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  notifyOrderCreated: (orderId: string, orderNumber: string, sellerName: string, sellerId?: string) => void;
  notifyOrderAssigned: (orderId: string, orderNumber: string, agentName: string, agentId?: string) => void;
  notifyStatusChanged: (
    orderId: string,
    orderNumber: string,
    oldStatus: ShipmentStatus,
    newStatus: ShipmentStatus,
    changedBy: string,
    changedById?: string,
    sellerId?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const { user } = useAuth();

  // Load notifications and new orders count on mount and user change
  useEffect(() => {
    if (user) {
      loadNotifications();
      if (user.role === 'admin') {
        loadNewOrdersCount();
      }
    }
  }, [user]);

  // Load notifications from backend
  const loadNotifications = async () => {
    try {
      // TODO: Uncomment when backend is ready
      // const notifications = await notificationsAPI.getAll();
      // setNotifications(notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Load new orders count from backend (admin only)
  const loadNewOrdersCount = async () => {
    try {
      const count = await notificationsAPI.getNewOrdersCount();
      setNewOrdersCount(count);
    } catch (error) {
      console.error('Failed to load new orders count:', error);
    }
  };

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Show toast based on user role
      if (user) {
        switch (notification.type) {
          case 'order_created':
            if (user.role === 'admin') {
              toast.info(notification.title, {
                description: notification.message,
              });
            }
            break;
          case 'order_assigned':
            if (user.role === 'agent') {
              toast.info(notification.title, {
                description: notification.message,
              });
            }
            break;
          case 'status_changed':
            if (user.role === 'seller' || user.role === 'admin') {
              toast.info(notification.title, {
                description: notification.message,
              });
            }
            break;
        }
      }
    },
    [user]
  );

  const notifyOrderCreated = useCallback(
    async (orderId: string, orderNumber: string, sellerName: string, sellerId?: string) => {
      // Backend API call - Create notification for admins
      try {
        await notificationsAPI.notifyOrderCreated({
          orderId,
          orderNumber,
          sellerName,
          sellerId: sellerId || 'unknown',
        });
        
        // Refresh new orders count for admin
        if (user?.role === 'admin') {
          loadNewOrdersCount();
        }
      } catch (error) {
        console.error('Failed to send order created notification:', error);
      }
      
      // For admins - Add to local notifications
      if (user?.role === 'admin') {
        addNotification({
          type: 'order_created',
          title: 'New Order Created',
          message: `New order ${orderNumber} created by ${sellerName}`,
          orderId,
          orderNumber,
        });
        
        // Increment new orders count
        setNewOrdersCount((prev) => prev + 1);
      }
    },
    [addNotification, user]
  );

  const notifyOrderAssigned = useCallback(
    async (orderId: string, orderNumber: string, agentName: string, agentId?: string) => {
      // Backend API call - Create notification for the assigned agent
      try {
        await notificationsAPI.notifyOrderAssigned({
          orderId,
          orderNumber,
          agentId: agentId || 'unknown',
          agentName,
        });
      } catch (error) {
        console.error('Failed to send order assigned notification:', error);
      }
      
      // For agents - Add to local notifications if current user is the assigned agent
      if (user?.role === 'agent' && (agentId === user.id || !agentId)) {
        addNotification({
          type: 'order_assigned',
          title: 'New Order Assigned',
          message: `You have been assigned order ${orderNumber}`,
          orderId,
          orderNumber,
        });
      }
    },
    [addNotification, user]
  );

  const notifyStatusChanged = useCallback(
    async (
      orderId: string,
      orderNumber: string,
      oldStatus: ShipmentStatus,
      newStatus: ShipmentStatus,
      changedBy: string,
      changedById?: string,
      sellerId?: string
    ) => {
      // Backend API call - Create notifications for admin and seller
      try {
        await notificationsAPI.notifyStatusChanged({
          orderId,
          orderNumber,
          oldStatus,
          newStatus,
          changedBy,
          changedById: changedById || 'unknown',
          sellerId,
        });
        
        // Refresh new orders count for admin if status changed from "new"
        if (user?.role === 'admin' && oldStatus === 'new') {
          loadNewOrdersCount();
        }
      } catch (error) {
        console.error('Failed to send status changed notification:', error);
      }
      
      const formatStatus = (status: ShipmentStatus) => 
        status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const message = `Order ${orderNumber} status changed from "${formatStatus(
        oldStatus
      )}" to "${formatStatus(newStatus)}" by ${changedBy}`;

      // For sellers and admins - Add to local notifications
      if (user?.role === 'seller' || user?.role === 'admin') {
        addNotification({
          type: 'status_changed',
          title: 'Order Status Changed',
          message,
          orderId,
          orderNumber,
          oldStatus,
          newStatus,
          changedBy,
        });
      }

      // If order status changed from "new", decrement the new orders count (for admin)
      if (oldStatus === 'new' && user?.role === 'admin') {
        setNewOrdersCount((prev) => Math.max(0, prev - 1));
      }
    },
    [addNotification, user]
  );

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    
    // Backend API call
    try {
      await notificationsAPI.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    
    // Backend API call
    try {
      await notificationsAPI.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    
    // Backend API call
    try {
      await notificationsAPI.clearAll();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        newOrdersCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        notifyOrderCreated,
        notifyOrderAssigned,
        notifyStatusChanged,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
