export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'system' 
  | 'update' 
  | 'mention';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sender?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  category?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  type: NotificationType | 'all';
  priority: NotificationPriority | 'all';
  read: boolean | 'all';
  category: string | 'all';
}