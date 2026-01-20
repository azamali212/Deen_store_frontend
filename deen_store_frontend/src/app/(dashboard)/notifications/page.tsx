'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Bell, RefreshCw, Grid3x3, List, Search, Trash2, 
  Check, Package, DollarSign, MessageSquare, Clock, ArrowRight, 
  CheckCheck, Archive, TrendingUp, Inbox, ShieldAlert, Zap, 
  MoreHorizontal, ExternalLink, Activity, Sparkles, Layers,
  ChevronRight, Filter, Download, Info, Settings, Maximize2,
  PanelLeftClose, PanelLeftOpen, X, Home, Users, BarChart,
  FileText, Database, Cloud, Server, AlertTriangle, Key,
  Mail, MailOpen, Star, StarOff, Eye, EyeOff, Volume2, VolumeX,
  Calendar, User, Tag, FileWarning, Shield, Cpu, HardDrive,
  Wifi, WifiOff, Battery, BatteryCharging, Lock, Unlock,
  AlertCircle, CheckCircle, XCircle, HelpCircle, Timer,
  BellRing, BellOff, Settings as SettingsIcon, Filter as FilterIcon,
  ShieldCheckIcon
} from 'lucide-react';

// --- Types ---
type Priority = 'critical' | 'urgent' | 'high' | 'medium' | 'low' | 'info';
type NotificationStatus = 'unread' | 'read' | 'archived' | 'starred';
type NotificationType = 'alert' | 'warning' | 'info' | 'success' | 'error' | 'system';

interface Notification {
  id: string;
  title: string;
  message: string;
  description?: string;
  priority: Priority;
  type: NotificationType;
  status: NotificationStatus;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  category: string;
  actionLabel: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'primary' | 'secondary' | 'danger';
  }>;
  source: string;
  tags: string[];
  expiry?: Date;
  silent: boolean;
  metadata?: Record<string, any>;
}

interface NotificationPreferences {
  desktopNotifications: boolean;
  soundEnabled: boolean;
  vibrate: boolean;
  autoClear: boolean;
  autoClearTime: number;
  categories: Record<string, boolean>;
  priorityFilter: Record<Priority, boolean>;
}

// Categories with proper initialization
const CATEGORIES = [
  { id: 'all', label: 'All Notifications', icon: Bell, color: 'text-indigo-600', count: 0 },
  { id: 'unread', label: 'Unread', icon: Mail, color: 'text-blue-600', count: 0 },
  { id: 'starred', label: 'Starred', icon: Star, color: 'text-amber-600', count: 0 },
  { id: 'alerts', label: 'Alerts', icon: AlertCircle, color: 'text-red-600', count: 0 },
  { id: 'security', label: 'Security', icon: Shield, color: 'text-purple-600', count: 0 },
  { id: 'system', label: 'System Role', icon: ShieldCheckIcon, color: 'text-slate-600', count: 0 },
  { id: 'network', label: 'Network', icon: Wifi, color: 'text-emerald-600', count: 0 },
  { id: 'storage', label: 'Storage', icon: HardDrive, color: 'text-orange-600', count: 0 },
  { id: 'user', label: 'User Activity', icon: User, color: 'text-cyan-600', count: 0 },
  { id: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'text-pink-600', count: 0 },
];

//Congratulations Configuration Object Pattern (in Industry name, and Data Driven UI) Hum ny es simple way saydata manage kr liya agr yahi hum other way say krty tu hmy zada code krna prta if esl use kran prta agr hum simple varibale say krty tu phr hum multiple object bnany prny they by Chatgpt 
const PRIORITIES: Array<{ id: Priority; label: string; color: string; icon: any }> = [
  { id: 'critical', label: 'Critical', color: 'text-red-700 bg-red-50', icon: AlertCircle },
  { id: 'urgent', label: 'Urgent', color: 'text-orange-700 bg-orange-50', icon: AlertTriangle },
  { id: 'high', label: 'High', color: 'text-amber-700 bg-amber-50', icon: ShieldAlert },
  { id: 'medium', label: 'Medium', color: 'text-blue-700 bg-blue-50', icon: Info },
  { id: 'low', label: 'Low', color: 'text-emerald-700 bg-emerald-50', icon: CheckCircle },
  { id: 'info', label: 'Info', color: 'text-slate-700 bg-slate-50', icon: HelpCircle },
];

