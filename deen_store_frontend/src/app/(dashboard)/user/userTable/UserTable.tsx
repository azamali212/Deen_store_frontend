'use client'
// components/user/UserTable.tsx
import Table from '@/components/ui/table/Table';
import { useUser } from '@/hooks/user/useUser';
import { Check, RefreshCw, X, Plus, Trash2, Edit, Table2, Grid, Eye, ChevronDown, Ellipsis, EyeIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/buttons/button';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/spinner/Spinner';
import ConfirmationDialog from '@/components/ui/dialog/ConfirmationDialog';
import { toast } from 'react-toastify';
import UserCardView from './UserCardView';
import ShowUserModel from '../model/ShowUserModel';
import { CustomSwitch } from '@/components/ui/switchToggle/CustomSwitch';



interface UserTableProps {
    onOpenRecycleBin?: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ onOpenRecycleBin }) => {
    const { users, loading, error, loadUsers, pagination, deleteUser, loadDeletedUsers, deactivateUser, activateUser } = useUser();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isShowUserModalOpen, setIsShowUserModalOpen] = useState(false);

    //Set status action and reason for user activation/deactivation
    const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null);
    const [reason, setReason] = useState('');
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    // Handle status change confirmation
    const handleStatusChange = async () => {
        if (!selectedUser || !statusAction) {
            toast.error('No user selected for status change');
            return;
        }

        // Check if we're using a temporary ID
        if (selectedUser.id.startsWith('temp-')) {
            toast.error('Cannot change status - invalid user ID');
            setIsStatusDialogOpen(false);
            return;
        }

        setProcessingUserId(selectedUser.id);

        try {
            let result;
            if (statusAction === 'deactivate') {
                if (!reason.trim()) {
                    toast.error('Please provide a deactivation reason');
                    return;
                }
                result = await deactivateUser(selectedUser.id, reason);
            } else {
                result = await activateUser(selectedUser.id, reason);
            }

            if (result.success) {
                toast.success(result.message);
                loadUsers(currentPage, searchQuery);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An error occurred while updating user status');
        } finally {
            setProcessingUserId(null);
            setIsStatusDialogOpen(false);
            setReason('');
        }
    };


    //Handle Show User Model 

    const handleShowUser = (user: any) => {
        setSelectedUser(user);
        setIsShowUserModalOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        const result = await deleteUser(userId);
        if (result.success) {
            toast.success(result.message, {
                icon: <Trash2 className="text-purple-500" />,
            });

            const row = document.getElementById(`user-row-${userId}`);
            const recycleBinBtn = document.querySelector('[data-recycle-bin]');

            if (row && recycleBinBtn) {
                const flyingTrash = document.createElement('div');
                flyingTrash.className = 'fixed z-50 pointer-events-none';
                flyingTrash.style.zIndex = '9999';
                flyingTrash.innerHTML = `
                    <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-white" />
                    </div>
                `;
                document.body.appendChild(flyingTrash);

                const rowRect = row.getBoundingClientRect();
                const binRect = recycleBinBtn.getBoundingClientRect();

                const translateX = binRect.left + (binRect.width / 2) - (rowRect.left + (rowRect.width / 2));
                const translateY = binRect.top + (binRect.height / 2) - rowRect.top;

                flyingTrash.style.position = 'fixed';
                flyingTrash.style.left = `${rowRect.left + rowRect.width / 2 - 16}px`;
                flyingTrash.style.top = `${rowRect.top}px`;

                flyingTrash.style.transition = 'all 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
                flyingTrash.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.5)`;
                flyingTrash.style.opacity = '0';

                setTimeout(() => {
                    flyingTrash.remove();
                    loadUsers();
                    loadDeletedUsers();
                }, 800);

                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(30px)';
                setTimeout(() => {
                    row.style.display = 'none';
                }, 300);
            } else {
                loadUsers();
                loadDeletedUsers();
            }
        } else {
            toast.error(result.message);
        }
    };

    const allUsers = [...users];
    const totalItems = allUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

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

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            'active': '#10B981',
            'inactive': '#EF4444',
            'pending': '#F59E0B',
            'suspended': '#6B7280',
            'default': '#9e0059'
        };
        const lowerCaseStatus = status.toLowerCase();
        return statusColors[lowerCaseStatus] || statusColors['default'];
    };

    useEffect(() => {
        loadUsers(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'table' ? 'card' : 'table');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const toggleUserSelection = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id)
                ? prev.filter(userId => userId !== id)
                : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            setSelectedUsers([]);
            loadUsers();
            toast.success(`${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} deleted successfully`);
        } catch (error) {
            toast.error('Failed to delete users');
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setIsBulkDeleteConfirmOpen(false);
        }
    };

    const handleEditUser = (id: string) => {
        console.log("Edit user", id);
    };

    // Updated roles custom renderer with dropdown for multiple roles
    const renderRoles = (roles: any[]) => {
        // Safeguard against undefined or empty roles array
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            return (
                <span className="text-xs text-gray-400 italic">No roles assigned</span>
            );
        }

        const primaryRole = roles[0];
        // Check if primaryRole exists and has a name property
        if (!primaryRole || !primaryRole.name) {
            return (
                <span className="text-xs text-gray-400 italic">Invalid role data</span>
            );
        }
        const roleColor = getColorForRole(primaryRole.name);

        return (
            <div className="flex items-center gap-2">
                {/* Primary Role Badge */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                >
                    <span
                        className="px-3 py-1.5 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 transition-all duration-200"
                        style={{
                            backgroundColor: `${roleColor}15`,
                            color: roleColor,
                            border: `1px solid ${roleColor}30`,
                        }}
                    >
                        {primaryRole.name}
                    </span>
                </motion.div>
            </div>
        );
    };

    const customRenderers = {
        status: (value: string, row: any) => {
            // First, verify we have valid data
            if (!row) {
                console.error('Row data is undefined', { value, row });
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">Data Error</span>
                    </div>
                );
            }
    
            const isActive = value === 'active';
    
            // Get the user ID - handle both direct ID and nested user object
            const userId = row.id 
                ? row.id.replace('user-row-', '')
                : row.user?.id;
    
            if (!userId) {
                console.error('Could not extract user ID from:', row);
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">ID Error</span>
                    </div>
                );
            }
    
            const handleToggle = (isSelected: boolean) => {
                const user = users.find(u => u.id === userId);
                if (!user) {
                    toast.error(`User with ID ${userId} not found`);
                    return;
                }
                
                setSelectedUser(user);
                setStatusAction(isSelected ? 'activate' : 'deactivate');
                setIsStatusDialogOpen(true);
            };
    
            return (
                <div className="flex items-center gap-2">
                    <CustomSwitch
                        isSelected={isActive}
                        onToggle={handleToggle}
                        disabled={processingUserId === userId}
                    />
                </div>
            );
        },
        roles: renderRoles,
        last_login: (value: string) => (
            <span className="text-sm text-gray-600">
                {value ? formatDate(value) : 'Never logged in'}
            </span>
        ),
    };

    const headers = [
        'select',
        'Name',
        'Status',
        'Roles',
        'last_login',
        'Location',
        'actions',
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdowns = document.querySelectorAll('.user-actions-dropdown');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(event.target as Node)) {
                    dropdown.classList.add('hidden');
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const tableData = users.map(user => ({
        id: `user-row-${user.id}`,
        user: user,
        select: (
            <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUserSelection(user.id)}
                className="h-3 w-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
        ),
        name: (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className={`font-medium text-gray-900 ${selectedUsers.includes(user.id) ? 'text-purple-600' : ''}`}>
                        {user.name}
                    </span>
                    <span className="text-xs text-gray-500">@{user.username}</span>
                </div>
            </div>
        ),
        status: user.status,
        roles: user.roles,
        last_login: user.last_login_at,
        created_at: user.created_at,
        location: user.location,
        actions: (
            <div className="flex gap-2">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            const dropdown = document.getElementById(`user-actions-${user.id}`);
                            const isHidden = dropdown?.classList.contains('hidden');
                            // Close all other dropdowns first
                            document.querySelectorAll('.user-actions-dropdown').forEach(el => {
                                if (el.id !== `user-actions-${user.id}`) {
                                    el.classList.add('hidden');
                                }
                            });
                            // Toggle current dropdown
                            if (dropdown) {
                                dropdown.classList.toggle('hidden', !isHidden);
                            }
                        }}
                    >
                        <Ellipsis className="w-4 h-4" />
                    </Button>

                    <div
                        id={`user-actions-${user.id}`}
                        className="hidden user-actions-dropdown absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="py-1">
                            <ConfirmationDialog
                                title="Move to Recycle Bin?"
                                description="This user will be moved to the recycle bin and can be restored within 30 days."
                                onConfirm={() => handleDeleteUser(user.id)}
                                trigger={
                                    <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete User</span>
                                    </button>
                                }
                            />
                            <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleEditUser(user.id)}
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit User</span>
                            </button>
                            <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleShowUser(user)}
                            >
                                <EyeIcon className="h-4 w-4" />
                                <span>View Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }));

    return (
        <div className="mt-6 bg-white min-h-screen relative rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Add the ShowUserModel at the bottom of your component */}
            <ConfirmationDialog
                isOpen={isStatusDialogOpen}
                onClose={() => {
                    setIsStatusDialogOpen(false);
                    setReason('');
                }}
                onConfirm={handleStatusChange}
                title={`${statusAction === 'deactivate' ? 'Deactivate' : 'Activate'} User?`}
                description={
                    selectedUser?.id?.startsWith('temp-')
                        ? 'Cannot proceed - invalid user ID detected'
                        : statusAction === 'deactivate'
                            ? 'Please provide a reason for deactivating this user:'
                            : 'Please provide a reason for activating this user (optional):'
                }
                confirmText={statusAction === 'deactivate' ? 'Deactivate' : 'Activate'}
                destructive={statusAction === 'deactivate'}
                loading={processingUserId === selectedUser?.id}
                disableConfirm={selectedUser?.id?.startsWith('temp-')}
            >
                {selectedUser?.id?.startsWith('temp-') ? (
                    <div className="text-red-500 p-2 bg-red-50 rounded">
                        This user has an invalid ID and cannot be modified
                    </div>
                ) : statusAction === 'deactivate' ? (
                    <textarea
                        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Reason for deactivation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                ) : (
                    <textarea
                        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Reason for activation (optional)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                )}
            </ConfirmationDialog>

            {selectedUser && (
                <ShowUserModel
                    user={{
                        user_id: selectedUser.id,
                        user_name: selectedUser.name,
                        email: selectedUser.email,
                        phone: selectedUser.phone,
                        location: selectedUser.location,
                        avatar: selectedUser.avatar,
                        bio: selectedUser.bio,
                        address: selectedUser.address,
                        roles: selectedUser.roles?.map((r: any) => r.name) || [],
                        status: selectedUser.status,
                        created_at: selectedUser.created_at,
                        updated_at: selectedUser.updated_at,
                        last_login_at: selectedUser.last_login_at,
                        roles: selectedUser.roles || [], // Pass full roles array with permissions
                        permissions: selectedUser.permissions || [] // Pass direct permissions

                    }}
                    isModalOpen={isShowUserModalOpen}
                    setIsModalOpen={setIsShowUserModalOpen}
                    onDelete={handleDeleteUser}
                    isDeleting={isDeleting}
                    permissions={selectedUser.permissions || []}
                />
            )}

            <ConfirmationDialog
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title={selectedUsers.length > 1
                    ? `Delete ${selectedUsers.length} Users?`
                    : 'Delete User?'}
                description={selectedUsers.length > 1
                    ? `This will permanently remove ${selectedUsers.length} selected users from the system.`
                    : 'This user will be permanently removed from the system.'}
                confirmText="Delete"
                destructive
                loading={isDeleting}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white rounded-xl"
            >
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                        <h2 className="text-xl font-semibold text-gray-900">
                            User Management <span className="text-gray-500">{pagination.total > 0 && `(${pagination.total})`}</span>
                        </h2>
                        {selectedUsers.length > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {selectedUsers.length} selected
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
                                    loadUsers();
                                    setSelectedUsers([]);
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
                                onClick={() => console.log("Export users")}
                            >
                                <ArrowUpTrayIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Import data">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => console.log("Import users")}
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content={viewMode === 'table' ? 'Card view' : 'Table view'}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-purple-500"
                                onClick={toggleViewMode}
                            >
                                {viewMode === 'table' ? (
                                    <Grid className="w-4 h-4" />
                                ) : (
                                    <Table2 className="w-4 h-4" />
                                )}
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
                ) : viewMode === 'card' ? (
                    <UserCardView
                        users={users.map(user => ({
                            ...user,
                            email_verified_at: user.email_verified_at || undefined,
                            last_login_at: user.last_login_at || undefined,
                            location: user.location || undefined
                        }))}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        getColorForRole={getColorForRole}
                        getStatusColor={getStatusColor}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                    />
                ) : (
                    <Table
                        title="Users"
                        headers={headers}
                        data={tableData}
                        customRender={customRenderers}
                        externalPagination={true}
                        currentPage={currentPage}
                        totalPages={pagination?.last_page || 1}
                        onPageChange={handlePageChange}
                        externalSearch={true}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        loading={loading}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default UserTable;