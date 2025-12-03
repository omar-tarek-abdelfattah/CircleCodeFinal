import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  delay?: number;
  gradient?: string;
  badge?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  delay = 0,
  gradient = 'from-blue-500 to-purple-600',
  badge,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {badge && (
          <div className="absolute top-0 left-0 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-bold rounded-br-lg z-10 uppercase tracking-wider">
            {badge}
          </div>
        )}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl`} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {title}
              </p>
              <motion.p
                className="text-3xl"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
              >
                {value}
              </motion.p>
              {trend && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.2 }}
                  className={`text-sm flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  <span>{trend.positive ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </motion.div>
              )}
            </div>
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