//Enddddddddd////////////////////////////
// Enhanced mock notifications with more data
const generateMockNotifications = (): Notification[] => {
  const now = new Date();
  return [
    {
      id: '1',
      title: 'Critical Security Alert',
      message: 'Unauthorized access attempt detected from unknown IP address',
      description: 'Multiple failed login attempts from IP 192.168.1.100. Immediate action required.',
      priority: 'critical',
      type: 'alert',
      status: 'unread',
      timestamp: new Date(now.getTime() - 300000),
      read: false,
      starred: false,
      category: 'Security',
      actionLabel: 'Investigate Now',
      source: 'Security System',
      tags: ['security', 'critical', 'intrusion', 'urgent'],
      silent: false,
      metadata: {
        ip: '192.168.1.100',
        attempts: 5,
        location: 'Unknown'
      }
    },
    {
      id: '2',
      title: 'System Update Available',
      message: 'New system update v2.5.0 is ready for installation',
      description: 'Update includes security patches and performance improvements. Recommended installation window: 2 AM - 4 AM.',
      priority: 'medium',
      type: 'info',
      status: 'unread',
      timestamp: new Date(now.getTime() - 600000),
      read: false,
      starred: true,
      category: 'System',
      actionLabel: 'Update Now',
      source: 'System Updater',
      tags: ['update', 'system', 'maintenance', 'patch'],
      silent: true
    },
    {
      id: '3',
      title: 'Backup Completed Successfully',
      message: 'Daily backup completed without errors',
      description: 'All critical data has been backed up to secure storage. Backup size: 2.5GB, Duration: 15 minutes.',
      priority: 'low',
      type: 'success',
      status: 'read',
      timestamp: new Date(now.getTime() - 1800000),
      read: true,
      starred: false,
      category: 'Storage',
      actionLabel: 'Verify Backup',
      source: 'Backup Service',
      tags: ['backup', 'storage', 'success', 'daily'],
      silent: true
    },
    {
      id: '4',
      title: 'High CPU Usage Detected',
      message: 'CPU usage is consistently above 90% on server-01',
      description: 'Consider scaling up or optimizing running processes. Current load: 94%, Threshold: 85%.',
      priority: 'high',
      type: 'warning',
      status: 'unread',
      timestamp: new Date(now.getTime() - 2400000),
      read: false,
      starred: false,
      category: 'System',
      actionLabel: 'Monitor',
      source: 'Performance Monitor',
      tags: ['cpu', 'performance', 'warning', 'server-01'],
      silent: false
    },
    {
      id: '5',
      title: 'New User Registered',
      message: 'User "john.doe@example.com" has registered successfully',
      description: 'Account created via self-registration portal. Role: Standard User, Department: Engineering.',
      priority: 'info',
      type: 'info',
      status: 'read',
      timestamp: new Date(now.getTime() - 3600000),
      read: true,
      starred: false,
      category: 'User',
      actionLabel: 'Review User',
      source: 'User Management',
      tags: ['user', 'registration', 'account', 'new'],
      silent: true
    },
    {
      id: '6',
      title: 'Network Latency Detected',
      message: 'Increased latency detected in East region network',
      description: 'Average response time increased by 200ms. Affected servers: 3, Peak latency: 450ms.',
      priority: 'medium',
      type: 'warning',
      status: 'unread',
      timestamp: new Date(now.getTime() - 7200000),
      read: false,
      starred: true,
      category: 'Network',
      actionLabel: 'Diagnose',
      source: 'Network Monitor',
      tags: ['network', 'latency', 'performance', 'east-region'],
      silent: false
    },
    {
      id: '7',
      title: 'Database Connection Issue',
      message: 'Intermittent database connection failures detected',
      description: 'Primary database cluster experiencing connection drops. Failover to secondary cluster activated.',
      priority: 'urgent',
      type: 'error',
      status: 'unread',
      timestamp: new Date(now.getTime() - 900000),
      read: false,
      starred: false,
      category: 'System',
      actionLabel: 'Troubleshoot',
      source: 'Database Monitor',
      tags: ['database', 'connection', 'error', 'cluster'],
      silent: false
    },
    {
      id: '8',
      title: 'Scheduled Maintenance Tonight',
      message: 'Planned maintenance window scheduled for 2 AM - 4 AM',
      description: 'System will be unavailable during maintenance. Estimated downtime: 2 hours.',
      priority: 'medium',
      type: 'info',
      status: 'read',
      timestamp: new Date(now.getTime() - 14400000),
      read: true,
      starred: true,
      category: 'Scheduled',
      actionLabel: 'View Details',
      source: 'Operations',
      tags: ['maintenance', 'scheduled', 'downtime', 'planned'],
      silent: true
    },
    {
      id: '9',
      title: 'Storage Threshold Exceeded',
      message: 'Storage usage has reached 85% capacity',
      description: 'Primary storage volume at 85% usage. Consider cleanup or expansion.',
      priority: 'high',
      type: 'warning',
      status: 'unread',
      timestamp: new Date(now.getTime() - 10800000),
      read: false,
      starred: false,
      category: 'Storage',
      actionLabel: 'Manage Storage',
      source: 'Storage Manager',
      tags: ['storage', 'capacity', 'warning', 'threshold'],
      silent: false
    }
  ];
};

