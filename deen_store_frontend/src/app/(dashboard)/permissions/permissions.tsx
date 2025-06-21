'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, Edit, Trash2, RefreshCw } from 'lucide-react';
import Table from '@/components/ui/table/Table';
import Button from '@/components/ui/buttons/button';
import { motion } from 'framer-motion';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import PermissionChart from './PermissionChart';

import SearchBar from '@/components/ui/search/SearchBar';
import { usePermission } from '@/hooks/permissions/usePermission';
import Spinner from '@/components/ui/spinner/Spinner';
import { ExtendedPermission } from '@/types/ui';
import api from '@/services/api';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@/components/ui/dialog/ConfirmationDialog';
import EditPermissionModel from './models/EditPermissionModel';
import PermissionsModel from './models/PermissionsModel';
import { importPermissionsFromExcel } from '@/features/permissions/permissionsSlice';

const Permission = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingPermission, setEditingPermission] = useState<ExtendedPermission | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        permissions,
        loading,
        error,
        successMessage,
        loadPermissions,
        currentPage,
        lastPage,
        total,
        exportToExcel,
        deleteMultiplePermissions,
        clearMessages,
        importFromExcel
    } = usePermission();

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            clearMessages();
        }
        if (error) {
            toast.error(error);
            clearMessages();
        }
    }, [successMessage, error, clearMessages]);

    const handleExportClick = async () => {
        console.log('Export initiated');
        try {
            await exportToExcel();
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            window.open(`${api.defaults.baseURL}/permissions/export`, '_blank');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await importFromExcel(file);
                toast.success('Permissions imported successfully');
                loadPermissions(); // Refresh the list after import
            } catch (error) {
                toast.error(error as string);
            }
        }
    };


    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const togglePermissionSelection = (id: number) => {
        setSelectedPermissions(prev =>
            prev.includes(id)
                ? prev.filter(permId => permId !== id)
                : [...prev, id]
        );
    };

    const handleBulkDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteMultiplePermissions(selectedPermissions);
            if (result.success) {
                toast.success(result.message ||
                    `${result.data.deleted_count} permission${result.data.deleted_count !== 1 ? 's' : ''} deleted`
                );
                setSelectedPermissions([]);
                loadPermissions();
            } else {
                toast.error(result.message || 'Deletion failed');
            }
        } catch (error) {
            toast.error('Failed to delete permissions');
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setIsBulkDeleteConfirmOpen(false);
        }
    };

    const filteredPermissions = (permissions as ExtendedPermission[]).filter(perm =>
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (perm.roles && perm.roles.some(role =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );

    const getColorForRole = (roleName: string) => {
        const roleColors: Record<string, string> = {
            'super admin': '#8B5CF6',
            'admin': '#EF4444',
            'vendor admin': '#F59E0B',
            'customer': '#3B82F6',
            'product admin': '#10B981',
            'order admin': '#6B7280',
            'delivery manager': '#8B5CE7',
            'store admin': '#e36414',
            'default': '#9e0059'
        };
        const lowerCaseRole = roleName.toLowerCase();
        return roleColors[lowerCaseRole] || roleColors['default'];
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    const handleEditClick = (permission: ExtendedPermission) => {
        setEditingPermission(permission);
        setEditModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[rgb(var(--background))] min-h-screen relative">
            <ConfirmationDialog
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDeleteConfirm}
                title={selectedPermissions.length > 1
                    ? `Delete ${selectedPermissions.length} Permissions?`
                    : 'Delete Permission?'}
                description={selectedPermissions.length > 1
                    ? `This will permanently remove ${selectedPermissions.length} selected permissions from the system.`
                    : 'This permission will be permanently removed from the system.'}
                confirmText="Delete"
                destructive
                loading={isDeleting}
            />

            {/* Header Section */}
            <motion.div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                            Permission Management
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-2 ml-5">
                        Configure access levels and permissions across your platform
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {selectedPermissions.length > 0 && (
                        <Button
                            onClick={() => setIsBulkDeleteConfirmOpen(true)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl px-5 py-3 group"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="whitespace-nowrap font-medium">
                                Delete Selected ({selectedPermissions.length})
                            </span>
                        </Button>
                    )}
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl w-full sm:w-auto px-5 py-3 group"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        <span className="whitespace-nowrap font-medium">Create Permission</span>
                    </Button>
                </div>
            </motion.div>

            {/* Charts Section */}
            <PermissionChart />

            {/* Permissions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-[rgb(var(--background))] rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                            All Permissions {total > 0 && `(${total})`}
                        </h2>
                        {selectedPermissions.length > 0 && (
                            <span className="text-sm text-purple-600">
                                {selectedPermissions.length} selected
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip content="Refresh">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    loadPermissions();
                                    setSelectedPermissions([]);
                                }}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Export data">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={handleExportClick}
                            >
                                <ArrowUpTrayIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Import data">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        {error}
                    </div>
                ) : (
                    <Table
                        externalPagination={false}
                        externalSearch={true}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        headers={['select', 'Name', 'Roles', 'Slug', 'Actions']}
                        data={filteredPermissions.map(perm => {
                            const isSelected = selectedPermissions.includes(perm.id);
                            return {
                                select: (
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => togglePermissionSelection(perm.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                ),
                                name: (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                                            backgroundColor: '#8B5CF6'
                                        }}></div>
                                        <span className={`font-medium text-[rgb(var(--foreground))] ${isSelected ? 'text-purple-600' : ''}`}>
                                            {perm.name}
                                        </span>
                                    </div>
                                ),
                                roles: (
                                    <div className="flex flex-wrap gap-1">
                                        {perm.roles?.length ? (
                                            perm.roles.map(role => {
                                                const roleColor = getColorForRole(role.name);
                                                return (
                                                    <span
                                                        key={role.id}
                                                        className="px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{
                                                            backgroundColor: `${roleColor}15`,
                                                            color: roleColor
                                                        }}
                                                    >
                                                        {role.name}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-xs text-gray-400">No roles assigned</span>
                                        )}
                                    </div>
                                ),
                                slug: (
                                    <span className="text-sm text-gray-600 font-mono">{perm.slug || 'N/A'}</span>
                                ),
                                actions: (
                                    <div className="flex gap-2">
                                        <Tooltip content="Edit permission">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(perm)}
                                                className="text-gray-500 hover:text-purple-500"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Delete permission">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (selectedPermissions.length === 0 || !selectedPermissions.includes(perm.id)) {
                                                        setSelectedPermissions([perm.id]);
                                                    }
                                                    setIsBulkDeleteConfirmOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                )
                            };
                        })}
                    />
                )}
            </motion.div>

            <PermissionsModel
                isModalOpen={createModalOpen}
                setIsModalOpen={setCreateModalOpen}
            />

            <EditPermissionModel
                isModalOpen={editModalOpen}
                setIsModalOpen={setEditModalOpen}
                permissionToEdit={editingPermission}
                onSuccess={() => {
                    setEditModalOpen(false);
                    loadPermissions();
                }}
            />
        </div>
    );
};

export default Permission;