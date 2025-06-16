'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Search } from 'lucide-react';
import { useRole } from '@/hooks/role/useRole';
import Button from '@/components/ui/buttons/button';
import Model from '@/components/ui/modals/model';
import { toast } from 'react-toastify';
import { useUser } from '@/hooks/user/useUser';
import Avatar from '@/components/avatar/Avatar';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ManageUserRoleModelProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  roleId: number;
  currentUsers: User[];
  roleColor: string;
  onSuccess?: () => void;
}

const ManageUserRoleModel: React.FC<ManageUserRoleModelProps> = ({
  isModalOpen,
  setIsModalOpen,
  roleId,
  currentUsers,
  roleColor,
  onSuccess
}) => {
  const {
    users = [],
    loading: userLoading,
    loadUsers,
    pagination
  } = useUser();
  const safeUsers = Array.isArray(users) ? users : [];

  const {
    attachRoleUsers,
    detachRoleUsers,
    loading,
    error,
    successMessage,
    resetRole,
    loadRoleUsers,
    roleUsers
  } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [usersToAdd, setUsersToAdd] = useState<string[]>([]);
  const [usersToRemove, setUsersToRemove] = useState<string[]>([]);

  // Load all users with pagination
  useEffect(() => {
    if (isModalOpen) {
      loadUsers(1, '', pagination);
      loadRoleUsers(roleId);
      setUsersToAdd([]);
      setUsersToRemove([]);
    }
  }, [isModalOpen, roleId]);

  // Filter users based on search query
  const filteredUsers = safeUsers.filter(user =>
    user?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    user?.email?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  // Users who already have the role
  const roleUsersData = Array.isArray(roleUsers?.data) ? roleUsers.data : [];
  const usersWithRole = filteredUsers.filter(user =>
    roleUsersData.some(roleUser => roleUser.id.toString() === user.id)
  );

  // All users without the role
  const usersWithoutRole = filteredUsers.filter(user =>
    !roleUsersData.some(roleUser => roleUser.id.toString() === user.id)
  );

  // Handle success/error states
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      resetRole();
      setIsModalOpen(false);
      onSuccess?.();
    }
    if (error) {
      toast.error(error);
      resetRole();
    }
  }, [successMessage, error, resetRole, setIsModalOpen, onSuccess]);

  // Check if a user is selected
  const isUserSelected = (userId: string) => {
    const hasRole = roleUsersData.some(u => u.id.toString() === userId);
    return hasRole ? !usersToRemove.includes(userId) : usersToAdd.includes(userId);
  };

  const handleUserToggle = (userId: string, isSelected: boolean) => {
    const hasRole = roleUsersData.some(u => u.id.toString() === userId);

    if (hasRole) {
      setUsersToRemove(prev => isSelected ? prev.filter(id => id !== userId) : [...prev, userId]);
    } else {
      setUsersToAdd(prev => isSelected ? [...prev, userId] : prev.filter(id => id !== userId));
    }
  };

  const handleSubmit = async () => {
    try {
      if (usersToRemove.length > 0) await detachRoleUsers(roleId, usersToRemove);
      if (usersToAdd.length > 0) await attachRoleUsers(roleId, usersToAdd);

      if (usersToRemove.length > 0 || usersToAdd.length > 0) {
        onSuccess?.();
        setIsModalOpen(false);
      } else {
        toast.info("No changes to save");
      }
    } catch (err) {
      console.error("Failed to update users:", err);
      toast.error("Failed to update users");
    }
  };

  return (
    <Model
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Manage Role Users"
      size="xl"
      className="fixed right-0 bg-[rgb(var(--foreground))] text-[rgb(var(--text-color))] top-0 min-h-screen rounded-none border-l border-[rgb(var(--muted))]/20"
      showFooter={true}
      footerContent={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-[rgb(var(--muted))]">
            {usersToAdd.length + usersToRemove.length} changes pending
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="text-[rgb(var(--text-color))] hover:bg-[rgb(var(--muted))]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              style={{ backgroundColor: roleColor }}
              disabled={loading || (usersToAdd.length === 0 && usersToRemove.length === 0)}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[rgb(var(--muted))]" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 w-full p-2 rounded-lg border border-[rgb(var(--muted))]/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              '--tw-ring-color': roleColor,
              '--tw-ring-offset-color': 'rgb(var(--background))'
            } as React.CSSProperties}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {userLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: roleColor }} />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-[rgb(var(--text-color))]">
                Users with this role ({usersWithRole.length})
              </h4>
              <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden max-h-96">
                {usersWithRole.length > 0 ? (
                  <ul className="divide-y divide-[rgb(var(--muted))]/10">
                    {usersWithRole.map(user => (
                      <motion.li
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 hover:bg-[rgb(var(--muted))]/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isUserSelected(user.id)}
                            onChange={(e) => handleUserToggle(user.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[rgb(var(--text-color))] truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-[rgb(var(--muted))] truncate">
                              {user.email}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${roleColor}20`,
                              color: roleColor
                            }}
                          >
                            Has role
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-[rgb(var(--muted))]">
                    No users with this role
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-[rgb(var(--text-color))]">
                Available Users ({usersWithoutRole.length})
              </h4>
              <div className="border border-[rgb(var(--muted))]/20 rounded-lg overflow-hidden max-h-96">
                {usersWithoutRole.length > 0 ? (
                  <ul className="divide-y divide-[rgb(var(--muted))]/10 overflow-y-auto max-h-[384px]"> {/* 384px = 24rem = max-h-96 */}
                    {usersWithoutRole.map(user => (
                      <motion.li
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 hover:bg-[rgb(var(--muted))]/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isUserSelected(user.id)}
                            onChange={(e) => handleUserToggle(user.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[rgb(var(--text-color))] truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-[rgb(var(--muted))] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-[rgb(var(--muted))]">
                    No users available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Model>
  );
};

export default ManageUserRoleModel;