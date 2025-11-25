"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  X,
  Save,
  Shield,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  FileText,
  Settings,
  AlertCircle,
  Zap,
  Crown,
  Key,
  Lock,
  Unlock,
  Sparkles,
  Filter,
  RotateCcw,
  Clock,
  Calendar,
  UserCheck
} from 'lucide-react';
import Model from '@/components/ui/modals/model';
import Button from '@/components/ui/buttons/button';
import Spinner from '@/components/ui/spinner/Spinner';
import { toast } from 'react-toastify';

interface Permission {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
}

interface Role {
  id: string | number;
  name: string;
  permissions?: Permission[];
}

interface UserType {
  user_id: string;
  user_name: string;
  email: string;
  status?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  email_verified_at?: string | null;
  roles?: (Role | string)[];
  permissions?: Permission[];
}

interface TemporaryPermissionAssignment {
 permissions: string[]; // Array of permission names
  expires_at: string;
  reason?: string;
}

interface TemporaryPermissionsResponse {
  success: boolean;
  message: string;
  assigned_permissions?: Array<{
    id: string | number;
    permission_name: string;
    expires_at: string;
  }>;
}

interface PermissionUserModelProps {
  user: UserType;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  permissions: Permission[];
  onSave?: (userId: string, permissionIds: (string | number)[]) => Promise<void>;
  onAssignTemporaryPermissions?: (
    userId: string,
    permissions: TemporaryPermissionAssignment[],
    reason?: string
  ) => Promise<{ success: boolean; message: string; data?: TemporaryPermissionsResponse }>;
  isSaving?: boolean;
  isAssigningTemporary?: boolean;
}

// Define the type for permission categories
type PermissionCategories = {
  'Admin Permissions': Permission[];
  'User Management': Permission[];
  'Content Management': Permission[];
  'System Permissions': Permission[];
};

