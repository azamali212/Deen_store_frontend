"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, X, Plus, Users, Shield, Check, ChevronDown, ChevronUp,
    UserCheck, UserX, AlertCircle, Loader2, Filter, Mail
} from 'lucide-react';
import Model from '@/components/ui/modals/model';
import Button from '@/components/ui/buttons/button';
import Spinner from '@/components/ui/spinner/Spinner';
import { toast } from 'react-toastify';
import Badge from '@/components/ui/badge/badge';
import { useUser } from '@/hooks/user/useUser';
import { useRole } from '@/hooks/role/useRole';


interface Role {
    id: string | number;
    name: string;
    description?: string;
    users_count?: number;
}

interface User {
    user_id: string;
    user_name: string;
    email: string;
    status: string;
    roles?: (Role | string)[];
}

interface RoleUserModelProps {
    role: Role | null;
    allUsers: User[];
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    user: User;
    onSave?: (userId: string, roles: string[], sync?: boolean) => Promise<void>;
    isSaving?: boolean;
    allRoles?: Role[];
}

const RoleUserModel: React.FC<RoleUserModelProps> = ({
    isModalOpen,
    setIsModalOpen,
    user,
    onSave,
    allRoles = [],
    isSaving = false,
}) => {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isSync, setIsSync] = useState(true);
    const [userCurrentRoles, setUserCurrentRoles] = useState<string[]>([]);

    // Use your Redux hooks - update to use syncRoles instead of assignRoles
    const { syncRoles, loading: reduxLoading } = useUser();
    const { loadRoles, roles: rolesFromStore, loading: rolesLoading } = useRole();
    
    // Use passed roles or fetch from store if not provided
    const rolesToUse = allRoles.length > 0 ? allRoles : rolesFromStore;

    // Fetch roles when modal opens
    useEffect(() => {
        if (isModalOpen && rolesToUse.length === 0) {
            loadRoles(1); // Fetch first page of roles
        }
    }, [isModalOpen, loadRoles, rolesToUse.length]);

    // Extract user's current roles
    useEffect(() => {
        if (user && user.roles) {
            const currentRoles = Array.isArray(user.roles) 
                ? user.roles.map((role: Role | string) => typeof role === 'string' ? role : role.name)
                : [];
            setUserCurrentRoles(currentRoles);
            setSelectedRoles(currentRoles);
        } else {
            setUserCurrentRoles([]);
            setSelectedRoles([]);
        }
    }, [user?.roles]);

    // Filter roles based on search and filter
    const filteredRoles = useMemo(() => {
        let result = rolesToUse;

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((role: Role) =>
                role.name.toLowerCase().includes(term) ||
                (role.description && role.description.toLowerCase().includes(term))
            );
        }

        // Apply role filter
        if (roleFilter === 'assigned') {
            result = result.filter((role: Role) => selectedRoles.includes(role.name));
        } else if (roleFilter === 'unassigned') {
            result = result.filter((role: Role) => !selectedRoles.includes(role.name));
        }

        return result;
    }, [rolesToUse, searchTerm, roleFilter, selectedRoles]);

    // Get unique role categories for filtering
    const roleCategories = useMemo(() => {
        return ['all', 'assigned', 'unassigned'];
    }, []);

    const handleRoleToggle = (roleName: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(name => name !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSelectAll = () => {
        if (selectedRoles.length === rolesToUse.length) {
            setSelectedRoles([]);
        } else {
            setSelectedRoles(rolesToUse.map((role: Role) => role.name));
        }
    };

    const handleSave = async () => {
        try {
            if (onSave) {
                await onSave(user.user_id, selectedRoles, isSync);
                toast.success('Roles updated successfully');
            } else {
                // Use Redux syncRoles action directly
                const result = await syncRoles(user.user_id, selectedRoles, isSync);
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to update roles');
            console.error('Error updating roles:', error);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
    };

    const getRoleBadge = (roleName: string) => {
        const roleColors: Record<string, string> = {
            'super admin': 'bg-violet-100 text-violet-800 border border-violet-200',
            'admin': 'bg-red-100 text-red-800 border border-red-200',
            'vendor admin': 'bg-amber-100 text-amber-800 border border-amber-200',
            'customer': 'bg-sky-100 text-sky-800 border border-sky-200',
            'product admin': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
            'order admin': 'bg-slate-100 text-slate-800 border border-slate-200',
            'delivery manager': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
            'store admin': 'bg-orange-100 text-orange-800 border border-orange-200',
            'content manager': 'bg-pink-100 text-pink-800 border border-pink-200',
            'support agent': 'bg-cyan-100 text-cyan-800 border border-cyan-200',
            'analytics viewer': 'bg-purple-100 text-purple-800 border border-purple-200',
            'moderator': 'bg-lime-100 text-lime-800 border border-lime-200',
            'default': 'bg-gray-100 text-gray-800 border border-gray-200'
        };

        const lowerCaseRole = roleName.toLowerCase();
        const colorClass = roleColors[lowerCaseRole] || roleColors['default'];

        return (
            <Badge className={`${colorClass} capitalize px-2.5 py-1 rounded-full text-xs font-medium`}>
                {roleName}
            </Badge>
        );
    };

    const isLoading = isSaving || reduxLoading || rolesLoading;

    return (
        <Model
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Manage User Roles"
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

                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">Manage Roles for {user?.user_name || 'User'}</h1>
                            
                            {/* Show email and role information */}
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 opacity-80" />
                                <span className="text-white/90 text-sm">
                                    {user?.email || 'No email provided'}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                                {userCurrentRoles.length > 0 ? (
                                    userCurrentRoles.map((role, index) => (
                                        <div key={index} className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium">
                                            {role}
                                        </div>
                                    ))
                                ) : (
                                    // Show "No Role Assigned" when no roles are assigned
                                    <div className="flex flex-col gap-1">
                                        <div className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium inline-flex">
                                            No Role Assigned
                                        </div>
                                        {user?.email && (
                                            <div className="text-white/70 text-xs flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Sync Option */}
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-violet-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSync}
                                        onChange={(e) => setIsSync(e.target.checked)}
                                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Sync Roles (Replace all existing roles with selected ones)
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    When enabled, this will remove all current roles and assign only the selected ones.
                                    When disabled, selected roles will be added to existing roles.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Filter className="w-4 h-4" />
                                <span>Filter:</span>
                            </div>
                            {roleCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setRoleFilter(category)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${roleFilter === category
                                        ? 'bg-violet-100 text-violet-700 font-medium'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category === 'all' ? 'All Roles' :
                                     category === 'assigned' ? 'Assigned' : 'Unassigned'}
                                </button>
                            ))}
                            {(searchTerm || roleFilter !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center gap-1 ml-auto"
                                >
                                    <X className="w-3 h-3" />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Roles List */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Available Roles ({filteredRoles.length})
                                </h3>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                                >
                                    {selectedRoles.length === rolesToUse.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {rolesLoading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Loader2 className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
                                    <p>Loading roles...</p>
                                </div>
                            ) : filteredRoles.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {filteredRoles.map((role: Role) => {
                                        const isSelected = selectedRoles.includes(role.name);
                                        const isCurrentlyAssigned = userCurrentRoles.includes(role.name);
                                        
                                        return (
                                            <div
                                                key={role.id}
                                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-violet-50' : ''}`}
                                                onClick={() => handleRoleToggle(role.name)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? 'bg-violet-600 border-violet-600'
                                                            : 'border-gray-300 hover:border-violet-400'
                                                    }`}>
                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900">{role.name}</span>
                                                            {isCurrentlyAssigned && !isSelected && (
                                                                <Badge className="bg-amber-100 text-amber-800 text-xs">
                                                                    Currently assigned
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {role.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                                                        )}
                                                        {role.users_count !== undefined && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {role.users_count} user{role.users_count !== 1 ? 's' : ''} have this role
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {getRoleBadge(role.name)}
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p>No roles found matching your criteria</p>
                                    <button
                                        onClick={clearFilters}
                                        className="text-violet-600 hover:text-violet-800 mt-2 text-sm font-medium"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Roles Summary */}
                    {selectedRoles.length > 0 && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-green-600" />
                                <div>
                                    <h4 className="font-medium text-green-800">
                                        {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                                    </h4>
                                    <p className="text-sm text-green-600 mt-1">
                                        {isSync ? 'These roles will replace all existing roles' : 'These roles will be added to existing roles'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedRoles.map(roleName => (
                                    <div key={roleName} className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                        {roleName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            <p>
                                User: <span className="font-medium">{user?.user_name || 'Unknown User'}</span>
                            </p>
                            <p className="text-xs">
                                ID: {user?.user_id || 'N/A'}
                            </p>
                        </div>

                        <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full sm:w-auto justify-center text-gray-600 hover:bg-gray-200 px-6 py-3 rounded-lg transition-all border border-gray-300 shadow-sm hover:shadow-md"
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={isLoading || selectedRoles.length === 0}
                                className="w-full sm:w-auto justify-center bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled: cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Spinner size="sm" className="text-white" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                                        <UserCheck className="w-4 h-4 flex-shrink-0" />
                                        <span>Save Roles</span>
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Model>
    );
};

export default RoleUserModel;