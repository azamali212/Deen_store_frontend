"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Mail, Calendar, User, MapPin, Shield, Clock, Check, X, Edit3, Trash2, Copy,
    KeyRound, Globe, ShieldCheck, Plus, Eye, EyeOff,
    ChevronUp,
    ChevronDown,
    RefreshCw,
    History,
    FileText,
} from 'lucide-react';
import Model from '@/components/ui/modals/model';
import Button from '@/components/ui/buttons/button';
import Spinner from '@/components/ui/spinner/Spinner';
import { toast } from 'react-toastify';
import Badge from '@/components/ui/badge/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import RoleUserModel from './RoleUserModel';
import PermissionUserModel from './PermissionUserModel';
import { useSelector } from 'react-redux';
import { RootState } from '@/store'
import { usePermission } from '@/hooks/permissions/usePermission';
import { useUser } from '@/hooks/user/useUser';

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
    status: string;
    avatar?: string;
    phone?: string;
    location?: string;
    bio?: string;
    address?: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
    email_verified_at?: string | null;
    roles?: (Role | string)[];
    permissions?: Permission[];
    location_data?: {}
}

interface TemporaryPermissionAssignment {
    permissions: string[];
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

interface AssignedByUser {
    id: string;
    name: string;
    email: string;
    // ... other user properties
}

interface TemporaryPermission {
    id: string | number;
    permission_name: string;
    expires_at: string;
    reason?: string;
    assigned_at?: string;
    assigned_by?: string | AssignedByUser; // Can be string or object
    days_remaining?: number;
    permission?: {
        id: string | number;
        name: string;
        slug: string;
    };
}

interface ShowUserModelProps {
    user: UserType;
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    onUpdate?: (userId: string) => Promise<void>;
    onDelete?: (userId: string) => Promise<void>;
    isUpdating?: boolean;
    isDeleting?: boolean;
    permissions?: Permission[];
    allUsers?: any[];
    onRoleUpdate?: (roleId: string, userIds: string[]) => Promise<void>;
    onPermissionUpdate?: (userId: string, permissionIds: (string | number)[]) => Promise<void>;
}

const ShowUserModel: React.FC<ShowUserModelProps> = ({
    user,
    isModalOpen,
    setIsModalOpen,
    onUpdate,
    onDelete,
    isUpdating = false,
    permissions = [],
    isDeleting = false,
    allUsers = [],
    onRoleUpdate,
    onPermissionUpdate,
}) => {
    // Use the loadTemporaryPermissions function from the useUser hook
    const { assignTemporaryPermissions, loadTemporaryPermissions, revokeTemporaryPermissions } = useUser();
    const [openRoles, setOpenRoles] = useState<string[]>([]);
    const [isEmailHidden, setIsEmailHidden] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const allRoles = useSelector((state: RootState) => state.role?.roles || []);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Temporary permissions state
    const [temporaryPermissionsLoading, setTemporaryPermissionsLoading] = useState(false);
    const [temporaryPermissionsError, setTemporaryPermissionsError] = useState<string | null>(null);
    const [activeTemporaryPermissions, setActiveTemporaryPermissions] = useState<TemporaryPermission[]>([]);
    const [allTemporaryPermissions, setAllTemporaryPermissions] = useState<TemporaryPermission[]>([]);

    // Revoke permission state
    const [revokingPermissionId, setRevokingPermissionId] = useState<string | number | null>(null);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedPermissionToRevoke, setSelectedPermissionToRevoke] = useState<TemporaryPermission | null>(null);
    const [revokeReason, setRevokeReason] = useState('');

    const { permissions: allAvailablePermissions, loadPermissions } = usePermission();

    const [isSavingPermanent, setIsSavingPermanent] = useState(false);
    const [isAssigningTemporary, setIsAssigningTemporary] = useState(false);

    // Get temporary permissions from Redux store
    const temporaryPermissionsFromStore = useSelector((state: RootState) => state.user?.temporaryPermissions);