const PermissionUserModel: React.FC<PermissionUserModelProps> = ({
  user,
  isModalOpen,
  setIsModalOpen,
  permissions,
  onSave,
  onAssignTemporaryPermissions,
  isSaving = false,
  isAssigningTemporary = false,
}) => {
  // Type guard to check if it's a Role object
  const isRoleObject = (role: Role | string): role is Role => {
    return typeof role === 'object' && 'id' in role && 'name' in role;
  };

  // Debug logging
  useEffect(() => {
    if (isModalOpen) {
      console.log('PermissionUserModel opened with:', {
        user,
        permissionsCount: permissions?.length,
        userPermissionsCount: user.permissions?.length,
        userRolesCount: user.roles?.length
      });
    }
  }, [isModalOpen, user, permissions]);

  // Memoize initial permissions to prevent unnecessary recalculations
  const initialPermissions = useMemo(() =>
    user.permissions?.map(p => p.id) || [],
    [user.permissions]
  );

  const [selectedPermissions, setSelectedPermissions] = useState<(string | number)[]>(initialPermissions);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [permissionType, setPermissionType] = useState<'permanent' | 'temporary'>('permanent');
  const [temporaryExpiry, setTemporaryExpiry] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Extract role permissions
  const rolePermissions = useMemo(() => {
    if (!user.roles) return [];

    const allRolePermissions: Permission[] = [];
    user.roles.forEach(role => {
      if (isRoleObject(role) && role.permissions) {
        allRolePermissions.push(...role.permissions);
      }
    });

    // Remove duplicates
    return allRolePermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
  }, [user.roles]);

  // Categorize permissions using useMemo to prevent recalculations on every render
  const permissionCategories = useMemo((): PermissionCategories => {
    if (!permissions || permissions.length === 0) {
      return {
        'Admin Permissions': [],
        'User Management': [],
        'Content Management': [],
        'System Permissions': []
      };
    }

    const adminPermissions = permissions.filter(p =>
      p.name.toLowerCase().includes('admin') ||
      p.name.toLowerCase().includes('super')
    );

    const userPermissions = permissions.filter(p =>
      p.name.toLowerCase().includes('user') &&
      !adminPermissions.includes(p)
    );

    const contentPermissions = permissions.filter(p =>
      (p.name.toLowerCase().includes('content') || p.name.toLowerCase().includes('post')) &&
      !adminPermissions.includes(p)
    );

    const systemPermissions = permissions.filter(p =>
      !adminPermissions.includes(p) &&
      !userPermissions.includes(p) &&
      !contentPermissions.includes(p)
    );

    return {
      'Admin Permissions': adminPermissions,
      'User Management': userPermissions,
      'Content Management': contentPermissions,
      'System Permissions': systemPermissions
    };
  }, [permissions]);

  // Filter permissions based on search term
  const filteredPermissionCategories = useMemo(() => {
    if (!searchTerm) return permissionCategories;

    const result: Partial<PermissionCategories> = {};

    Object.entries(permissionCategories).forEach(([category, perms]) => {
      if (Array.isArray(perms)) {
        const filtered = perms.filter((p: Permission) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filtered.length > 0) {
          result[category as keyof PermissionCategories] = filtered;
        }
      }
    });

    return result as PermissionCategories;
  }, [permissionCategories, searchTerm]);

  // Get category icon with enhanced styling
  const getCategoryIcon = (category: string) => {
    const iconProps = "w-5 h-5";

    switch (category) {
      case 'Admin Permissions':
        return <Crown className={`${iconProps} text-amber-500`} />;
      case 'User Management':
        return <Users className={`${iconProps} text-blue-500`} />;
      case 'Content Management':
        return <FileText className={`${iconProps} text-emerald-500`} />;
      case 'System Permissions':
        return <Settings className={`${iconProps} text-purple-500`} />;
      default:
        return <Shield className={`${iconProps} text-gray-500`} />;
    }
  };

  // Get category gradient
  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'Admin Permissions':
        return 'from-amber-500/10 to-orange-500/5 border-amber-200/50';
      case 'User Management':
        return 'from-blue-500/10 to-cyan-500/5 border-blue-200/50';
      case 'Content Management':
        return 'from-emerald-500/10 to-green-500/5 border-emerald-200/50';
      case 'System Permissions':
        return 'from-purple-500/10 to-violet-500/5 border-purple-200/50';
      default:
        return 'from-gray-500/10 to-gray-500/5 border-gray-200/50';
    }
  };

  // Use useCallback for toggle function to prevent unnecessary re-renders
  const handlePermissionToggle = useCallback((permissionId: string | number) => {
    setSelectedPermissions(prev => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];

      // Calculate changes by comparing with initial permissions
      const hasChanges = newPermissions.length !== initialPermissions.length ||
        initialPermissions.some(id => !newPermissions.includes(id));

      setPendingChanges(hasChanges ? 1 : 0);
      return newPermissions;
    });
  }, [initialPermissions]);

  const handleCategoryToggle = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleSave = async () => {
    console.log('🔄 Save button clicked - Debug Info:');
    console.log('Permission type:', permissionType);
    console.log('Selected permissions:', selectedPermissions);
    console.log('Temporary expiry:', temporaryExpiry);
    console.log('Reason:', reason);
  
    if (permissionType === 'permanent' && onSave) {
      console.log('🟢 Calling onSave with:', { userId: user.user_id, permissionIds: selectedPermissions });
      try {
        await onSave(user.user_id, selectedPermissions);
        setPendingChanges(0);
        toast.success('🎉 Permanent permissions updated successfully!');
      } catch (error) {
        console.error('❌ Error in onSave:', error);
        toast.error('❌ Failed to update permissions');
      }
    } else if (permissionType === 'temporary' && onAssignTemporaryPermissions) {
      console.log('🟡 Calling onAssignTemporaryPermissions');
      try {
        // Validate temporary permissions
        if (!temporaryExpiry) {
          toast.error('❌ Please set an expiry date for temporary permissions');
          return;
        }
  
        if (selectedPermissions.length === 0) {
          toast.error('❌ Please select at least one permission');
          return;
        }
  
        if (!reason.trim()) {
          toast.error('❌ Please provide a reason for temporary permissions');
          return;
        }
  
        // FIX: Transform permission IDs to permission names
        const permissionNames = selectedPermissions.map(permissionId => {
          const permission = permissions.find(p => p.id === permissionId);
          const permissionName = permission?.name || permissionId.toString();
          console.log(`🔍 DEBUG - Mapping permission ID ${permissionId} to name: "${permissionName}"`);
          return permissionName;
        });
  
        // FIX: Use the correct data structure for backend
        const temporaryPermissions: TemporaryPermissionAssignment[] = [{
          permissions: permissionNames, // Array of permission names as strings
          expires_at: `${temporaryExpiry} 23:59:59`,
          reason: reason.trim()
        }];
  
        console.log('🔍 DEBUG - Final permission names:', permissionNames);
        console.log('🔍 DEBUG - Type of first permission:', typeof permissionNames[0]);
        console.log('🔍 DEBUG - Payload being sent:', {
          userId: user.user_id,
          permissions: temporaryPermissions,
          permissionNames: permissionNames
        });
  
        console.log('🔍 DEBUG - Request structure:', temporaryPermissions[0]);
  
        const result = await onAssignTemporaryPermissions(user.user_id, temporaryPermissions, reason);
        console.log('Result from onAssignTemporaryPermissions:', result);
  
        if (result.success) {
          setPendingChanges(0);
          setTemporaryExpiry('');
          setReason('');
          toast.success('🎉 Temporary permissions assigned successfully!');
        } else {
          toast.error(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('❌ Error in onAssignTemporaryPermissions:', error);
        toast.error('❌ Failed to assign temporary permissions');
      }
    } else {
      console.log('🔴 No action taken - check conditions');
      if (permissionType === 'temporary' && !onAssignTemporaryPermissions) {
        toast.error('❌ Temporary permission assignment is not configured');
      }
    }
  };

  const handleReset = () => {
    setSelectedPermissions(initialPermissions);
    setPendingChanges(0);
    setTemporaryExpiry('');
    setReason('');
    toast.info('🔄 Changes reset to original state');
  };

  const handleClose = useCallback(() => {
    // Reset to initial state
    setSelectedPermissions(initialPermissions);
    setPendingChanges(0);
    setSearchTerm('');
    setExpandedCategory(null);
    setTemporaryExpiry('');
    setReason('');
    setPermissionType('permanent');
    setIsModalOpen(false);
  }, [initialPermissions, setIsModalOpen]);

  // PERFECTLY ALIGNED PERMISSION ITEM - CLEAN DESIGN
  const renderPermissionItem = useCallback((permission: Permission) => {
    const isSelected = selectedPermissions.includes(permission.id);
    const isFromRole = rolePermissions.some(rp => rp.id === permission.id);

    return (
      <div
        key={permission.id}
        className={`
          group relative overflow-hidden rounded-xl border transition-all duration-200
          ${isFromRole
            ? 'bg-blue-50/50 border-blue-200'
            : 'bg-white border-gray-200'
          }
          ${isSelected ? 'ring-2 ring-blue-500/20 bg-blue-50' : 'hover:bg-gray-50'}
          shadow-sm hover:shadow-md
        `}
      >
        <label className="flex items-center p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handlePermissionToggle(permission.id)}
            className="hidden"
            disabled={isFromRole}
          />

          {/* Clean Checkbox */}
          <div className={`
            relative flex-shrink-0 w-5 h-5 rounded-lg border-2 transition-all duration-200
            flex items-center justify-center mr-3
            ${isSelected
              ? isFromRole
                ? 'bg-blue-500 border-blue-500'
                : 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300'
            }
            ${isFromRole ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}>
            {isSelected && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>

          {/* PERMISSION CONTENT - PERFECT ALIGNMENT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              {/* Left side: Name and badge */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {permission.name}
                    </p>
                    {isFromRole && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200 flex-shrink-0">
                        <Lock className="w-3 h-3" />
                        Role
                      </span>
                    )}
                  </div>
                  {permission.description && (
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {permission.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side: Status indicator */}
              <div className={`
                flex-shrink-0 w-2 h-2 rounded-full transition-all duration-200
                ${isSelected
                  ? isFromRole
                    ? 'bg-blue-500'
                    : 'bg-blue-600'
                  : 'bg-gray-300'
                }
              `} />
            </div>
          </div>
        </label>
      </div>
    );
  }, [selectedPermissions, handlePermissionToggle, rolePermissions]);

  // Check if we have any permissions to display
  const hasPermissions = Object.keys(permissionCategories).length > 0 &&
    Object.values(permissionCategories).some(category => category.length > 0);

  const hasFilteredPermissions = Object.keys(filteredPermissionCategories).length > 0 &&
    Object.values(filteredPermissionCategories).some(category => category.length > 0);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPermissions = permissions?.length || 0;
    const userDirectPermissions = user.permissions?.length || 0;
    const roleBasedPermissions = rolePermissions.length;
    const selectedCount = selectedPermissions.length;

    return {
      totalPermissions,
      userDirectPermissions,
      roleBasedPermissions,
      selectedCount,
      temporaryPermission: permissionType === 'temporary' ? selectedCount : 0,
      availableForSelection: totalPermissions - roleBasedPermissions
    };
  }, [permissions, user.permissions, rolePermissions, selectedPermissions]);

  // Get minimum date for temporary permissions (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Model
      isOpen={isModalOpen}
      onClose={handleClose}
      title=""
      size="xl"
      className="fixed right-0 top-0 h-full w-full max-w-4xl min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 shadow-2xl border-l border-gray-200/60 backdrop-blur-sm transition-all duration-500 ease-out"
      showFooter={false}
    >
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-violet-500/5 to-purple-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-blue-500/5 to-cyan-600/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Header */}
        <div className="relative p-8 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-lg">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Permission Manager
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage access controls for {user.user_name}
                  </p>
                </div>
              </div>

              {/* User info with avatar */}
              <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-gray-200/40 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {user.user_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.user_name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                    {user.status || 'Active'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 rounded-xl"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Permission Type Selection */}
          <div className="mt-6">
            <div className="flex space-x-1 p-1 bg-white/60 rounded-2xl border border-gray-200/40 shadow-sm backdrop-blur-sm w-fit">
              <button
                onClick={() => setPermissionType('permanent')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${permissionType === 'permanent'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <UserCheck className="w-4 h-4" />
                Permanent Permissions
              </button>
              <button
                onClick={() => setPermissionType('temporary')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${permissionType === 'temporary'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <Clock className="w-4 h-4" />
                Temporary Permissions
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mt-6 relative">
            <div className={`
              relative transition-all duration-300
              ${isSearchFocused ? 'scale-105' : 'scale-100'}
            `}>
              <Search className={`
                absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200
                ${isSearchFocused ? 'text-violet-600' : 'text-gray-400'}
                w-5 h-5
              `} />
              <input
                type="text"
                placeholder="Search permissions by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-12 pr-12 py-4 bg-white/80 border border-gray-300/60 rounded-2xl focus:ring-3 focus:ring-violet-500/20 focus:border-violet-500 shadow-sm backdrop-blur-sm transition-all duration-300 text-lg placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Temporary Permissions Configuration */}
          {permissionType === 'temporary' && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/40 shadow-sm backdrop-blur-sm">
                <label className="flex items-center gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Expiry Date</span>
                </label>
                <input
                  type="date"
                  value={temporaryExpiry}
                  onChange={(e) => setTemporaryExpiry(e.target.value)}
                  min={getMinDate()}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Select when these permissions should expire</p>
              </div>

              <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/40 shadow-sm backdrop-blur-sm">
                <label className="flex items-center gap-3 mb-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Reason (Optional)</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you assigning these temporary permissions?"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/40 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPermissions}</p>
                  <p className="text-xs text-gray-600">Total Available</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/40 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <Check className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.selectedCount}</p>
                  <p className="text-xs text-gray-600">Temporary Permissions</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/40 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Crown className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.roleBasedPermissions}</p>
                  <p className="text-xs text-gray-600">From Roles</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/40 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableForSelection}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!hasPermissions ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Permissions Available</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  There are no permissions configured in the system yet. Please contact your administrator to set up the permission structure.
                </p>
              </div>
            </div>
          ) : !hasFilteredPermissions ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-600">
                  No permissions found matching "<span className="text-violet-600 font-medium">"{searchTerm}"</span>"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(filteredPermissionCategories).map(([category, categoryPermissions]) => {
                if (Array.isArray(categoryPermissions) && categoryPermissions.length > 0) {
                  const isExpanded = expandedCategory === category;

                  return (
                    <div
                      key={category}
                      className={`
                        bg-gradient-to-br rounded-3xl border-2 backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden
                        ${getCategoryGradient(category)}
                        ${isExpanded ? 'shadow-lg scale-[1.02]' : 'shadow-sm hover:shadow-md'}
                      `}
                    >
                      {/* Enhanced Category Header */}
                      <button
                        onClick={() => handleCategoryToggle(category)}
                        className="w-full p-6 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            p-3 rounded-2xl transition-all duration-300 group-hover:scale-110
                            ${isExpanded ? 'scale-110 bg-white/50 shadow-inner' : 'bg-white/30 shadow-sm'}
                          `}>
                            {getCategoryIcon(category)}
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">
                              {category}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''} • {isExpanded ? 'Click to collapse' : 'Click to expand'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`
                            text-sm font-medium transition-colors
                            ${isExpanded ? 'text-violet-600' : 'text-gray-500'}
                          `}>
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </span>
                          <div className={`
                            p-2 rounded-xl transition-all duration-300 group-hover:bg-white/50
                            ${isExpanded ? 'bg-white/50 rotate-180' : 'bg-white/30'}
                          `}>
                            <ChevronDown className={`
                              w-5 h-5 transition-transform duration-300
                              ${isExpanded ? 'text-violet-600' : 'text-gray-500'}
                            `} />
                          </div>
                        </div>
                      </button>

                      {/* Enhanced Permissions List */}
                      {isExpanded && (
                        <div className="border-t border-white/20 p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                            {categoryPermissions.map(renderPermissionItem)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="relative border-t border-gray-200/60 bg-white/80 backdrop-blur-sm p-6">
          <div className=" lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-violet-600 rounded-full shadow-sm ring-2 ring-violet-200" />
                  <span className="text-sm font-medium text-gray-700">Direct Permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm ring-2 ring-blue-200" />
                  <span className="text-sm font-medium text-gray-700">Role Permissions</span>
                </div>
              </div>

              {pendingChanges > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full border border-amber-300 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  <span>{pendingChanges} change{pendingChanges !== 1 ? 's' : ''} pending</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={pendingChanges === 0}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gray-100/80 border border-gray-300/60 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Changes
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-8 py-3 rounded-2xl transition-all duration-300 border border-gray-300/60 shadow-sm hover:shadow-md hover:bg-gray-50 text-gray-700 hover:text-gray-900 min-w-[120px]"
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    isAssigningTemporary ||
                    pendingChanges === 0 ||
                    !hasPermissions ||
                    (permissionType === 'temporary' && !temporaryExpiry)
                  }
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-sm min-w-[140px] flex items-center justify-center gap-2"
                >
                  {(isSaving || isAssigningTemporary) ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      <span>
                        {permissionType === 'temporary' ? 'Assigning...' : 'Saving...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>
                        {permissionType === 'temporary' ? 'Assign Temporary' : 'Save Changes'}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Model>
  );
};

export default React.memo(PermissionUserModel);