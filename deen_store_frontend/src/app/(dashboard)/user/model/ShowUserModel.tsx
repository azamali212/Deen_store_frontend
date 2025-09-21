"use client";
import React, { useState, useMemo, useCallback } from 'react';
import {
    Mail, Calendar, User, MapPin, Shield, Clock, Check, X, Edit3, Trash2, Copy,
    KeyRound, Globe, ShieldCheck, Plus, Search, Eye, EyeOff,
    Filter,
    ChevronUp,
    ChevronDown,
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
    onPermissionUpdate
}) => {
    const [openRoles, setOpenRoles] = useState<string[]>([]);
    const [isEmailHidden, setIsEmailHidden] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const allRoles = useSelector((state: RootState) => state.role?.roles || []);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissionSearch, setPermissionSearch] = useState('');
    const [permissionFilter, setPermissionFilter] = useState('all');
    const [showAllPermissions, setShowAllPermissions] = useState(false);

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

    const getRoleBadge = (role: string) => {
        const roleColors: Record<string, string> = {
            'super admin': 'bg-violet-100 text-violet-800 border border-violet-200',
            'admin': 'bg-red-100 text-red-800 border border-red-200',
            'vendor admin': 'bg-amber-100 text-amber-800 border border-amber-200',
            'customer': 'bg-sky-100 text-sky-800 border border-sky-200',
            'product admin': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
            'order admin': 'bg-slate-100 text-slate-800 border border-slate-200',
            'delivery manager': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
            'store admin': 'bg-orange-100 text-orange-800 border border-orange-200',
            'default': 'bg-pink-100 text-pink-800 border border-pink-200'
        };

        const lowerCaseRole = role.toLowerCase();
        const colorClass = roleColors[lowerCaseRole] || roleColors['default'];

        return (
            <Badge className={`${colorClass} capitalize px-2.5 py-1 rounded-full text-xs font-medium`}>
                {role}
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
        // Check if permissions are passed as a prop (from the backend response)
        if (permissions && permissions.length > 0) {
            return permissions;
        }

        // Fallback: try to extract from user object if permissions prop is not available
        const permissionsFromRoles = user.roles?.flatMap(role => {
            if (isRoleObject(role) && role.permissions) {
                return role.permissions;
            }
            return [];
        }) || [];

        const directPermissions = user.permissions || [];

        // Combine all permissions and remove duplicates
        return [...permissionsFromRoles, ...directPermissions];
    }, [user.roles, user.permissions, permissions]);

    // Remove duplicate permissions
    const uniquePermissions = Array.from(
        new Map(allPermissions.map(perm => [perm.id, perm])).values()
    );

    // Get unique categories from permissions
    const permissionCategories = useMemo(() => {
        const categories = Array.from(new Set(uniquePermissions.map(p => p.category || 'Uncategorized')));
        return ['all', ...categories];
    }, [uniquePermissions]);

    // Filter permissions based on search and filter
    const filteredPermissions = useMemo(() => {
        let result = uniquePermissions;

        // Apply category filter
        if (permissionFilter !== 'all') {
            result = result.filter(p => p.category === permissionFilter);
        }

        // Apply search filter
        if (permissionSearch) {
            const term = permissionSearch.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.description && p.description.toLowerCase().includes(term))
            );
        }

        return result;
    }, [uniquePermissions, permissionSearch, permissionFilter]);

    // Group permissions by category
    const permissionsByCategory = useMemo(() => {
        const grouped: Record<string, Permission[]> = {};

        filteredPermissions.forEach(permission => {
            const category = permission.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(permission);
        });

        return grouped;
    }, [filteredPermissions]);

    // Determine how many permissions to show initially
    const permissionsToShow = useMemo(() => {
        if (showAllPermissions || filteredPermissions.length <= 15) {
            return filteredPermissions;
        }

        return filteredPermissions.slice(0, 15);
    }, [filteredPermissions, showAllPermissions]);

    // User avatar fallback with initials
    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    };

    const clearPermissionFilters = useCallback(() => {
        setPermissionSearch('');
        setPermissionFilter('all');
    }, []);

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
                                    <div className="flex items-center justify-between mb-4">
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
                                                        <CollapsibleTrigger
                                                            className="flex items-center justify-between w-full p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium">{roleObj.name}</span>
                                                            </div>
                                                            {/* Add chevron icon to indicate collapsible */}
                                                            {openRoles.includes(roleObj.id?.toString() || '') ? (
                                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                            )}
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
                                            Direct Permissions ({filteredPermissions.length})
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

                                    {/* Permission Search and Filters */}
                                    <div className="mb-4 space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search permissions..."
                                                value={permissionSearch}
                                                onChange={(e) => setPermissionSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                            {permissionSearch && (
                                                <button
                                                    onClick={() => setPermissionSearch('')}
                                                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Filter className="w-4 h-4" />
                                                <span>Filter by:</span>
                                            </div>
                                            {permissionCategories.map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => setPermissionFilter(category)}
                                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${permissionFilter === category
                                                        ? 'bg-violet-100 text-violet-700 font-medium'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {category === 'all' ? 'All Categories' : category}
                                                </button>
                                            ))}
                                        </div>

                                        {(permissionSearch || permissionFilter !== 'all') && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-600">
                                                    Filtered: {filteredPermissions.length} of {uniquePermissions.length} permissions
                                                </span>
                                                <button
                                                    onClick={clearPermissionFilters}
                                                    className="text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Clear filters
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                        {filteredPermissions.length > 0 ? (
                                            <div>
                                                {/* Grouped view for many permissions */}
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
                                                    // Grid view for fewer permissions
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {permissionsToShow.map(permission => (
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

                                                {/* Show more/less toggle */}
                                                {filteredPermissions.length > 15 && (
                                                    <div className="mt-4 text-center">
                                                        <button
                                                            onClick={() => setShowAllPermissions(!showAllPermissions)}
                                                            className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                                                        >
                                                            {showAllPermissions ? 'Show less' : `Show all ${filteredPermissions.length} permissions`}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">
                                                {permissionSearch || permissionFilter !== 'all'
                                                    ? 'No permissions match your filters'
                                                    : 'No direct permissions assigned'
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Summary of permissions */}
                                    {filteredPermissions.length > 0 && (
                                        <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
                                            <p className="text-sm text-violet-700">
                                                <strong>Summary:</strong> This user has {filteredPermissions.length} permission{filteredPermissions.length !== 1 ? 's' : ''}{' '}
                                                across {Object.keys(permissionsByCategory).length} categor{Object.keys(permissionsByCategory).length !== 1 ? 'ies' : 'y'}.
                                            </p>
                                        </div>
                                    )}
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
                    allRoles={allRoles} // Pass the roles from Redux store
                />
            )}

            {/* Permission Management Modal */}
            <PermissionUserModel
                user={user}
                isModalOpen={permissionModalOpen}
                setIsModalOpen={setPermissionModalOpen}
                permissions={permissions}
                onSave={onPermissionUpdate}
            />
        </>
    );
};

export default ShowUserModel;