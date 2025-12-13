import { useTranslation } from "react-i18next";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { LogResponse } from '@/types';

interface RecentActivityProps {
  activities: LogResponse[];
  maxItems?: number;
}

export function RecentActivity({ activities, maxItems = 7 }: RecentActivityProps) {
      const { t } = useTranslation();
  // Filter last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


  const recentActivities = activities
    .filter(act => new Date(act.actionTIme) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.actionTIme).getTime() - new Date(a.actionTIme).getTime())
    .slice(0, maxItems);

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return '';

    let activityDate = new Date(timestamp);
    const now = new Date();


    // Fix for server sending PST time (UTC-8) without timezone offset
    // If the timestamp doesn't end with Z and doesn't have an offset, assume it's UTC-8
    if (!timestamp.includes('Z') && !timestamp.match(/[+-]\d{2}:?\d{2}$/)) {
      // Check if the date is valid before modifying
      if (!isNaN(activityDate.getTime())) {
        // Create a new date string with the offset
        // We need to be careful with the format. 
        // If it's ISO-like "YYYY-MM-DDTHH:mm:ss", we can just append "-08:00"
        // If it has spaces "YYYY-MM-DD HH:mm:ss", we might need to replace space with T or handle it.
        // But Date parsing usually handles T or space.
        // Let's try to construct it safely.
        const isoLike = timestamp.replace(' ', 'T');
        activityDate = new Date(`${isoLike}-08:00`);
      }
    }

    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    // Handle cases where diff is very small or negative (due to slight clock skew)
    if (diffInMinutes <= 0) return 'Just now';

    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (action: string) => {
    const icons: Record<string, any> = {
      shipment_created: Package,
      shipment_updated: TrendingUp,
      status_changed: CheckCircle,
      agent_assigned: UserPlus,
      payment_received: DollarSign,
      withdrawal_completed: CreditCard,
      update: TrendingUp,
      create: Package,
      delete: CheckCircle,
    };
    return icons[action.toLowerCase()] || Clock;
  };

  const getActivityColor = (action: string) => {
    const colors: Record<string, string> = {
      shipment_created: 'from-blue-500 to-blue-600',
      shipment_updated: 'from-purple-500 to-purple-600',
      status_changed: 'from-green-500 to-green-600',
      agent_assigned: 'from-orange-500 to-orange-600',
      payment_received: 'from-yellow-500 to-yellow-600',
      withdrawal_completed: 'from-pink-500 to-pink-600',
      update: 'from-purple-500 to-purple-600',
      create: 'from-blue-500 to-blue-600',
      delete: 'from-red-500 to-red-600',
    };
    return colors[action.toLowerCase()] || 'from-slate-500 to-slate-600';
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("Recent Activity")}
          </CardTitle>
          <CardDescription>{t("Last 7 actions on the system")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.action as string);
              const gradient = getActivityColor(activity.action as string);

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
                    <p className="font-medium">
                      {activity.tableName} (ID: {activity.id})
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activity.description}
                    </p>
                    {activity.userName && (
                      <p className="text-xs text-slate-500 mt-1">by {activity.userName}</p>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex-shrink-0">
                    {formatTimeAgo(activity.actionTIme)}
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

