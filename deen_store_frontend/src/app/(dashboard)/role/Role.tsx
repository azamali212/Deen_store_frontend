'use client';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { User as LucideUser, ShieldCheck, Stethoscope, UserCog, BriefcaseMedical, Plus, MoreVertical, Edit2, Trash2, Copy, Settings, ChevronDown, ChevronRight, Users, ChevronsRightLeft, ChevronsLeft, Check, CheckSquare, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/buttons/button';
import { useRole } from '@/hooks/role/useRole';
import { usePermission } from '@/hooks/permissions/usePermission';
import RoleModel from './models/RoleModel';
import EditRoleModel from './models/EditRoleModel';
import RoleChart from './RoleChart';
import SearchBar from '@/components/ui/search/SearchBar';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getRoleColor } from '@/utility/roleColors';
import DeleteRoleModel from './models/DeleteRoleModel';
import ManagePermissionModel from './models/ManagePermissionModel';
import ManageUserRoleModel from './models/ManageUserRoleModel';
import { User } from '@/types/ui';
import BulkDeleteModel from './models/BulkDeleteModel';

type Role = {
    id: string;
    title: string;
    slug: string;
    userCount: number;
    color: string;
    permissions?: string[];
    permissionsCount?: number;
};

interface RoleUsers {
    [key: string]: User[] | undefined;
}

