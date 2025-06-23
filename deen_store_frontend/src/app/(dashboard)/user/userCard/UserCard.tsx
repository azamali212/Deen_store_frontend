'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { UserStats } from '@/types/ui';
import { User, UserCheck, UserX, UserSquare2Icon } from 'lucide-react';
import CountUp from 'react-countup';
import { UserGroupIcon } from '@heroicons/react/24/solid';

const UserCard = ({ stats }: { stats: UserStats }) => {
  const controls = useAnimation();

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UserGroupIcon className="w-5 h-5" />,
      variant: 'total',
      progress: 100,
      color: '#6366F1',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <UserCheck className="w-5 h-5" />,
      variant: 'active',
      progress: stats.totalUsers > 0 
        ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
        : 0,
      color: '#10B981',
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: <UserX className="w-5 h-5" />,
      variant: 'inactive',
      progress: stats.totalUsers > 0 
        ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) 
        : 0,
      color: '#EF4444',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: <UserSquare2Icon className="w-5 h-5" />,
      variant: 'admin',
      progress: stats.totalUsers > 0 
        ? Math.round((stats.adminUsers / stats.totalUsers) * 100) 
        : 0,
      color: '#3B82F6',
    },
    {
      title: 'Customer Users',
      value: stats.customerUsers,
      icon: <User className="w-5 h-5" />,
      variant: 'customer',
      progress: stats.totalUsers > 0 
        ? Math.round((stats.customerUsers / stats.totalUsers) * 100) 
        : 0,
      color: '#8B5CF6',
    },
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'total':
        return {
          text: 'text-indigo-800',
          iconBg: 'bg-indigo-100',
        };
      case 'active':
        return {
          text: 'text-green-800',
          iconBg: 'bg-green-100',
        };
      case 'inactive':
        return {
          text: 'text-red-800',
          iconBg: 'bg-red-100',
        };
      case 'admin':
        return {
          text: 'text-blue-800',
          iconBg: 'bg-blue-100',
        };
      case 'customer':
        return {
          text: 'text-purple-800',
          iconBg: 'bg-purple-100',
        };
      default:
        return {
          text: 'text-gray-800',
          iconBg: 'bg-gray-100',
        };
    }
  };

  useEffect(() => {
    controls.start('visible');
  }, [controls]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const styles = getVariantStyles(card.variant);
        
        return (
          <motion.div
            key={index}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: index * 0.1,
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 100,
                },
              },
            }}
            className="h-full flex flex-col rounded-lg bg-[rgb(var(--dashboard--background))] shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden relative"
          >
            {/* Colored top bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: card.color }}
            ></div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`p-2 rounded-lg ${styles.iconBg} ${styles.text}`}
                      style={{ color: card.color }}
                    >
                      {card.icon}
                    </div>
                    <h3 className={`font-medium ${styles.text}`}>{card.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.variant} users</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Count</p>
                  <motion.p 
                    className="font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <CountUp end={card.value} duration={2} separator="," />
                  </motion.p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{card.progress}%</span>
                  <span className="text-xs text-gray-500">of total</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: card.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1.5 }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  USER STATS
                </h4>
                <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
              </div>

              
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserCard;