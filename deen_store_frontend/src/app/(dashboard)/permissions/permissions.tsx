'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Download, Edit, Trash2, RefreshCw } from 'lucide-react';
import Table from '@/components/ui/table/Table';
import Button from '@/components/ui/buttons/button';
import { motion } from 'framer-motion';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import PermissionChart from './PermissionChart';
import PermissionsModel from './models/PermissionsModel';
import SearchBar from '@/components/ui/search/SearchBar';
import { usePermission } from '@/hooks/permissions/usePermission';
import Spinner from '@/components/ui/spinner/Spinner';
import { ExtendedPermission } from '@/types/ui';
import api from '@/services/api';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const Permission = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const {
        permissions,
        loading,
        error,
        loadPermissions,
        currentPage,
        lastPage,
        total,
        exportToExcel
    } = usePermission();


    const handleExportClick = async () => {
        console.log('Export initiated');
        try {
          await exportToExcel(); // This now directly triggers the download
          console.log('Export completed successfully');
        } catch (error) {
          console.error('Export failed:', error);
          // Fallback to direct download
          window.open(`${api.defaults.baseURL}/permissions/export`, '_blank');
        }
      };

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    // Type the permission parameter and cast permissions to ExtendedPermission[]
    const filteredPermissions = (permissions as ExtendedPermission[]).filter(perm =>
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (perm.roles && perm.roles.some(role =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );

    const getColorForRole = (roleName: string) => {
        const roleColors: Record<string, string> = {
            'super admin': '#8B5CF6',    // Purple
            'admin': '#EF4444',          // Red
            'vendor admin': '#F59E0B',         // Amber
            'customer': '#3B82F6',        // Blue
            'product admin': '#10B981',         // Emerald
            'order admin': '#6B7280',         // Gray
            'delivery manager': '#8B5CE7',
            'store admin': '#e36414',
            'default': '#9e0059'       // Default purple
        };

        // Convert to lowercase for case-insensitive matching
        const lowerCaseRole = roleName.toLowerCase();
        return roleColors[lowerCaseRole] || roleColors['default'];
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[rgb(var(--background))] min-h-screen relative">
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
                    <Button
                        onClick={() => setIsModalOpen(true)}
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
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip content="Refresh">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => loadPermissions()}
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
                        headers={['Name', 'Roles', 'Slug', 'Last Modified', 'Actions']}
                        data={filteredPermissions.map(perm => {
                            return {
                                name: (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                                            backgroundColor: '#8B5CF6' // Fixed color for permission dot
                                        }}></div>
                                        <span className="font-medium text-[rgb(var(--foreground))]">
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
                                                            backgroundColor: `${roleColor}15`, // 15% opacity
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
                                'last modified': (
                                    <span className="text-sm text-gray-500">
                                        {perm.updated_at ? new Date(perm.updated_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                ),
                                actions: (
                                    <div className="flex gap-2">
                                        <Tooltip content="Edit permission">
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-500">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Delete permission">
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
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

            <PermissionsModel isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>
    );
};

export default Permission;