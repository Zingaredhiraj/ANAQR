'use client';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-600',
  description,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            'p-2.5 rounded-lg bg-blue-50',
            iconColor === 'text-teal-600'
              ? 'bg-teal-50'
              : iconColor === 'text-purple-600'
              ? 'bg-purple-50'
              : 'bg-blue-50'
          )}
        >
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {change && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              changeType === 'positive'
                ? 'bg-green-100 text-green-700'
                : changeType === 'negative'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </motion.div>
  );
}
