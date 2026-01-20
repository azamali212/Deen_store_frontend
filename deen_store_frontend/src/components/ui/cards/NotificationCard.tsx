'use client';

import React from 'react';
import { 
  BellRing, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

import { Notification, NotificationPriority } from '@/types/notification';
import { useTheme } from '@/hooks/theme/useTheme';

interface NotificationCardProps {
  type: 'summary' | 'statistics' | 'alert' | 'updates';
  title: string;
  description?: string;
  notifications?: Notification[];
  stats?: {
    total: number;
    unread: number;
    highPriority: number;
    today: number;
  };
  onClick?: () => void;
  className?: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  description,
  notifications = [],
  stats,
  onClick,
  className = '',
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'summary':
        return <BellRing className="h-6 w-6" style={{ color: colors.primary.main }} />;
      case 'statistics':
        return <TrendingUp className="h-6 w-6" style={{ color: colors.accent }} />;
      case 'alert':
        return <AlertTriangle className="h-6 w-6" style={{ color: colors.common.yellow[500] }} />;
      case 'updates':
        return <Zap className="h-6 w-6" style={{ color: colors.common.blue[500] }} />;
      default:
        return <BellRing className="h-6 w-6" style={{ color: colors.text.primary }} />;
    }
  };

  const getPriorityCount = (priority: NotificationPriority) => {
    return notifications.filter(n => n.priority === priority && !n.read).length;
  };

  return (
    <div
      className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="p-3 rounded-lg"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
          >
            {getIcon()}
          </div>
          <div>
            <h3
              className="font-bold text-lg"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h3>
            {description && (
              <p
                className="text-sm mt-1"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: colors.background }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: colors.text.secondary }}>Total</span>
              <span
                className="font-bold text-lg"
                style={{ color: colors.text.primary }}
              >
                {stats.total}
              </span>
            </div>
          </div>
          
          <div
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: colors.primary.main + '10',
              border: `1px solid ${colors.primary.main + '30'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BellRing className="h-4 w-4 mr-2" style={{ color: colors.primary.main }} />
                <span style={{ color: colors.primary.main }}>Unread</span>
              </div>
              <span
                className="font-bold text-lg"
                style={{ color: colors.primary.main }}
              >
                {stats.unread}
              </span>
            </div>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: colors.error + '10',
              border: `1px solid ${colors.error + '30'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" style={{ color: colors.error }} />
                <span style={{ color: colors.error }}>High Priority</span>
              </div>
              <span
                className="font-bold text-lg"
                style={{ color: colors.error }}
              >
                {stats.highPriority}
              </span>
            </div>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: colors.accent + '10',
              border: `1px solid ${colors.accent + '30'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" style={{ color: colors.accent }} />
                <span style={{ color: colors.accent }}>Today</span>
              </div>
              <span
                className="font-bold text-lg"
                style={{ color: colors.accent }}
              >
                {stats.today}
              </span>
            </div>
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Priority Breakdown
            </span>
          </div>
          <div className="flex space-x-2">
            {(['urgent', 'high', 'medium', 'low'] as NotificationPriority[]).map((priority) => {
              const count = getPriorityCount(priority);
              const total = notifications.filter(n => n.priority === priority).length;
              
              if (total === 0) return null;

              const getPriorityColor = (priority: NotificationPriority) => {
                switch (priority) {
                  case 'urgent': return colors.error;
                  case 'high': return colors.common.red[500];
                  case 'medium': return colors.common.yellow[500];
                  case 'low': return colors.common.blue[500];
                  default: return colors.text.secondary;
                }
              };

              return (
                <div
                  key={priority}
                  className="flex-1 text-center p-2 rounded"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div
                    className="text-xs font-medium uppercase mb-1"
                    style={{ color: getPriorityColor(priority) }}
                  >
                    {priority}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span
                      className="font-bold"
                      style={{ color: colors.text.primary }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: colors.text.tertiary }}
                    >
                      /{total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: colors.text.secondary }}
            >
              Latest Activity
            </span>
            <span
              className="text-xs"
              style={{ color: colors.text.tertiary }}
            >
              {notifications.length} items
            </span>
          </div>
          <div className="mt-2 space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-2 rounded hover:bg-opacity-50"
                style={{ 
                  backgroundColor: !notification.read ? colors.primary.main + '08' : 'transparent',
                }}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getPriorityCount(notification.priority) > 0 ? colors.error : colors.text.tertiary }}
                  />
                  <span
                    className="text-sm truncate flex-1"
                    style={{ color: colors.text.secondary }}
                  >
                    {notification.title}
                  </span>
                </div>
                <span
                  className="text-xs whitespace-nowrap ml-2"
                  style={{ color: colors.text.tertiary }}
                >
                  {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;