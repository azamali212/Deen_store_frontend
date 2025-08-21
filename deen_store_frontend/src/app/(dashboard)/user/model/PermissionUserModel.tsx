"use client";
import React, { useState } from 'react';
import { X, Save, Shield, Check } from 'lucide-react';
import Model from '@/components/ui/modals/model';
import Button from '@/components/ui/buttons/button';
import Spinner from '@/components/ui/spinner/Spinner';
import { toast } from 'react-toastify';

interface Permission {
  id: string | number;
  name: string;
  description?: string;
}

interface UserType {
  user_id: string;
  user_name: string;
  email: string;
  permissions?: Permission[];
}

interface PermissionUserModel {
  user: UserType;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  permissions: Permission[];
  onSave?: (userId: string, permissionIds: (string | number)[]) => Promise<void>;
  isSaving?: boolean;
}

const PermissionUserModel: React.FC<PermissionUserModel> = ({
  user,
  isModalOpen,
  setIsModalOpen,
  permissions,
  onSave,
  isSaving = false
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<(string | number)[]>(
    user.permissions?.map(p => p.id) || []
  );
  const [pendingChanges, setPendingChanges] = useState(0);

  const handlePermissionToggle = (permissionId: string | number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
    setPendingChanges(prev => prev + 1);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(user.user_id, selectedPermissions);
        setPendingChanges(0);
        toast.success('Permissions updated successfully');
      } catch (error) {
        toast.error('Failed to update permissions');
      }
    }
  };

  const handleClose = () => {
    // Reset changes when closing
    setSelectedPermissions(user.permissions?.map(p => p.id) || []);
    setPendingChanges(0);
    setIsModalOpen(false);
  };

  const permissionCategories = {
    'User Management': permissions.filter(p => p.name.toLowerCase().includes('user')),
    'Content Management': permissions.filter(p => p.name.toLowerCase().includes('content') || p.name.toLowerCase().includes('post')),
    'System': permissions.filter(p => !p.name.toLowerCase().includes('user') && !p.name.toLowerCase().includes('content') && !p.name.toLowerCase().includes('post'))
  };

  return (
    <Model
      isOpen={isModalOpen}
      onClose={handleClose}
      title="Manage User Permissions"
      size="lg"
      className="fixed right-0 top-0 h-full w-full min-h-screen bg-white shadow-2xl border-l border-gray-200 transition-all duration-300 ease-in-out"
      showFooter={false}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Manage Permissions - {user.user_name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Manage direct permissions for this user
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
              categoryPermissions.length > 0 && (
                <div key={category} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-600" />
                    {category} Permissions
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {categoryPermissions.map(permission => (
                      <label key={permission.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                          selectedPermissions.includes(permission.id)
                            ? 'bg-violet-600 border-violet-600'
                            : 'bg-white border-gray-300'
                        }`}>
                          {selectedPermissions.includes(permission.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                          {permission.description && (
                            <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
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
              <span className="text-sm text-gray-500">No changes made</span>
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

export default PermissionUserModel;