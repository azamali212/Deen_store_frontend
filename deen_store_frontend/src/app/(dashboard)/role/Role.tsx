'use client';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { User, ShieldCheck, Stethoscope, UserCog, BriefcaseMedical, Plus, MoreVertical, Edit2, Trash2, Copy, Settings, ChevronDown, ChevronRight } from 'lucide-react';
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


type Role = {
    id: string;
    title: string;
    slug: string;
    userCount: number;
    color: string;
    permissions?: string[];
    permissionsCount?: number;
};

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
        handleSearch,
        isSearching,
        onSearchChange,
        searchQuery
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<{ id: number, name: string } | null>(null);

    const [isManagePermissionsOpen, setIsManagePermissionsOpen] = useState(false);
    const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<{
        id: number;
        permissions: string[];
        color: string;
    } | null>(null);

    const handleManagePermissions = (role: Role) => {
        setSelectedRoleForPermissions({
            id: parseInt(role.id),
            permissions: role.permissions || [],
            color: role.color
        });
        setIsManagePermissionsOpen(true);
    };

    // When clicking delete button:
    const handleDeleteClick = (role: Role) => {
        setRoleToDelete({ id: parseInt(role.id), name: role.title });
        setIsDeleteModalOpen(true);
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

            return {
                id: role?.id?.toString() || Math.random().toString(36).substring(2, 9),
                title: role?.name || role?.title || 'Unnamed Role',
                slug: role?.slug || 'No description available',
                userCount: role?.users_count || role?.users?.length || 0,
                permissionsCount: rolePermissions.length,
                color: color,
                permissions: rolePermissions
            };
        });
    };
    const transformedRoles = useMemo(() => transformRolesData(roles), [roles]);







    const getRoleIcon = (title: string): JSX.Element => {
        const iconMap: Record<string, JSX.Element> = {
            'Super Admin': <ShieldCheck className="w-8 h-8" />,
            'Admin': <ShieldCheck className="w-8 h-8" />,
            'Vendor Admin': <User className="w-8 h-8" />,
            'Customer': <User className="w-8 h-8" />,
            'Delivery Manager': <User className="w-8 h-8" />,
            'System Admin': <ShieldCheck className="w-8 h-8" />,
            'Hospital Admin': <BriefcaseMedical className="w-8 h-8" />,
            'Doctor': <Stethoscope className="w-8 h-8" />,
            'Nurse': <UserCog className="w-8 h-8" />,
            'Staff': <User className="w-8 h-8" />
        };
        return iconMap[title] || <User className="w-8 h-8" />;
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


    //Handlers for Edit and Manage Permissions
    const handleEditClick = (role: Role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
        setActiveDropdown(null);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[rgb(var(--background))] min-h-screen relative">
            {(rolesLoading || permissionsLoading) && (
                <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            <div className="flex flex-col  gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <motion.div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--text-color))]">
                        Role Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage and configure system roles
                    </p>
                </motion.div>
                <motion.div className="flex flex-col md:flex-row items-center  gap-3 w-full md:w-auto">
                    <motion.div className="w-full md:w-64 pt-4">
                        <SearchBar
                            onSearch={onSearchChange}
                            className="w-full"
                        />
                    </motion.div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#f7ebe7' }}
                        className="flex items-center gap-3 bg-[#f7ebe7] hover:bg-[#f7ebe7] text-white rounded-lg transition-colors shadow-md hover:shadow-lg w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="whitespace-nowrap">Add Role</span>
                    </Button>
                </motion.div>
            </div>


            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-10"
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
                <div className="mb-4 text-sm text-[rgb(var(--muted))]">
                    Found {transformedRoles.length} roles matching "{searchQuery}"
                </div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
                {transformedRoles.map((role) => (
                    <motion.div
                        key={role.id}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="h-full relative group"
                    >
                        <div className="h-full p-5 rounded-xl bg-[rgb(var(--card))] shadow-sm hover:shadow-md transition-shadow border border-[rgb(var(--muted))]/20">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div
                                            className="p-2 rounded-lg mr-3"
                                            style={{ backgroundColor: `${role.color}20` }}
                                        >
                                            {React.cloneElement(getRoleIcon(role.title), {
                                                className: "w-6 h-6",
                                                style: { color: role.color }
                                            })}
                                        </div>
                                        <h3 className="text-lg font-semibold text-[rgb(var(--text-color))] truncate">
                                            <Tooltip content={role.title}>
                                                <span>{role.title}</span>
                                            </Tooltip>
                                        </h3>
                                    </div>

                                    <div className="relative">
                                        <button
                                            className="p-1 rounded-full hover:bg-[rgb(var(--muted))]/10 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === role.id ? null : role.id);
                                            }}
                                        >
                                            <MoreVertical className="w-5 h-5 text-[rgb(var(--muted))] hover:text-[rgb(var(--text-color))]" />
                                        </button>

                                        {activeDropdown === role.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[rgb(var(--card))] rounded-lg shadow-lg border border-[rgb(var(--muted))]/20 z-50 overflow-hidden role-dropdown-container"
                                            >
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleEditClick(role)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit Role
                                                    </button>
                                                    <button
                                                        onClick={() => {// Set role ID for deletion
                                                            handleDeleteClick(role);
                                                            setIsDeleteModalOpen(true) // Open confirmation modal
                                                            setActiveDropdown(null); // Close dropdown
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2 inline-block" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-2xl font-bold" style={{ color: role.color }}>
                                        {role.permissionsCount}
                                    </span>
                                    <span className="text-sm ml-2 text-[rgb(var(--muted))]">permissions</span>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-1 text-[rgb(var(--text-color))]">Permissions:</h4>
                                    {role.permissions && role.permissions.length > 0 ? (
                                        <ul className="text-xs space-y-1 max-h-20 overflow-y-auto">
                                            {role.permissions.map((permission, index) => (
                                                <li key={index} className="flex items-center">
                                                    <span
                                                        className="w-2 h-2 rounded-full mr-2"
                                                        style={{ backgroundColor: role.color }}
                                                    ></span>
                                                    <span className="truncate">{permission}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-[rgb(var(--muted))]">No permissions assigned</p>
                                    )}
                                </div>

                                <p className="text-sm text-[rgb(var(--muted))] mb-4 flex-grow line-clamp-3">
                                    {role.slug}
                                </p>

                                <div className="pt-3 border-t border-[rgb(var(--muted))]/20">
                                    <button
                                        onClick={() => handleManagePermissions(role)}
                                        className="text-sm font-medium hover:underline flex items-center gap-1"
                                        style={{ color: role.color }}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className='truncate'>Manage Permissions</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Add Role Modal */}
            <RoleModel isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />

            {/* Edit Role */}

            {selectedRole && (
                <EditRoleModel
                    key={selectedRole.id}
                    isModalOpen={isEditModalOpen}
                    setIsModalOpen={setIsEditModalOpen}
                    id={parseInt(selectedRole.id)}
                    initialData={{
                        name: selectedRole.title,
                        slug: selectedRole.slug, // Changed from slug to description to match your Role type
                        color: selectedRole.color,
                        permissions: selectedRole.permissions || [] // Directly use the string permissions
                    }}
                />
            )}
            {/* Delete Role */}

            {roleToDelete && (
                <DeleteRoleModel
                    isDeleteModalOpen={isDeleteModalOpen}
                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                    id={roleToDelete.id}
                    roleName={roleToDelete.name}
                />
            )}

            {/* Manage Permissions*/}
            {selectedRoleForPermissions && (
                <ManagePermissionModel
                    isModalOpen={isManagePermissionsOpen}
                    setIsModalOpen={setIsManagePermissionsOpen}
                    roleId={selectedRoleForPermissions.id}
                    currentPermissions={selectedRoleForPermissions.permissions}
                    roleColor={selectedRoleForPermissions.color}
                    onSuccess={() => {
                        loadRoles(pagination.current_page); // Refresh roles data
                        loadPermissions(); // Refresh permissions if needed
                    }}
                />
            )}

            <div className="flex justify-center mt-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToPrevPage}
                        disabled={pagination.current_page === 1 || rolesLoading}
                        className="px-4 py-2 rounded-md bg-[rgb(var(--card))] text-[rgb(var(--text-color))] disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-[rgb(var(--text-color))]">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>

                    <button
                        onClick={goToNextPage}
                        disabled={pagination.current_page === pagination.last_page || rolesLoading}
                        className="px-4 py-2 rounded-md bg-[rgb(var(--card))] text-[rgb(var(--text-color))] disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Role;