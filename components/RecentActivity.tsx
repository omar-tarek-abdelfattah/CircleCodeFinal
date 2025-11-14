import React from 'react';
import { motion } from 'motion/react';
import {
  Package,
  TrendingUp,
  UserPlus,
  CheckCircle,
  DollarSign,
  CreditCard,
  Clock,
} from 'lucide-react';
import { Activity } from '../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
}

export function RecentActivity({ activities, maxItems = 7 }: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      shipment_created: Package,
      shipment_updated: TrendingUp,
      status_changed: CheckCircle,
      agent_assigned: UserPlus,
      payment_received: DollarSign,
      withdrawal_completed: CreditCard,
    };
    return icons[type] || Clock;
  };

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      shipment_created: 'from-blue-500 to-blue-600',
      shipment_updated: 'from-purple-500 to-purple-600',
      status_changed: 'from-green-500 to-green-600',
      agent_assigned: 'from-orange-500 to-orange-600',
      payment_received: 'from-yellow-500 to-yellow-600',
      withdrawal_completed: 'from-pink-500 to-pink-600',
    };
    return colors[type] || 'from-slate-500 to-slate-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 7 days of system activities</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const gradient = getActivityColor(activity.type);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <motion.div
                    className={`p-2 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-slate-500 mt-1">
                        by {activity.user}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}