    useEffect(() => {
        loadPermissions(1, 1000);
    }, [loadPermissions]);

    // Enhanced load function for temporary permissions using the function from useUser hook
    const handleLoadTemporaryPermissions = useCallback(async (userId: string) => {
        setTemporaryPermissionsLoading(true);
        setTemporaryPermissionsError(null);

        try {
            const result = await loadTemporaryPermissions(userId);
            if (result.success) {
                // Use the data from Redux store that was updated by the thunk
                if (temporaryPermissionsFromStore) {
                    setActiveTemporaryPermissions(temporaryPermissionsFromStore.active || []);
                    setAllTemporaryPermissions(temporaryPermissionsFromStore.all || []);
                }
                //toast.success('Temporary permissions loaded successfully');
            } else {
                setTemporaryPermissionsError(result.message);
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error loading temporary permissions:', error);
            const errorMessage = 'An unexpected error occurred while loading temporary permissions';
            setTemporaryPermissionsError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setTemporaryPermissionsLoading(false);
        }
    }, [loadTemporaryPermissions, temporaryPermissionsFromStore]);

    // Sync with Redux store when it updates
    useEffect(() => {
        if (temporaryPermissionsFromStore) {
            setActiveTemporaryPermissions(temporaryPermissionsFromStore.active || []);
            setAllTemporaryPermissions(temporaryPermissionsFromStore.all || []);
        }
    }, [temporaryPermissionsFromStore]);

    // Load temporary permissions when the tab is opened
    useEffect(() => {
        if (activeTab === 'temporary' && isModalOpen) {
            handleLoadTemporaryPermissions(user.user_id);
        }
    }, [activeTab, isModalOpen, user.user_id]);

    const handleAssignTemporaryPermissions = useCallback(async (
        userId: string,
        permissions: TemporaryPermissionAssignment[],
        reason?: string
    ): Promise<{ success: boolean; message: string; data?: TemporaryPermissionsResponse }> => {
        console.log('🔄 Parent: handleAssignTemporaryPermissions called', {
            userId,
            permissions,
            reason
        });

        setIsAssigningTemporary(true);

        try {
            const result = await assignTemporaryPermissions(userId, permissions, reason);
            console.log('✅ Parent: Temporary permissions assigned successfully', result);

            // Reload temporary permissions after assignment
            await handleLoadTemporaryPermissions(userId);

            return result;
        } catch (error: any) {
            console.error('❌ Parent: Error assigning temporary permissions', error);

            return {
                success: false,
                message: error.message || 'Failed to assign temporary permissions'
            };
        } finally {
            setIsAssigningTemporary(false);
        }
    }, [assignTemporaryPermissions, handleLoadTemporaryPermissions]);

    // Revoke permission handler
    const handleRevokePermission = useCallback(async (permission: TemporaryPermission, reason?: string) => {
        if (!permission.id) return;

        setRevokingPermissionId(permission.id);

        try {
            const permissionName = getTemporaryPermissionName(permission);
            const permissionIds = [permissionName];

            const result = await revokeTemporaryPermissions(user.user_id, permissionIds, reason);

            if (result.success) {
                toast.success(`Permission "${permissionName}" revoked successfully`);
                // Reload the temporary permissions to reflect changes
                await handleLoadTemporaryPermissions(user.user_id);
                setShowRevokeModal(false);
                setSelectedPermissionToRevoke(null);
                setRevokeReason('');
            } else {
                toast.error(result.message || 'Failed to revoke permission');
            }
        } catch (error) {
            console.error('Error revoking permission:', error);
            toast.error('An unexpected error occurred while revoking permission');
        } finally {
            setRevokingPermissionId(null);
        }
    }, [user.user_id, revokeTemporaryPermissions, handleLoadTemporaryPermissions]);

    // Open revoke confirmation modal
    const openRevokeModal = (permission: TemporaryPermission) => {
        setSelectedPermissionToRevoke(permission);
        setShowRevokeModal(true);
        setRevokeReason('');
    };

    // Close revoke modal
    const closeRevokeModal = () => {
        setShowRevokeModal(false);
        setSelectedPermissionToRevoke(null);
        setRevokeReason('');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleUpdate = async () => {
        if (onUpdate) {
            try {
                await onUpdate(user.user_id);
                toast.success('User updated successfully');
            } catch (error) {
                toast.error('Failed to update user');
            }
        }
    };

    const handleDelete = async () => {
        if (onDelete) {
            try {
                await onDelete(user.user_id);
                toast.success('User deleted successfully');
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, string> = {
            active: "bg-green-500",
            inactive: "bg-red-500",
        };

        const dotColor = statusMap[status.toLowerCase()] || statusMap.inactive;

        return (
            <Badge className="bg-transparent shadow-none p-0">
                <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            </Badge>
        );
    };

    const toggleRoleCollapse = (roleId: string) => {
        setOpenRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const isRoleObject = (role: Role | string): role is Role => {
        return typeof role === 'object' && 'name' in role;
    };

    const handleRoleEdit = (role: Role) => {
        setSelectedRole(role);
        setRoleModalOpen(true);
    };

    const handlePermissionEdit = () => {
        setPermissionModalOpen(true);
    };

    // Extract permissions from the backend response structure
    const allPermissions = useMemo(() => {
        if (permissions && permissions.length > 0) {
            return permissions;
        }

        const permissionsFromRoles = user.roles?.flatMap(role => {
            if (isRoleObject(role) && role.permissions) {
                return role.permissions;
            }
            return [];
        }) || [];

        const directPermissions = user.permissions || [];

        return [...permissionsFromRoles, ...directPermissions];
    }, [user.roles, user.permissions, permissions]);

    // Remove duplicate permissions
    const uniquePermissions = Array.from(
        new Map(allPermissions.map(perm => [perm.id, perm])).values()
    );

    // Group permissions by category
    const permissionsByCategory = useMemo(() => {
        const grouped: Record<string, Permission[]> = {};

        uniquePermissions.forEach(permission => {
            const category = permission.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(permission);
        });

        return grouped;
    }, [uniquePermissions]);

    // User avatar fallback with initials
    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    };

    // Get permission name from temporary permission data
    const getTemporaryPermissionName = (tempPerm: TemporaryPermission) => {
        // Handle different response structures
        if (tempPerm.permission_name) {
            return tempPerm.permission_name;
        }
        if (tempPerm.permission?.name) {
            return tempPerm.permission.name;
        }
        if (typeof tempPerm.permission === 'string') {
            return tempPerm.permission;
        }
        return 'Unknown Permission';
    };

    // Get assigned by name from temporary permission data
    const getAssignedByName = (tempPerm: TemporaryPermission) => {
        if (!tempPerm.assigned_by) return 'Unknown';

        if (typeof tempPerm.assigned_by === 'string') {
            return tempPerm.assigned_by;
        }

        // Handle object case
        if (typeof tempPerm.assigned_by === 'object' && 'name' in tempPerm.assigned_by) {
            return tempPerm.assigned_by.name;
        }

        return 'Unknown';
    };

    return (
        <>
            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="User Details"
                size="xl"
                className="fixed right-0 top-0 h-full w-full min-h-screen bg-white shadow-2xl border-l border-gray-200 transition-all duration-300 ease-in-out"
                showFooter={false}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r rounded-t-xl from-[#201335] border-l border-gray-200 to-[#ced3da] text-white p-6">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="relative">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.user_name}
                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border-4 border-white/20">
                                        {getInitials(user.user_name || 'U')}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1">
                                    {getStatusBadge(user.status)}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{user.user_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 opacity-80" />
                                    <span className="text-white/90 text-lg font-medium">
                                        {isEmailHidden ? '••••••••@•••••••' : user.email}
                                    </span>
                                    <button
                                        onClick={() => setIsEmailHidden(!isEmailHidden)}
                                        className="ml-2 opacity-70 hover:opacity-100 transition-opacity p-1 rounded-md bg-white/10"
                                        title={isEmailHidden ? 'Show email' : 'Hide email'}
                                    >
                                        {isEmailHidden ? (
                                            <Eye className="w-4 h-4" />
                                        ) : (
                                            <EyeOff className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(user.email)}
                                        className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded-md bg-white/10"
                                        title="Copy email"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                {user.roles && user.roles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {user.roles.map((role, index) => {
                                            const roleName = isRoleObject(role) ? role.name : role;
                                            return (
                                                <div key={index} className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    {roleName}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-white">
                        <div className="flex px-6 gap-6">
                            <button
                                className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Overview
                            </button>
                            <button
                                className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'permissions' ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('permissions')}
                            >
                                Roles & Permissions
                            </button>
                            <button
                                className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'temporary' ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('temporary')}
                            >
                                Temporary Permissions
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Info Card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-violet-600" />
                                        Personal Information
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                                            <p className="text-gray-900 font-medium mt-1">{user.user_name || 'Not provided'}</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                                                <button
                                                    onClick={() => setIsEmailHidden(!isEmailHidden)}
                                                    className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"
                                                >
                                                    {isEmailHidden ? (
                                                        <>
                                                            <Eye className="w-3 h-3" />
                                                            Show
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3 h-3" />
                                                            Hide
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-gray-900 font-medium text-lg">
                                                    {isEmailHidden ? '••••••••@•••••••' : user.email}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(user.email)}
                                                    className="text-gray-400 hover:text-violet-600 ml-2 p-1 rounded-md hover:bg-gray-100"
                                                    title="Copy email"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {user.phone && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-gray-900 font-medium">{user.phone}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(user.phone || '')}
                                                        className="text-gray-400 hover:text-violet-600 ml-2 p-1 rounded-md hover:bg-gray-100"
                                                        title="Copy phone number"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {user.location && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                                                <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {user.location}
                                                </p>
                                            </div>
                                        )}

                                        {user.bio && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</label>
                                                <p className="text-gray-700 mt-1">{user.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Account Info Card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-violet-600" />
                                        Account Information
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">User ID</label>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-gray-900 font-medium font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {user.user_id}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(user.user_id)}
                                                    className="text-gray-400 hover:text-violet-600 ml-2 p-1 rounded-md hover:bg-gray-100"
                                                    title="Copy user ID"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                            <div className="mt-1">
                                                {getStatusBadge(user.status)}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Verification</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                {user.email_verified_at ? (
                                                    <>
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                        Verified on {formatDate(user.email_verified_at)}
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="w-4 h-4 text-rose-500" />
                                                        Not verified
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Created</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(user.created_at)}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(user.updated_at)}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</label>
                                            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {user.last_login_at ? formatDate(user.last_login_at) : 'Never logged in'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'permissions' && (
                            <div className="space-y-6">
                                {/* Roles Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex itemst-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-violet-600" />
                                            Assigned Roles
                                        </h2>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="bg-violet-600 hover:bg-violet-700 text-white"
                                            onClick={() => {
                                                setSelectedRole({ id: 'manage', name: 'Manage Roles' } as Role);
                                                setRoleModalOpen(true);
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Manage Roles
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((role, index) => {
                                                const roleObj = isRoleObject(role) ? role : {
                                                    id: index.toString(),
                                                    name: role,
                                                    permissions: []
                                                };

                                                return (
                                                    <Collapsible key={roleObj.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                                        <CollapsibleTrigger asChild>
                                                            <button
                                                                className="flex items-center justify-between w-full p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                                                                onClick={() => toggleRoleCollapse(roleObj.id?.toString() || '')}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="w-4 h-4 text-gray-400" />
                                                                    <span className="font-medium">{roleObj.name}</span>
                                                                </div>
                                                                {openRoles.includes(roleObj.id?.toString() || '') ? (
                                                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </button>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent className="px-3 pb-3">
                                                            <div className="pt-2 border-t border-gray-200">
                                                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Permissions</h4>
                                                                <div className="space-y-1">
                                                                    {roleObj.permissions && roleObj.permissions.length > 0 ? (
                                                                        roleObj.permissions.map(permission => (
                                                                            <div key={permission.id} className="text-sm text-gray-700 flex items-center gap-2">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                                                                                {permission.name}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500">No specific permissions</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center text-gray-500">
                                                No roles assigned to this user
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Enhanced Permissions Section */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <KeyRound className="w-5 h-5 text-violet-600" />
                                            Direct Permissions ({uniquePermissions.length})
                                        </h2>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="bg-violet-600 hover:bg-violet-700 text-white"
                                            onClick={handlePermissionEdit}
                                        >
                                            <Edit3 className="w-4 h-4 mr-1" />
                                            Edit Permissions
                                        </Button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                        {uniquePermissions.length > 0 ? (
                                            <div>
                                                {Object.keys(permissionsByCategory).length > 1 ? (
                                                    <div className="space-y-4">
                                                        {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                                                            <div key={category} className="bg-white rounded-lg p-3">
                                                                <h3 className="font-medium text-gray-800 mb-2">
                                                                    {category} <span className="text-gray-500">({categoryPermissions.length})</span>
                                                                </h3>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {categoryPermissions.map(permission => (
                                                                        <div key={permission.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                                                            <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"></div>
                                                                            <div className="min-w-0">
                                                                                <p className="text-sm font-medium text-gray-700 truncate">{permission.name}</p>
                                                                                {permission.description && (
                                                                                    <p className="text-xs text-gray-500 truncate">{permission.description}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {uniquePermissions.map(permission => (
                                                            <div key={permission.id} className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-200">
                                                                <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"></div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-700 truncate">{permission.name}</p>
                                                                    {permission.description && (
                                                                        <p className="text-xs text-gray-500 truncate">{permission.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">
                                                No direct permissions assigned
                                            </p>
                                        )}
                                    </div>

                                    {uniquePermissions.length > 0 && (
                                        <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
                                            <p className="text-sm text-violet-700">
                                                <strong>Summary:</strong> This user has {uniquePermissions.length} permission{uniquePermissions.length !== 1 ? 's' : ''}{' '}
                                                across {Object.keys(permissionsByCategory).length} categor{Object.keys(permissionsByCategory).length !== 1 ? 'ies' : 'y'}.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'temporary' && (
                            <div className="space-y-8">
                                {/* Active Temporary Permissions - Professional Card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    {/* Header Section */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Active Temporary Permissions</h2>
                                                <p className="text-gray-500 text-sm mt-1">Currently active time-bound access permissions</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                                            onClick={() => handleLoadTemporaryPermissions(user.user_id)}
                                            disabled={temporaryPermissionsLoading}
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${temporaryPermissionsLoading ? 'animate-spin' : ''}`} />
                                            {temporaryPermissionsLoading ? 'Refreshing...' : 'Refresh'}
                                        </Button>
                                    </div>

                                    {/* Error State */}
                                    {temporaryPermissionsError && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <X className="w-3 h-3 text-red-600" />
                                                </div>
                                                <p className="text-red-700 text-sm font-medium">{temporaryPermissionsError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Permissions List */}
                                    <div className="space-y-4">
                                        {activeTemporaryPermissions.length > 0 ? (
                                            activeTemporaryPermissions.map((tempPerm) => {
                                                const daysRemaining = tempPerm.days_remaining !== undefined
                                                    ? Math.floor(tempPerm.days_remaining)
                                                    : Math.ceil((new Date(tempPerm.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                                const isUrgent = daysRemaining <= 1;
                                                const isWarning = daysRemaining <= 3;

                                                return (
                                                    <div
                                                        key={tempPerm.id}
                                                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-all duration-200 group"
                                                    >
                                                        {/* Main Content Row */}
                                                        <div className="flex items-start justify-between">
                                                            {/* Left Section - Permission Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start gap-4">
                                                                    {/* Status Indicator */}
                                                                    <div className={`
                                                w-3 h-3 rounded-full mt-2 flex-shrink-0
                                                ${isUrgent
                                                                            ? 'bg-red-500'
                                                                            : isWarning
                                                                                ? 'bg-amber-500'
                                                                                : 'bg-green-500'
                                                                        }
                                            `} />

                                                                    <div className="flex-1 min-w-0">
                                                                        {/* Permission Name and Status */}
                                                                        <div className="flex items-center gap-3 mb-3">
                                                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                                                {getTemporaryPermissionName(tempPerm)}
                                                                            </h3>
                                                                            <Badge className={`
                                                        px-2.5 py-1 rounded-full text-xs font-medium border
                                                        ${isUrgent
                                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                                    : isWarning
                                                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                                        : 'bg-green-50 text-green-700 border-green-200'
                                                                                }
                                                    `}>
                                                                                {isUrgent ? 'Expiring Soon' : isWarning ? 'Expiring' : 'Active'}
                                                                            </Badge>
                                                                        </div>

                                                                        {/* Metadata Grid */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                            {/* Expires */}
                                                                            <div className="space-y-1">
                                                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                    Expires
                                                                                </label>
                                                                                <p className="text-sm text-gray-900 font-medium">
                                                                                    {formatDate(tempPerm.expires_at)}
                                                                                </p>
                                                                            </div>

                                                                            {/* Reason */}
                                                                            {tempPerm.reason && (
                                                                                <div className="space-y-1">
                                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                        Reason
                                                                                    </label>
                                                                                    <p className="text-sm text-gray-900 truncate">
                                                                                        {tempPerm.reason}
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {/* Assigned */}
                                                                            {tempPerm.assigned_at && (
                                                                                <div className="space-y-1">
                                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                        Assigned
                                                                                    </label>
                                                                                    <p className="text-sm text-gray-900">
                                                                                        {formatDate(tempPerm.assigned_at)}
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {/* Time Remaining */}
                                                                            <div className="space-y-1">
                                                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                    Time Remaining
                                                                                </label>
                                                                                <p className={`
                                                            text-sm font-semibold
                                                            ${isUrgent
                                                                                        ? 'text-red-600'
                                                                                        : isWarning
                                                                                            ? 'text-amber-600'
                                                                                            : 'text-green-600'
                                                                                    }
                                                        `}>
                                                                                    {daysRemaining <= 0 ? 'Expires Today' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Assigned By */}
                                                                        {tempPerm.assigned_by && (
                                                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500">Assigned by:</span>
                                                                                    <span className="text-sm text-gray-900 font-medium">
                                                                                        {getAssignedByName(tempPerm)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right Section - Action Buttons */}
                                                            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="relative bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 group/btn overflow-hidden"
                                                                    onClick={() => openRevokeModal(tempPerm)}
                                                                    disabled={revokingPermissionId === tempPerm.id}
                                                                >
                                                                    {/* Animated background */}
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                                                                    {/* Content */}
                                                                    <div className="relative flex items-center gap-2">
                                                                        {revokingPermissionId === tempPerm.id ? (
                                                                            <>
                                                                                <Spinner size="sm" className="text-white" />
                                                                                <span className="text-white">Revoking...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className="relative">
                                                                                    <X className="w-4 h-4 transform group-hover/btn:scale-110 transition-transform duration-200" />
                                                                                    <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
                                                                                </div>
                                                                                <span className="text-white font-medium">Revoke Access</span>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {/* Ripple effect */}
                                                                    <div className="absolute inset-0 overflow-hidden">
                                                                        <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                                                    </div>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Clock className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Temporary Permissions</h3>
                                                <p className="text-gray-500 text-sm max-w-md mx-auto">
                                                    All temporary permissions have expired or no time-bound permissions are currently assigned to this user.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* All Temporary Permissions History - Professional Card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    {/* Header Section */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                                <History className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Permission History</h2>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Complete timeline of temporary permission assignments
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium ml-2">
                                                        {allTemporaryPermissions.length} total records
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* History List */}
                                    <div className="space-y-4">
                                        {allTemporaryPermissions.length > 0 ? (
                                            allTemporaryPermissions.map((tempPerm) => {
                                                const isExpired = new Date(tempPerm.expires_at) < new Date();
                                                const isActive = !isExpired;
                                                const daysRemaining = isActive
                                                    ? Math.ceil((new Date(tempPerm.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                                    : Math.floor((new Date().getTime() - new Date(tempPerm.expires_at).getTime()) / (1000 * 60 * 60 * 24));

                                                return (
                                                    <div
                                                        key={tempPerm.id}
                                                        className={`
                                    border rounded-lg p-5 transition-all duration-200
                                    ${isActive
                                                                ? 'bg-white border-green-200'
                                                                : 'bg-gray-50 border-gray-200'
                                                            }
                                `}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start gap-4">
                                                                    {/* Status Dot */}
                                                                    <div className={`
                                                w-3 h-3 rounded-full mt-2 flex-shrink-0
                                                ${isActive
                                                                            ? 'bg-green-500'
                                                                            : 'bg-gray-400'
                                                                        }
                                            `} />

                                                                    <div className="flex-1 min-w-0">
                                                                        {/* Header with Status */}
                                                                        <div className="flex items-center gap-3 mb-3">
                                                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                                                {getTemporaryPermissionName(tempPerm)}
                                                                            </h3>
                                                                            <Badge className={`
                                                        px-2.5 py-1 rounded-full text-xs font-medium border
                                                        ${isActive
                                                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                                                                }
                                                    `}>
                                                                                {isActive ? 'Active' : `Expired ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} ago`}
                                                                            </Badge>
                                                                        </div>

                                                                        {/* Timeline Information */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            {/* Assigned Date */}
                                                                            <div className="space-y-1">
                                                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                    Assigned
                                                                                </label>
                                                                                <p className="text-sm text-gray-900">
                                                                                    {tempPerm.assigned_at ? formatDate(tempPerm.assigned_at) : 'Unknown'}
                                                                                </p>
                                                                            </div>

                                                                            {/* Expiry Date */}
                                                                            <div className="space-y-1">
                                                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                    {isActive ? 'Expires' : 'Expired'}
                                                                                </label>
                                                                                <p className={`text-sm ${isActive ? 'text-gray-900' : 'text-red-600 font-medium'}`}>
                                                                                    {formatDate(tempPerm.expires_at)}
                                                                                </p>
                                                                            </div>

                                                                            {/* Reason */}
                                                                            {tempPerm.reason && (
                                                                                <div className="space-y-1">
                                                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                                        Purpose
                                                                                    </label>
                                                                                    <p className="text-sm text-gray-900 truncate">
                                                                                        {tempPerm.reason}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Assigned By */}
                                                                        {tempPerm.assigned_by && (
                                                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                                        {getAssignedByName(tempPerm).charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-xs font-medium text-gray-500">Assigned by</span>
                                                                                        <p className="text-sm text-gray-900 font-medium">
                                                                                            {getAssignedByName(tempPerm)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <History className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permission History</h3>
                                                <p className="text-gray-500 text-sm max-w-md mx-auto">
                                                    This user has never been assigned any temporary permissions. All permission history will appear here.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer */}
                    <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                                    <Globe className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                        ID: {user.user_id}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(user.user_id)}
                                        className="text-gray-400 hover:text-violet-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                                        title="Copy User ID"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:w-auto justify-center text-gray-600 hover:bg-gray-200 px-6 py-3 rounded-lg transition-all border border-gray-300 shadow-sm hover:shadow-md"
                                >
                                    Close
                                </Button>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    {onDelete && (
                                        <Button
                                            variant="danger"
                                            className="w-full sm:w-auto justify-center bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                                            disabled={isDeleting}
                                            onClick={handleDelete}
                                        >
                                            {isDeleting ? (
                                                <Spinner size="sm" className="text-white" />
                                            ) : (
                                                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                                                    <span>Delete User</span>
                                                </span>
                                            )}
                                        </Button>
                                    )}

                                    {onUpdate && (
                                        <Button
                                            variant="primary"
                                            className="w-full sm:w-auto justify-center bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                                            disabled={isUpdating}
                                            onClick={handleUpdate}
                                        >
                                            {isUpdating ? (
                                                <Spinner size="sm" className="text-white" />
                                            ) : (
                                                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                    <Edit3 className="w-4 h-4 flex-shrink-0" />
                                                    <span>Update User</span>
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional footer information */}
                        <div className="mt-4 pt-4 border-t border-gray-200 border-dashed flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Last updated: {formatDate(user.updated_at)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {user.user_name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Model>

            {/* Role Management Modal */}
            {selectedRole && (
                <RoleUserModel
                    role={selectedRole}
                    user={user}
                    isModalOpen={roleModalOpen}
                    setIsModalOpen={setRoleModalOpen}
                    allUsers={allUsers}
                    onSave={onRoleUpdate}
                    isSaving={false}
                    allRoles={allRoles}
                />
            )}

            {/* Permission Management Modal */}
            <PermissionUserModel
                user={user}
                isModalOpen={permissionModalOpen}
                setIsModalOpen={setPermissionModalOpen}
                onSave={onPermissionUpdate}
                permissions={allAvailablePermissions}
                onAssignTemporaryPermissions={handleAssignTemporaryPermissions}
                isSaving={isSavingPermanent}
                isAssigningTemporary={isAssigningTemporary}
            />

            {/* Revoke Permission Confirmation Modal */}
            <Model
                isOpen={showRevokeModal}
                onClose={closeRevokeModal}
                title="Revoke Temporary Permission"
                size="md"
                className="bg-white rounded-xl shadow-xl"
                showFooter={false}
            >
                <div className="p-6">
                    {selectedPermissionToRevoke && (
                        <>
                            {/* Warning Icon */}
                            <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-4">
                                <X className="w-8 h-8 text-red-600" />
                            </div>

                            {/* Confirmation Message */}
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Revoke Permission?
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to revoke the permission <strong>"{getTemporaryPermissionName(selectedPermissionToRevoke)}"</strong>?
                                    This action cannot be undone.
                                </p>

                                {/* Permission Details */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Permission:</span>
                                            <p className="font-medium text-gray-900">{getTemporaryPermissionName(selectedPermissionToRevoke)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Expires:</span>
                                            <p className="font-medium text-gray-900">{formatDate(selectedPermissionToRevoke.expires_at)}</p>
                                        </div>
                                        {selectedPermissionToRevoke.reason && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Original Reason:</span>
                                                <p className="font-medium text-gray-900">{selectedPermissionToRevoke.reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Revoke Reason Input */}
                                <div className="text-left mb-6">
                                    <label htmlFor="revokeReason" className="block text-sm font-medium text-gray-700 mb-2">
                                        Revocation Reason (Optional)
                                    </label>
                                    <textarea
                                        id="revokeReason"
                                        value={revokeReason}
                                        onChange={(e) => setRevokeReason(e.target.value)}
                                        placeholder="Enter reason for revoking this permission..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="ghost"
                                    onClick={closeRevokeModal}
                                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 border border-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleRevokePermission(selectedPermissionToRevoke, revokeReason)}
                                    disabled={revokingPermissionId === selectedPermissionToRevoke.id}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {revokingPermissionId === selectedPermissionToRevoke.id ? (
                                        <>
                                            <Spinner size="sm" className="text-white mr-2" />
                                            Revoking...
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-4 h-4 mr-2" />
                                            Revoke Permission
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Model>
        </>
    );
};

export default ShowUserModel;