const NotificationsSystem: React.FC = () => {
  // Main states
  const [notifications, setNotifications] = useState<Notification[]>(() => generateMockNotifications());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    desktopNotifications: true,
    soundEnabled: true,
    vibrate: false,
    autoClear: false,
    autoClearTime: 60,
    categories: CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {}),
    priorityFilter: PRIORITIES.reduce((acc, pri) => ({ ...acc, [pri.id]: true }), {} as Record<Priority, boolean>)
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Refs
  const notificationEndRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const starred = notifications.filter(n => n.starred).length;
    const critical = notifications.filter(n => n.priority === 'critical').length;
    const today = notifications.filter(n => 
      new Date(n.timestamp).toDateString() === new Date().toDateString()
    ).length;

    return { total, unread, starred, critical, today };
  }, [notifications]);

  // Update category counts
  const updatedCategories = useMemo(() => {
    return CATEGORIES.map(cat => {
      let count = 0;
      switch (cat.id) {
        case 'all':
          count = notifications.length;
          break;
        case 'unread':
          count = notifications.filter(n => !n.read).length;
          break;
        case 'starred':
          count = notifications.filter(n => n.starred).length;
          break;
        case 'alerts':
          count = notifications.filter(n => n.type === 'alert' || n.type === 'warning' || n.type === 'error').length;
          break;
        case 'security':
          count = notifications.filter(n => n.category.toLowerCase().includes('security')).length;
          break;
        case 'system':
          count = notifications.filter(n => n.category.toLowerCase().includes('system')).length;
          break;
        case 'network':
          count = notifications.filter(n => n.category.toLowerCase().includes('network')).length;
          break;
        case 'storage':
          count = notifications.filter(n => n.category.toLowerCase().includes('storage')).length;
          break;
        case 'user':
          count = notifications.filter(n => n.category.toLowerCase().includes('user')).length;
          break;
        case 'scheduled':
          count = notifications.filter(n => n.category.toLowerCase().includes('scheduled')).length;
          break;
      }
      return { ...cat, count };
    });
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => {
        switch (selectedCategory) {
          case 'unread': return !n.read;
          case 'starred': return n.starred;
          case 'alerts': return ['alert', 'warning', 'error'].includes(n.type);
          case 'security': return n.category.toLowerCase().includes('security');
          case 'system': return n.category.toLowerCase().includes('system');
          case 'network': return n.category.toLowerCase().includes('network');
          case 'storage': return n.category.toLowerCase().includes('storage');
          case 'user': return n.category.toLowerCase().includes('user');
          case 'scheduled': return n.category.toLowerCase().includes('scheduled');
          default: return true;
        }
      });
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        n.description?.toLowerCase().includes(searchLower) ||
        n.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        n.source.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filterDateRange.from) {
      filtered = filtered.filter(n => new Date(n.timestamp) >= filterDateRange.from!);
    }
    if (filterDateRange.to) {
      filtered = filtered.filter(n => new Date(n.timestamp) <= filterDateRange.to!);
    }

    // User preference filters
    filtered = filtered.filter(n => 
      preferences.categories[n.category.toLowerCase()] !== false &&
      preferences.priorityFilter[n.priority]
    );

    return filtered;
  }, [notifications, selectedCategory, selectedPriority, searchQuery, filterDateRange, preferences]);

  // Auto-clear old notifications
  useEffect(() => {
    if (!preferences.autoClear) return;

    const interval = setInterval(() => {
      const now = new Date();
      const threshold = new Date(now.getTime() - preferences.autoClearTime * 60000);
      
      setNotifications(prev => prev.filter(n => {
        if (n.starred) return true;
        if (n.priority === 'critical' || n.priority === 'urgent') return true;
        return new Date(n.timestamp) > threshold;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, [preferences.autoClear, preferences.autoClearTime]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && preferences.desktopNotifications) {
      Notification.requestPermission();
    }
  }, [preferences.desktopNotifications]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    if (activeNotification?.id === id) {
      setActiveNotification(prev => prev ? { ...prev, read: true } : null);
    }
  }, [activeNotification]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (activeNotification) {
      setActiveNotification({ ...activeNotification, read: true });
    }
  }, [activeNotification]);

  // Toggle star
  const toggleStar = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, starred: !n.starred } : n
    ));
    if (activeNotification?.id === id) {
      setActiveNotification(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  }, [activeNotification]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (activeNotification?.id === id) {
      setActiveNotification(null);
    }
  }, [activeNotification]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      setActiveNotification(null);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      const newNotifications: Notification[] = [
        {
          id: Date.now().toString(),
          title: 'System Health Check',
          message: 'All systems operating within normal parameters',
          description: 'Routine system health check completed successfully. All services running normally.',
          priority: 'info',
          type: 'success',
          status: 'unread',
          timestamp: new Date(),
          read: false,
          starred: false,
          category: 'System',
          actionLabel: 'View Report',
          source: 'System Monitor',
          tags: ['health', 'system', 'check', 'normal'],
          silent: true
        },
        {
          id: (Date.now() + 1).toString(),
          title: 'Security Scan Completed',
          message: 'No vulnerabilities detected in latest scan',
          description: 'Full security scan completed. 0 vulnerabilities found, 15 items scanned.',
          priority: 'low',
          type: 'success',
          status: 'unread',
          timestamp: new Date(),
          read: false,
          starred: false,
          category: 'Security',
          actionLabel: 'Review',
          source: 'Security Scanner',
          tags: ['security', 'scan', 'clean', 'vulnerability'],
          silent: true
        }
      ];

      setNotifications(prev => [...newNotifications, ...prev]);
      setIsRefreshing(false);
    }, 1000);
  }, []);

  // Test notification
  const handleTestNotification = useCallback(() => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Test Notification',
      message: 'This is a test notification sent from the system',
      description: 'Test notification generated at ' + new Date().toLocaleTimeString() + '. This is for testing purposes only.',
      priority: 'medium',
      type: 'info',
      status: 'unread',
      timestamp: new Date(),
      read: false,
      starred: false,
      category: 'System',
      actionLabel: 'Acknowledge',
      source: 'Test Suite',
      tags: ['test', 'system', 'demo'],
      silent: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show browser notification if permission granted
    if (preferences.desktopNotifications && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/notification-icon.png'
      });
    }
  }, [preferences.desktopNotifications]);

  // Bulk actions
  const bulkAction = useCallback((action: 'read' | 'unread' | 'star' | 'unstar' | 'delete') => {
    setNotifications(prev => {
      switch (action) {
        case 'read':
          return prev.map(n => ({ ...n, read: true }));
        case 'unread':
          return prev.map(n => ({ ...n, read: false }));
        case 'star':
          return prev.map(n => ({ ...n, starred: true }));
        case 'unstar':
          return prev.map(n => ({ ...n, starred: false }));
        case 'delete':
          if (window.confirm('Delete all notifications?')) {
            return [];
          }
          return prev;
        default:
          return prev;
      }
    });
  }, []);

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    const olderNotifications = generateMockNotifications().map((n, i) => ({
      ...n,
      id: `old-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - (i + 10) * 3600000),
      read: true,
      starred: Math.random() > 0.7
    }));
    setNotifications(prev => [...prev, ...olderNotifications]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mark as read: Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && activeNotification) {
        e.preventDefault();
        markAsRead(activeNotification.id);
      }
      // Toggle star: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeNotification) {
        e.preventDefault();
        toggleStar(activeNotification.id);
      }
      // Clear all: Ctrl/Cmd + Shift + Delete
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        clearAllNotifications();
      }
      // Toggle sidebar: Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNotification, markAsRead, toggleStar, clearAllNotifications]);

  // Get priority style
  const getPriorityStyle = useCallback((priority: Priority) => {
    switch (priority) {
      case 'critical':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-600', 
          color: 'bg-red-100 text-red-700',
          icon: AlertCircle
        };
      case 'urgent':
        return { 
          bg: 'bg-orange-50', 
          text: 'text-orange-600', 
          color: 'bg-orange-100 text-orange-700',
          icon: AlertTriangle
        };
      case 'high':
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-600', 
          color: 'bg-amber-100 text-amber-700',
          icon: ShieldAlert
        };
      case 'medium':
        return { 
          bg: 'bg-blue-50', 
          text: 'text-blue-600', 
          color: 'bg-blue-100 text-blue-700',
          icon: Info
        };
      case 'low':
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-600', 
          color: 'bg-emerald-100 text-emerald-700',
          icon: CheckCircle
        };
      case 'info':
      default:
        return { 
          bg: 'bg-slate-50', 
          text: 'text-slate-600', 
          color: 'bg-slate-100 text-slate-700',
          icon: HelpCircle
        };
    }
  }, []);

  // Format time
  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  // Mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  // Calculate available width for header
  const [headerWidth, setHeaderWidth] = useState(0);
  
  useEffect(() => {
    const updateHeaderWidth = () => {
      if (headerRef.current) {
        setHeaderWidth(headerRef.current.offsetWidth);
      }
    };

    updateHeaderWidth();
    window.addEventListener('resize', updateHeaderWidth);
    
    return () => window.removeEventListener('resize', updateHeaderWidth);
  }, []);

  // Determine if we should show compact header
  const shouldShowCompactHeader = useMemo(() => {
    return headerWidth < 1024 || (activeNotification && headerWidth < 1280);
  }, [headerWidth, activeNotification]);

  return (
    <div className="flex h-screen bg-[rgb(var(--background))] text-slate-900 overflow-hidden font-sans">
      
      {/* Left Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bell className="text-white w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-bold">NotifyHub</h1>
                <p className="text-xs text-slate-500">v2.0.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="text-lg font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-600 font-medium">Critical</p>
                <p className="text-lg font-bold text-slate-900">{stats.critical}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-xs text-emerald-600 font-medium">Unread</p>
                <p className="text-lg font-bold text-slate-900">{stats.unread}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-600 font-medium">Starred</p>
                <p className="text-lg font-bold text-slate-900">{stats.starred}</p>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4">
          {updatedCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <category.icon className={`w-4 h-4 ${category.color}`} />
              {isSidebarOpen && (
                <>
                  <span className="flex-1 text-sm font-medium text-left">{category.label}</span>
                  {category.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedCategory === category.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {category.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Settings Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setShowSettings(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 ${
              showSettings ? 'bg-slate-50' : ''
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" ref={headerRef}>
        
        {/* Header - Fixed layout that won't break */}
        <header className="bg-white border-b border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Top row: Main controls */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="flex items-center gap-3 flex-1 lg:flex-initial">
                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Menu"
                >
                  <PanelLeftOpen size={20} />
                </button>

                {/* Sidebar toggle for desktop */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hidden md:block p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                </button>
                
                {/* Search - responsive width */}
                <div className="relative flex-1 lg:flex-initial lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors md:hidden ${showFilters ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Show filters"
              >
                <FilterIcon size={20} />
              </button>
            </div>

            {/* Bottom row: Action buttons - This row adjusts based on available space */}
            <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto">
              {/* Desktop filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Show filters"
              >
                <FilterIcon size={16} />
                <span className="text-sm">Filters</span>
              </button>

              {/* Action buttons - responsive design */}
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
                {shouldShowCompactHeader ? (
                  // Compact version for smaller screens or when detail panel is open
                  <>
                    <button
                      onClick={handleTestNotification}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
                      title="Test Notification"
                    >
                      Test
                    </button>

                    <button
                      onClick={refreshNotifications}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      disabled={isRefreshing}
                      title="Refresh"
                    >
                      <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>

                    <button
                      onClick={markAllAsRead}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                      title="Mark all as read"
                    >
                      <CheckCheck size={18} />
                    </button>

                    <div className="relative flex-shrink-0">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Notifications">
                        <Bell size={18} className="text-slate-600" />
                        {stats.unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  // Full version for larger screens
                  <>
                    <button
                      onClick={handleTestNotification}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
                    >
                      Test Notification
                    </button>

                    <button
                      onClick={refreshNotifications}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                      disabled={isRefreshing}
                      title="Refresh"
                    >
                      <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                      <span className="text-sm">Refresh</span>
                    </button>

                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                      <span>Mark Read</span>
                    </button>

                    <div className="relative flex-shrink-0">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Notifications">
                        <Bell size={18} className="text-slate-600" />
                        {stats.unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="mt-3 md:hidden bg-white border border-slate-200 rounded-lg p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-2">
                {updatedCategories.slice(0, 6).map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <category.icon className={`w-4 h-4 ${category.color}`} />
                    <span className="text-sm font-medium">{category.label}</span>
                    {category.count > 0 && (
                      <span className="ml-auto text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {category.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm"
                  >
                    <option value="all">All Priorities</option>
                    {PRIORITIES.map(priority => (
                      <option key={priority.id} value={priority.id}>{priority.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">View Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      title="List view"
                    >
                      <List size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      title="Grid view"
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`p-2 rounded transition-colors ${viewMode === 'compact' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      title="Compact view"
                    >
                      <Activity size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bulk Actions</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) bulkAction(e.target.value as any);
                      e.target.value = '';
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm"
                  >
                    <option value="">Select action...</option>
                    <option value="read">Mark all as read</option>
                    <option value="unread">Mark all as unread</option>
                    <option value="star">Star all</option>
                    <option value="unstar">Unstar all</option>
                    <option value="delete">Delete all</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quick Stats</label>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{notifications.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Showing:</span>
                      <span className="font-medium">{filteredNotifications.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unread:</span>
                      <span className="font-medium">{stats.unread}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">No notifications found</h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                {searchQuery 
                  ? `No notifications match your search for "${searchQuery}"`
                  : selectedCategory !== 'all'
                  ? `No notifications in the "${CATEGORIES.find(c => c.id === selectedCategory)?.label}" category`
                  : 'All caught up! You have no notifications at the moment.'}
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriority('all');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  Send Test Notification
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              {/* View mode toggle for mobile */}
              <div className="flex justify-end mb-4 md:hidden">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                  >
                    <Grid3x3 size={16} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredNotifications.map(notification => {
                  const priorityStyle = getPriorityStyle(notification.priority);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => setActiveNotification(notification)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        notification.read ? 'bg-white' : 'bg-blue-50'
                      } ${
                        activeNotification?.id === notification.id
                          ? 'ring-2 ring-indigo-500 border-indigo-500'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Priority Icon */}
                        <div className={`p-2 rounded-lg ${priorityStyle.bg} flex-shrink-0`}>
                          {React.createElement(priorityStyle.icon, {
                            className: `w-4 h-4 ${priorityStyle.text}`
                          })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityStyle.color}`}>
                              {notification.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></span>
                            )}
                            <span className="text-xs text-slate-400 ml-auto">
                              {notification.category}
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-slate-900 truncate mb-1">{notification.title}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{notification.message}</p>
                          
                          {notification.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {notification.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {tag}
                                </span>
                              ))}
                              {notification.tags.length > 3 && (
                                <span className="text-xs text-slate-400">+{notification.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(notification.id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title={notification.starred ? "Unstar" : "Star"}
                          >
                            {notification.starred ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title={notification.read ? "Mark as unread" : "Mark as read"}
                          >
                            {notification.read ? (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-blue-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {filteredNotifications.length > 0 && filteredNotifications.length < notifications.length && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMoreNotifications}
                    className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Load More Notifications
                  </button>
                </div>
              )}

              <div ref={notificationEndRef} />
            </div>
          )}
        </main>
      </div>

      {/* Detail Panel */}
      {activeNotification && (
        <div className="hidden lg:block w-80 xl:w-96 border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Details</h2>
              <button
                onClick={() => setActiveNotification(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getPriorityStyle(activeNotification.priority).bg} flex-shrink-0`}>
                    {React.createElement(getPriorityStyle(activeNotification.priority).icon, {
                      className: `w-5 h-5 ${getPriorityStyle(activeNotification.priority).text}`
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{activeNotification.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-500">
                        {formatTime(activeNotification.timestamp)}
                      </span>
                      <span className="text-sm text-slate-400">•</span>
                      <span className="text-sm text-slate-500">{activeNotification.source}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Message</h4>
                    <p className="text-slate-700">{activeNotification.message}</p>
                  </div>
                  
                  {activeNotification.description && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
                      <p className="text-sm text-slate-600">{activeNotification.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-1">Priority</p>
                    <p className={`font-medium ${getPriorityStyle(activeNotification.priority).text}`}>
                      {activeNotification.priority.charAt(0).toUpperCase() + activeNotification.priority.slice(1)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
                    <p className="font-medium text-slate-900">{activeNotification.category}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                    <p className={`font-medium ${activeNotification.read ? 'text-slate-600' : 'text-blue-600'}`}>
                      {activeNotification.read ? 'Read' : 'Unread'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-1">Type</p>
                    <p className="font-medium text-slate-900">
                      {activeNotification.type.charAt(0).toUpperCase() + activeNotification.type.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {activeNotification.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeNotification.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => markAsRead(activeNotification.id)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {activeNotification.read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleStar(activeNotification.id)}
                    className="py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                  >
                    {activeNotification.starred ? 'Unstar' : 'Star'}
                  </button>
                  <button
                    onClick={() => deleteNotification(activeNotification.id)}
                    className="py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Detail Modal */}
      {activeNotification && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Notification Details</h2>
                <button
                  onClick={() => setActiveNotification(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getPriorityStyle(activeNotification.priority).bg} flex-shrink-0`}>
                      {React.createElement(getPriorityStyle(activeNotification.priority).icon, {
                        className: `w-5 h-5 ${getPriorityStyle(activeNotification.priority).text}`
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{activeNotification.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-slate-500">
                          {formatTime(activeNotification.timestamp)}
                        </span>
                        <span className="text-sm text-slate-400">•</span>
                        <span className="text-sm text-slate-500">{activeNotification.source}</span>
                        <span className="text-sm text-slate-400">•</span>
                        <span className="text-sm text-slate-500">{activeNotification.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Message</h4>
                      <p className="text-slate-700">{activeNotification.message}</p>
                    </div>
                    
                    {activeNotification.description && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
                        <p className="text-sm text-slate-600">{activeNotification.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium mb-1">Priority</p>
                      <p className={`font-medium ${getPriorityStyle(activeNotification.priority).text}`}>
                        {activeNotification.priority.charAt(0).toUpperCase() + activeNotification.priority.slice(1)}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
                      <p className="font-medium text-slate-900">{activeNotification.category}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                      <p className={`font-medium ${activeNotification.read ? 'text-slate-600' : 'text-blue-600'}`}>
                        {activeNotification.read ? 'Read' : 'Unread'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium mb-1">Type</p>
                      <p className="font-medium text-slate-900">
                        {activeNotification.type.charAt(0).toUpperCase() + activeNotification.type.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {activeNotification.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeNotification.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => markAsRead(activeNotification.id)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {activeNotification.read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => toggleStar(activeNotification.id)}
                      className="py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                    >
                      {activeNotification.starred ? 'Unstar' : 'Star'}
                    </button>
                    <button
                      onClick={() => deleteNotification(activeNotification.id)}
                      className="py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Notification Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* General Settings */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-4">General</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-700">Desktop Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.desktopNotifications}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          desktopNotifications: e.target.checked
                        }))}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        preferences.desktopNotifications ? 'bg-green-500' : 'bg-slate-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                          preferences.desktopNotifications ? 'translate-x-6' : ''
                        }`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-700">Sound Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.soundEnabled}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          soundEnabled: e.target.checked
                        }))}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        preferences.soundEnabled ? 'bg-green-500' : 'bg-slate-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                          preferences.soundEnabled ? 'translate-x-6' : ''
                        }`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-700">Auto-clear Old Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.autoClear}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          autoClear: e.target.checked
                        }))}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        preferences.autoClear ? 'bg-green-500' : 'bg-slate-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                          preferences.autoClear ? 'translate-x-6' : ''
                        }`} />
                      </div>
                    </label>

                    {preferences.autoClear && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Clear after (minutes)
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="1440"
                          step="5"
                          value={preferences.autoClearTime}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            autoClearTime: parseInt(e.target.value)
                          }))}
                          className="w-full"
                        />
                        <div className="text-sm text-slate-600 mt-1">
                          Clear notifications after {preferences.autoClearTime} minutes
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Filters */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-4">Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.filter(cat => cat.id !== 'all').map(category => (
                      <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.categories[category.id]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              [category.id]: e.target.checked
                            }
                          }))}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority Filters */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-4">Priority Levels</h3>
                  <div className="space-y-2">
                    {PRIORITIES.map(priority => (
                      <label key={priority.id} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getPriorityStyle(priority.id).bg}`}>
                            {React.createElement(priority.icon, {
                              className: `w-3 h-3 ${getPriorityStyle(priority.id).text}`
                            })}
                          </div>
                          <span className="text-sm text-slate-700">{priority.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.priorityFilter[priority.id]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            priorityFilter: {
                              ...prev.priorityFilter,
                              [priority.id]: e.target.checked
                            }
                          }))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                          preferences.priorityFilter[priority.id] ? 'bg-green-500' : 'bg-slate-300'
                        }`}>
                          <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                            preferences.priorityFilter[priority.id] ? 'translate-x-5' : ''
                          }`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSystem;