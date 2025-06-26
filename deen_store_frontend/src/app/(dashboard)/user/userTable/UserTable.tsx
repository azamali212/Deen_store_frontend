'use client';
import Table from '@/components/ui/table/Table';
import { Edit, Trash2, RefreshCw, Mail, MapPin, User, Shield, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/buttons/button';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import Avatar from '@/components/avatar/Avatar';
import { useUser } from '@/hooks/user/useUser';
import Spinner from '@/components/ui/spinner/Spinner';

import { Role as UIRole, Permission as UIPermission } from '@/types/ui';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import AvatarGroup from '@/components/avatar/AvatarGroup';
import { useRouter } from 'next/navigation';
import ShowUserModel from '../model/ShowUserModel';

// Define local types that extend your existing types
type LocalPermission = UIPermission & {
    pivot: {
        role_id: number;
        permission_id: number;
    };
};

type LocalRole = UIRole & {
    permissions: LocalPermission[];
    pivot: {
        model_type: string;
        model_id: string;
        role_id: number;
    };
};

type UserRole = LocalRole | string;

export interface TableUser {
    id: string;
    user: {
        name: string;
        email: string;
        created_at: string;
        avatar: string;
    };
    contact?: {  // Make this optional
        email: string;
        verified: boolean;
    };
    location: string;
    role: string;
    roles: (LocalRole | string)[];  // This matches your UserRole type
    permissions: LocalPermission[];
    status: 'active' | 'inactive';
    last_activity: string | null;
    email_verified_at?: string | null; 
    last_login_at?: string | null; 
    actions: {
        id: string;
    };
}

const UserTable = () => {
    const { users, loading, error, pagination, loadUsers } = useUser();
    const [localLoading, setLocalLoading] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<TableUser | null>(null);
    const [showUserModal, setShowUserModal] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

    const formatDate = (dateString: string | null | undefined) => {
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

    // Transform data with proper type safety
    const tableData: TableUser[] = users
        .filter(user => !!user.id) // Filter out users without IDs first
        .map(user => {
            // Handle last_activity explicitly to ensure it's never undefined
            const lastActivity = user.last_login_at ?? null;

            // Determine role name
            let roleName = 'User';
            if (Array.isArray(user.roles)) {
                if (user.roles.length > 0) {
                    const firstRole = user.roles[0];
                    roleName = typeof firstRole === 'string' ? firstRole : firstRole?.name || 'User';
                }
            }

            // Extract permissions safely
            const permissions = Array.isArray(user.roles)
                ? user.roles.flatMap(role =>
                    typeof role === 'object' && role !== null && 'permissions' in role
                        ? (role as LocalRole).permissions
                        : [])
                : [];

            return {
                id: user.id,
                user: {
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                },
                contact: {
                    email: user.email,
                    verified: !!user.email_verified_at
                },
                location: user.location || 'Unknown',
                role: roleName,
                roles: user.roles || [],
                permissions,
                status: user.status as 'active' | 'inactive',
                last_activity: lastActivity,
                actions: {
                    id: user.id
                }
            };
        });

        const handleViewClick = (userData: TableUser) => {
            setSelectedUser({
                ...userData,
                email_verified_at: userData.contact?.verified ? new Date().toISOString() : null,
                last_login_at: userData.last_activity
            });
            setShowUserModal(true);
        };

    const handlePageChange = React.useCallback(async (page: number) => {
        setLocalLoading(true);
        try {
            await loadUsers(page);
        } catch (err) {
            console.error('Pagination error:', err);
        } finally {
            setLocalLoading(false);
        }
    }, [loadUsers]);

    const from = (pagination.current_page - 1) * pagination.per_page + 1;
    const to = Math.min(pagination.current_page * pagination.per_page, pagination.total);

    if (loading) return <div className="p-6 text-center"><Spinner size="lg" /></div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="bg-[rgb(var(--dashboard--background))] rounded-2xl shadow-sm overflow-hidden mt-6">
            {/* Header section */}
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        User Management <span className="text-gray-500 dark:text-gray-400">({pagination.total} users)</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => loadUsers(pagination.current_page)}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Table section */}
            <Table
                externalPagination={true}
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={handlePageChange}
                title="Users"
                headers={['User', 'Contact', 'Location', 'Role', 'Permissions', 'Status', 'Last Activity', 'Actions']}
                data={tableData}
                customRender={{

                    user: (value) => (
                        <div className="flex items-center gap-3">
                            <Avatar src={value.avatar} name={value.name} size="sm" />
                            <div className="flex flex-col">

                                <span className="font-medium text-gray-900 dark:text-gray">
                                    {value.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Joined {formatDate(value.created_at)}
                                </span>
                            </div>
                        </div>
                    ),
                    contact: (value) => (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {value?.email || 'No email'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                {value?.verified ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {value?.verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                    ),
                    location: (value) => (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
                        </div>
                    ),
                    role: (value: string | LocalRole) => {
                        const roleName = typeof value === 'string' ? value :
                            (typeof value === 'object' ? value.name : 'User');
                        const isAdmin = roleName.toLowerCase() === 'admin';

                        return (
                            <div className="flex items-center gap-2">
                                {isAdmin ? (
                                    <Shield className="w-4 h-4 text-purple-500" />
                                ) : (
                                    <User className="w-4 h-4 text-blue-500" />
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAdmin
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                                </span>
                            </div>
                        );
                    },
                    permissions: (value: LocalPermission[]) => {
                        const uniquePermissions = Array.from(new Set(value.map(p => p.slug)))
                            .map(slug => value.find(p => p.slug === slug))
                            .filter(Boolean) as LocalPermission[];

                        return (
                            <div className="max-w-[200px]">
                                {uniquePermissions.length > 0 ? (
                                    <Tooltip
                                        content={
                                            <div className="w-64 p-3">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                                                    User Permissions ({uniquePermissions.length})
                                                </div>
                                                <div className="space-y-2">
                                                    {uniquePermissions.map(permission => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${getPermissionColor(permission.slug).split(' ')[0]}`} />
                                                            <div className="text-xs text-gray-700 dark:text-gray-300">
                                                                {permission.name}
                                                                <div className="text-[0.7rem] text-gray-500 dark:text-gray-400 mt-1">
                                                                    {permission.slug}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        }
                                        side="top"
                                        interactive
                                        delayDuration={100}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg"
                                        maxHeight="300px" // Set max height with scrolling
                                    >
                                        <div className="inline-flex">
                                            <AvatarGroup
                                                avatars={uniquePermissions.map(() => '')}
                                                size="sm"
                                                max={5}
                                                children={uniquePermissions.map((permission, index) => (
                                                    <div
                                                        key={`${permission.id}-${index}`}
                                                        className={`relative flex items-center justify-center rounded-full w-8 h-8 text-xs font-medium shadow-sm hover:shadow-md transition-shadow ${getPermissionColor(permission.slug)}`}
                                                    >
                                                        {permission.slug.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                            />
                                        </div>
                                    </Tooltip>
                                ) : (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">No permissions</span>
                                )}
                            </div>
                        );
                    },
                    status: (value) => (
                        <div className="flex items-center gap-3">
                            <button
                                className={`
                              relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                              ${value === 'active'
                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 focus:ring-teal-400'
                                        : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
                                    }
                              shadow-inner hover:shadow-md
                            `}
                                aria-pressed={value === 'active'}
                                aria-label={`Toggle user status. Current status: ${value}`}
                            >
                                {/* Glow effect */}
                                <span className={`
                              absolute inset-0 rounded-full opacity-0 transition-opacity
                              ${value === 'active' ? 'bg-teal-400' : 'bg-gray-300'}
                              ${value === 'active' ? 'group-hover:opacity-20' : 'group-hover:opacity-10'}
                            `} />

                                {/* Toggle knob with shine effect */}
                                <span
                                    className={`
                                inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300
                                shadow-lg flex items-center justify-center overflow-hidden
                                ${value === 'active' ? 'translate-x-8' : 'translate-x-1'}
                              `}
                                >
                                    {/* Inner shine */}
                                    <span className="absolute inset-0 bg-gradient-to-br from-white/70 to-transparent" />
                                </span>
                            </button>

                            {/* Status text with animation */}
                            <span className={`
                            text-sm font-medium transition-all duration-300
                            ${value === 'active' ? 'text-teal-600' : 'text-gray-500'}
                          `}>
                                {value === 'active' ? (
                                    <span className="flex items-center">
                                        <span className="mr-1">Active</span>
                                        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
                                            <circle cx="4" cy="4" r="3" />
                                        </svg>
                                    </span>
                                ) : (
                                    'Inactive'
                                )}
                            </span>
                        </div>
                    ),
                    last_activity: (value) => (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {value ? formatDate(value) : 'Never logged in'}
                            </span>
                        </div>
                    ),
                    // Update the actions custom render to this:
                    // Change your actions custom render to:
                    actions: (value, userData) => {
                        return (
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-purple-500 dark:hover:text-purple-400"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewClick(userData);
                                    }}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Delete clicked for', value.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    }
                }}
            />
            {/* Modal should be here at the root level */}
            {showUserModal && (
                <ShowUserModel
                    isModalOpen={showUserModal}
                    userId={selectedUser?.id}
                    userData={selectedUser} // Pass the data directly
                    setIsModalOpen={setShowUserModal}
                />
            )}
        </div>

    );

};
const getPermissionColor = (slug: string) => {
    const colors = [
        // Light mode background, dark mode background, light mode text, dark mode text
        'bg-[#8B5CF620] dark:bg-[#8B5CF630] text-[#8B5CF6] dark:text-[#8B5CF6]',  // Purple
        'bg-[#10B98120] dark:bg-[#10B98130] text-[#10B981] dark:text-[#10B981]',  // Emerald
        'bg-[#3B82F620] dark:bg-[#3B82F630] text-[#3B82F6] dark:text-[#3B82F6]',  // Blue
        'bg-[#F59E0B20] dark:bg-[#F59E0B30] text-[#F59E0B] dark:text-[#F59E0B]',  // Amber
        'bg-[#EF444420] dark:bg-[#EF444430] text-[#EF4444] dark:text-[#EF4444]',  // Red
        'bg-[#f7ebe720] dark:bg-[#f7ebe730] text-[#f7ebe7] dark:text-[#f7ebe7]',  // Light pink
        'bg-[#14B8A620] dark:bg-[#14B8A630] text-[#14B8A6] dark:text-[#14B8A6]',  // Teal
    ];
    const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};


export default UserTable;