const Role = () => {
    const {
        roles,
        loading: rolesLoading,
        error,
        successMessage,
        loadRoles,
        resetRole,
        pagination,
        goToNextPage,
        goToPrevPage,
        isSearching,
        onSearchChange,
        searchQuery,
        loadRoleUsers,
        deleteMultipleRoles
    } = useRole();

    const {
        loading: permissionsLoading,
        loadPermissions
    } = usePermission();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const isLoading = rolesLoading || permissionsLoading || isSearching;
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<{ id: number, name: string } | null>(null);
    const [isManagePermissionsOpen, setIsManagePermissionsOpen] = useState(false);
    const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<{
        id: number;
        permissions: string[];
        color: string;
    } | null>(null);
    const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
    const [selectedRoleForUsers, setSelectedRoleForUsers] = useState<{
        id: number;
        currentUsers: [];
        color: string;
    } | null>(null);
    const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
    const [roleUsersData, setRoleUsersData] = useState<RoleUsers>({});

    const toggleUsersVisibility = async (roleId: string) => {
        setExpandedRoles(prev => ({
            ...prev,
            [roleId]: !prev[roleId]
        }));

        // Only load users if we're expanding and don't already have them
        if (!expandedRoles[roleId] && (!roleUsersData[roleId] || roleUsersData[roleId]?.length === 0)) {
            try {
                // Set loading state
                setRoleUsersData(prev => ({
                    ...prev,
                    [roleId]: prev[roleId] || [] // Maintain existing data if any
                }));

                const usersResponse = await loadRoleUsers(parseInt(roleId));
                if (usersResponse && usersResponse.data) {
                    setRoleUsersData(prev => ({
                        ...prev,
                        [roleId]: usersResponse.data
                    }));
                }
            } catch (error) {
                console.error('Error loading role users:', error);
                // Set empty array on error but maintain the count
                setRoleUsersData(prev => ({
                    ...prev,
                    [roleId]: []
                }));
            }
        }
    };


    const handleManagePermissions = (role: Role) => {
        setSelectedRoleForPermissions({
            id: parseInt(role.id),
            permissions: role.permissions || [],
            color: role.color
        });
        setIsManagePermissionsOpen(true);
    };

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete({ id: parseInt(role.id), name: role.title });
        setIsDeleteModalOpen(true);
    };

    const handleManageUsers = (role: Role) => {
        const currentUsers: [] = [];
        setSelectedRoleForUsers({
            id: parseInt(role.id),
            currentUsers,
            color: role.color
        });
        setIsManageUsersOpen(true);
    };

    useEffect(() => {
        loadRoles(pagination.current_page);
        loadPermissions();
    }, [pagination.current_page]);

    useEffect(() => {
        if (successMessage) {
            resetRole();
            loadRoles();
        }
        if (error) {
            resetRole();
        }
    }, [successMessage, error, resetRole]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdownElements = document.querySelectorAll('.role-dropdown-container');
            let shouldClose = true;

            dropdownElements.forEach(el => {
                if (el.contains(event.target as Node)) {
                    shouldClose = false;
                }
            });

            if (shouldClose) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const transformRolesData = (rawRoles: any): Role[] => {
        if (!Array.isArray(rawRoles)) return [];

        return rawRoles.map(role => {
            const rolePermissions = role.permissions
                ? Array.isArray(role.permissions)
                    ? role.permissions.map((p: { name?: string } | string) =>
                        typeof p === 'string' ? p : p.name || ''
                    )
                    : []
                : role.permission_names
                    ? role.permission_names
                    : [];

            const color = role?.color ||
                getRoleColor(role?.name || '') ||
                getRoleColor(role?.id?.toString() || '');

            // Enhanced user count extraction with proper debugging
            let userCount = 0;

            // Check all possible locations for user count
            if (typeof role.users_count !== 'undefined') {
                userCount = role.users_count;
            } else if (typeof role.usersCount !== 'undefined') {
                userCount = role.usersCount;
            } else if (typeof role.user_count !== 'undefined') {
                userCount = role.user_count;
            } else if (typeof role.userCount !== 'undefined') {
                userCount = role.userCount;
            } else if (Array.isArray(role.users)) {
                userCount = role.users.length;
            }

            return {
                id: role?.id?.toString() || Math.random().toString(36).substring(2, 9),
                title: role?.name || role?.title || 'Unnamed Role',
                slug: role?.slug || 'No description available',
                userCount: userCount,
                permissionsCount: rolePermissions.length,
                color: color,
                permissions: rolePermissions
            };
        });
    };


    useEffect(() => {
        console.log(transformedRoles)
    }, [roles]);

    const transformedRoles = useMemo(() => transformRolesData(roles), [roles]);

    const getRoleIcon = (title: string): JSX.Element => {
        const iconMap: Record<string, JSX.Element> = {
            'Super Admin': <ShieldCheck className="w-5 h-5" />,
            'Admin': <ShieldCheck className="w-5 h-5" />,
            'Vendor Admin': <LucideUser className="w-5 h-5" />,
            'Customer': <LucideUser className="w-5 h-5" />,
            'Delivery Manager': <LucideUser className="w-5 h-5" />,
            'System Admin': <ShieldCheck className="w-5 h-5" />,
            'Hospital Admin': <BriefcaseMedical className="w-5 h-5" />,
            'Doctor': <Stethoscope className="w-5 h-5" />,
            'Nurse': <UserCog className="w-5 h-5" />,
            'Staff': <LucideUser className="w-5 h-5" />
        };
        return iconMap[title] || <LucideUser className="w-5 h-5" />;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const handleEditClick = (role: Role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
        setActiveDropdown(null);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[rgb(var(--background))] min-h-screen relative">
            {/* Loading overlay */}

            {(rolesLoading || permissionsLoading) && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-purple-500 border-b-purple-600 border-l-transparent mx-auto"></div>
                        <p className="mt-4 text-lg font-medium text-white">Loading Role Dashboard</p>
                        <p className="text-gray-200 mt-1">Preparing your management interface...</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                                Role Management
                            </h1>
                        </div>
                        <p className="text-gray-500 mt-2 ml-5">
                            Configure access levels and permissions across your platform
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl w-full sm:w-auto px-5 py-3 group"
                        >
                            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                            <span className="whitespace-nowrap font-medium">Create Role</span>
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions Bar - Add this after your header section */}
                {selectedRoles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {selectedRoles.length}
                                </span>
                            </div>
                            <span className="text-purple-800 font-medium">
                                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setIsBulkDeleteModalOpen(true)}
                                variant="ghost"
                                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Selected</span>
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-10 bg-[rgb(var(--background))] rounded-2xl shadow-sm p-6 border border-gray-200"
                >
                    <div className="h-[350px] lg:h-[400px] w-full">
                        {rolesLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <RoleChart transformedRoles={transformedRoles} />
                        )}
                    </div>
                </motion.div>

                {searchQuery && (
                    <div className="mb-6 text-sm text-gray-500 px-2">
                        Found {transformedRoles.length} roles matching <span className="font-medium text-purple-600">"{searchQuery}"</span>
                    </div>
                )}

                {/* Section Title ***************/}
                <div className="p-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
                            All Roles
                        </h2>
                        {searchQuery && (
                            <span className="text-sm text-gray-500">
                                ({transformedRoles.length} found)
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 h-10"> {/* Fixed height container */}
                        {/* Search Bar */}
                        <div className="w-full sm:w-64 h-full"> {/* Full height */}
                            <SearchBar
                                onSearch={onSearchChange}
                               
                                className="h-full" // Make search bar fill container
                            />
                        </div>

                        {/* Refresh Button */}
                        <Tooltip content="Refresh">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => loadPermissions()}
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                {/* Roles Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {transformedRoles.map((role) => (
                        <motion.div
                            key={role.id}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            {/* Main card */}
                            <div className="h-full flex flex-col rounded-2xl bg-[rgb(var(--background))] shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden relative z-10">

                                <div
                                    className="absolute top-0 left-0 right-0 h-1.5"
                                    style={{ backgroundColor: role.color }}
                                ></div>

                                {/* Card content */}
                                <div className="p-6 pb-0 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="p-3 rounded-xl flex-shrink-0 shadow-sm"
                                            style={{
                                                backgroundColor: `${role.color}15`,
                                                color: role.color
                                            }}
                                        >
                                            {getRoleIcon(role.title)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] truncate max-w-[140px]">
                                                {role.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {role.slug || 'No description'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Context menu */}
                                    <div className="relative">
                                        <button
                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === role.id ? null : role.id);
                                            }}
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                        </button>

                                        {activeDropdown === role.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden role-dropdown-container"
                                            >
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleEditClick(role)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                                        <span>Edit Role</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleManagePermissions(role)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Settings className="w-4 h-4 text-gray-500" />
                                                        <span>Manage Permissions</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleManageUsers(role)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Users className="w-4 h-4 text-gray-500" />
                                                        <span>Manage Users</span>
                                                    </button>
                                                    <div className="border-t border-gray-200 my-1"></div>
                                                    <button
                                                        onClick={() => handleDeleteClick(role)}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete Role</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="px-6 py-5 flex items-center justify-between bg-[rgb(var(--background-light))] rounded-xl mx-4 mt-4">
                                    <div className="text-center">
                                        <div
                                            className="text-2xl font-bold"
                                            style={{ color: role.color }}
                                        >
                                            {role.permissionsCount || 0}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Permissions</div>
                                    </div>

                                    <div className="h-12 w-px bg-gray-200"></div>

                                    <div className="text-center">
                                        <button
                                            onClick={() => toggleUsersVisibility(role.id)}
                                            className="text-2xl font-bold hover:underline cursor-pointer"
                                            style={{ color: role.color }}
                                        >
                                            {role.userCount}
                                        </button>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {expandedRoles[role.id] ? "Hide users" : "Show users"}
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions preview */}
                                <div className="px-6 pb-5 pt-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Key Permissions
                                        </h4>
                                        <span className="text-xs text-gray-400">
                                            {role.permissionsCount || 0} total
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {role.permissions && role.permissions.length > 0 ? (
                                            <>
                                                {role.permissions.slice(0, 3).map((permission, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center text-sm px-3 py-2 rounded-lg bg-[rgb(var(--background-light))] border border-gray-200"
                                                    >
                                                        <span
                                                            className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                                                            style={{ backgroundColor: role.color }}
                                                        ></span>
                                                        <span className="truncate text-gray-700 font-medium">{permission}</span>
                                                    </div>
                                                ))}
                                                {role.permissions.length > 3 && (
                                                    <div className="text-xs text-center text-gray-500 pt-1">
                                                        +{role.permissions.length - 3} more permissions
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="text-gray-400 text-sm">No permissions assigned</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add this section below the permissions preview */}
                                {expandedRoles[role.id] && (
                                    <div className="px-6 pb-4">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            Assigned Users
                                        </h4>
                                        {!roleUsersData[role.id] && expandedRoles[role.id] ? (
                                            <div className="flex justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                            </div>
                                        ) : roleUsersData[role.id]?.length ? (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {roleUsersData[role.id]?.map((user) => (
                                                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                                                        {user.avatar ? (
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <LucideUser className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-500">No users assigned to this role</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="mt-auto px-6 pb-6 pt-4 border-t border-gray-200 flex gap-3">
                                    <button
                                        onClick={() => handleManagePermissions(role)}
                                        className="flex-1 text-sm font-medium flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        style={{
                                            color: role.color,
                                            backgroundColor: `${role.color}08`,
                                            border: `1px solid ${role.color}20`,
                                            boxShadow: `0 2px 8px -2px ${role.color}30`
                                        }}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Details</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Pagination */}
                <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
                        <button
                            onClick={goToPrevPage}
                            disabled={pagination.current_page === 1 || rolesLoading}
                            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>

                        <button
                            onClick={goToNextPage}
                            disabled={pagination.current_page === pagination.last_page || rolesLoading}
                            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Modals */}
            <RoleModel isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />

            {selectedRole && (
                <EditRoleModel
                    key={selectedRole.id}
                    isModalOpen={isEditModalOpen}
                    setIsModalOpen={setIsEditModalOpen}
                    id={parseInt(selectedRole.id)}
                    initialData={{
                        name: selectedRole.title,
                        slug: selectedRole.slug,
                        color: selectedRole.color,
                        permissions: selectedRole.permissions || []
                    }}
                />
            )}

            {roleToDelete && (
                <DeleteRoleModel
                    isDeleteModalOpen={isDeleteModalOpen}
                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                    id={roleToDelete.id}
                    roleName={roleToDelete.name}
                />
            )}

            {selectedRoleForPermissions && (
                <ManagePermissionModel
                    isModalOpen={isManagePermissionsOpen}
                    setIsModalOpen={setIsManagePermissionsOpen}
                    roleId={selectedRoleForPermissions.id}
                    currentPermissions={selectedRoleForPermissions.permissions}
                    roleColor={selectedRoleForPermissions.color}
                    onSuccess={() => {
                        loadRoles(pagination.current_page);
                        loadPermissions();
                    }}
                />
            )}

            {selectedRoleForUsers && (
                <ManageUserRoleModel
                    isModalOpen={isManageUsersOpen}
                    setIsModalOpen={setIsManageUsersOpen}
                    roleId={selectedRoleForUsers.id}
                    currentUsers={selectedRoleForUsers.currentUsers}
                    roleColor={selectedRoleForUsers.color}
                    onSuccess={() => {
                        loadRoles(pagination.current_page);
                    }}
                />
            )}


        </div>
    );
};

export default Role;