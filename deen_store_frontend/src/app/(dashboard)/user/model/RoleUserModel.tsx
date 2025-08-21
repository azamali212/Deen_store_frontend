"use client";
import React, { useState } from 'react';
import { X, Search, User, Mail, Plus, Trash2, Save } from 'lucide-react';
import Model from '@/components/ui/modals/model';
import Button from '@/components/ui/buttons/button';
import Spinner from '@/components/ui/spinner/Spinner';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Role {
  id: string | number;
  name: string;
  users: User[];
  permissions?: any[];
}

interface RoleUsersModalProps {
  role: Role;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  allUsers: User[];
  onSave?: (roleId: string | number, userIds: string[]) => Promise<void>;
  isSaving?: boolean;
}

const RoleUsersModal: React.FC<RoleUsersModalProps> = ({
  role,
  isModalOpen,
  setIsModalOpen,
  allUsers,
  onSave,
  isSaving = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>(role.users || []);
  const [availableUsers, setAvailableUsers] = useState<User[]>(allUsers.filter(
    user => !role.users.some(ru => ru.id === user.id)
  ));
  const [pendingChanges, setPendingChanges] = useState(0);

  const handleAddUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setAvailableUsers(prev => prev.filter(u => u.id !== user.id));
    setPendingChanges(prev => prev + 1);
  };

  const handleRemoveUser = (user: User) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    setAvailableUsers(prev => [...prev, user]);
    setPendingChanges(prev => prev + 1);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(role.id, selectedUsers.map(u => u.id));
        setPendingChanges(0);
        toast.success('Role users updated successfully');
      } catch (error) {
        toast.error('Failed to update role users');
      }
    }
  };

  const handleClose = () => {
    // Reset changes when closing
    setSelectedUsers(role.users || []);
    setAvailableUsers(allUsers.filter(user => !role.users.some(ru => ru.id === user.id)));
    setPendingChanges(0);
    setSearchQuery('');
    setIsModalOpen(false);
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // User avatar fallback with initials
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Model
      isOpen={isModalOpen}
      onClose={handleClose}
      title="Manage Role Users"
      size="md"
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 transition-all duration-300 ease-in-out"
      showFooter={false}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {role.name} - Users
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Manage users assigned to this role
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Current Users */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-600" />
              Users with this role ({selectedUsers.length})
            </h3>
            
            {selectedUsers.length > 0 ? (
              <div className="space-y-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(user)}
                      className="text-gray-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50"
                      title="Remove user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No users assigned to this role</p>
              </div>
            )}
          </div>

          {/* Available Users */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-600" />
              Available users ({availableUsers.length})
            </h3>
            
            {filteredAvailableUsers.length > 0 ? (
              <div className="space-y-2">
                {filteredAvailableUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddUser(user)}
                      className="text-gray-400 hover:text-emerald-500 transition-colors p-1 rounded-md hover:bg-emerald-50"
                      title="Add user"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No users found' : 'No available users to add'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            {pendingChanges > 0 ? (
              <span className="text-sm text-gray-500">
                {pendingChanges} change{pendingChanges !== 1 ? 's' : ''} pending
              </span>
            ) : (
              <span className="text-sm text-gray-500">No changes</span>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || pendingChanges === 0}
                className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Model>
  );
};

export default RoleUsersModal;