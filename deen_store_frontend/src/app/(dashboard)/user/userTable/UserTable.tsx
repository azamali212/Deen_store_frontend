// components/user/UserTable.tsx
import Table from '@/components/ui/table/Table';
import { useUser } from '@/hooks/user/useUser';
import { Check, RefreshCw, X, Plus, Trash2, Edit, Table2, Grid } from 'lucide-react';
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

interface UserTableProps {
    onOpenRecycleBin?: () => void;  // Add this interface
}

const UserTable: React.FC<UserTableProps> = ({ onOpenRecycleBin }) => {
    const { users, loading, error, loadUsers, pagination, deleteUser } = useUser();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [itemsPerPage, setItemsPerPage] = useState(8);

    // Enhanced delete handler with animation
   // Add these imports at the top


// Inside your UserTable component, modify the handleDeleteUser function:
const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
        toast.success(result.message, {
            icon: <Trash2 className="text-purple-500" />,
        });

        // Get the row element and recycle bin button
        const row = document.getElementById(`user-row-${userId}`);
        const recycleBinBtn = document.querySelector('[data-recycle-bin]');
        
        if (row && recycleBinBtn) {
            // Get positions for animation
            const rowRect = row.getBoundingClientRect();
            const binRect = recycleBinBtn.getBoundingClientRect();
            
            // Create a flying trash element
            const flyingTrash = document.createElement('div');
            flyingTrash.className = 'fixed z-50 pointer-events-none';
            flyingTrash.innerHTML = `
                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                </div>
            `;
            document.body.appendChild(flyingTrash);
            
            // Set initial position
            flyingTrash.style.left = `${rowRect.left + rowRect.width/2 - 16}px`;
            flyingTrash.style.top = `${rowRect.top}px`;
            
            // Animate to recycle bin
            flyingTrash.style.transition = 'all 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            flyingTrash.style.transform = `translate(
                ${binRect.left + binRect.width/2 - (rowRect.left + rowRect.width/2)}px,
                ${binRect.top + binRect.height/2 - rowRect.top}px
            ) scale(0.5)`;
            flyingTrash.style.opacity = '0';
            
            // Remove after animation and refresh
            setTimeout(() => {
                flyingTrash.remove();
                loadUsers();
            }, 800);
            
            // Also animate the row
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '0';
            row.style.transform = 'translateX(30px)';
        } else {
            // Fallback if positions can't be calculated
            loadUsers();
        }
    } else {
        toast.error(result.message);
    }
};

    const allUsers = [...users];
    const totalItems = allUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const currentUsers = allUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
            // Add your delete logic here
            // await deleteMultipleUsers(selectedUsers);
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



    // Custom renderers using the exact property names from the data
    const customRenderers = {
        status: (value: string) => {
            const statusColor = getStatusColor(value);
            return (
                <span
                    className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                    style={{
                        backgroundColor: `${statusColor}15`,
                        color: statusColor
                    }}
                >
                    {value}
                </span>
            );
        },
        email: (emailObj: { address: string, verified: boolean }) => {
            return (
                <div className="flex flex-col gap-1">
                    <a
                        href={`mailto:${emailObj.address}`}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors"
                    >
                        {emailObj.address}
                    </a>
                    <div className="flex items-center gap-1">
                        {emailObj.verified ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <Check className="w-3 h-3" />
                                Verified
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <X className="w-3 h-3" />
                                Unverified
                            </span>
                        )}
                    </div>
                </div>
            );
        },
        roles: (roles: any[]) => (
            <div className="flex flex-wrap gap-1">
                {roles?.map((role, i) => {
                    const roleColor = getColorForRole(role.name);
                    return (
                        <span
                            key={i}
                            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                            style={{
                                backgroundColor: `${roleColor}15`,
                                color: roleColor
                            }}
                        >
                            {role.name}
                        </span>
                    );
                })}
            </div>
        ),
        last_login: (value: string) => (
            <span className="text-sm text-gray-600">
                {value ? formatDate(value) : 'Never logged in'}
            </span>
        ),
        created_at: (value: string) => (
            <span className="text-sm text-gray-600">
                {formatDate(value)}
            </span>
        )
    };

    const headers = [
        'select',
        'Name',
        'Email',
        'Status',
        'Roles',
        'last_login',
        'created_at',
        'Location',
        'actions',
    ];

    const tableData = users.map(user => ({
        select: (
            <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUserSelection(user.id)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
        ),
        name: (
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-purple-500"></div>
                <span className={`font-medium text-[rgb(var(--foreground))] ${selectedUsers.includes(user.id) ? 'text-purple-600' : ''}`}>
                    {user.name}
                </span>
            </div>
        ),
        email: {
            address: user.email,
            verified: !!user.email_verified_at
        },
        status: user.status,
        roles: user.roles,
        last_login: user.last_login_at,
        created_at: user.created_at,
        location: user.location,

        actions: (
            <div className="flex gap-2">
                <Tooltip content="Edit user">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-purple-500"
                        onClick={() => console.log("Edit user", user.id)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </Tooltip>
                <Tooltip content="Delete user">
                    <ConfirmationDialog
                        title="Move to Recycle Bin?"
                        description="This user will be moved to the recycle bin and can be restored within 30 days."
                        onConfirm={() => handleDeleteUser(user.id)}
                        trigger={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        }
                    />
                </Tooltip>

            </div>
        )
    }));

    return (
        <div className="mt-6 bg-[rgb(var(--background))] min-h-screen relative">
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
                className="bg-[rgb(var(--background))] rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                            All Users {pagination.total > 0 && `(${pagination.total})`}
                        </h2>
                        {selectedUsers.length > 0 && (
                            <span className="text-sm text-purple-600">
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