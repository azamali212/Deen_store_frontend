"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Save, Shield, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
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

interface PermissionUserModelProps {
  user: UserType;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  permissions: Permission[];
  onSave?: (userId: string, permissionIds: (string | number)[]) => Promise<void>;
  isSaving?: boolean;
}

const PermissionUserModel: React.FC<PermissionUserModelProps> = ({
  user,
  isModalOpen,
  setIsModalOpen,
  permissions,
  onSave,
  isSaving = false
}) => {
  // Memoize initial permissions to prevent unnecessary recalculations
  const initialPermissions = useMemo(() => 
    user.permissions?.map(p => p.id) || [], 
    [user.permissions]
  );
  
  const [selectedPermissions, setSelectedPermissions] = useState<(string | number)[]>(initialPermissions);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [visibleItems, setVisibleItems] = useState<Record<string, number>>({});

  // Initialize expanded state for categories
  useEffect(() => {
    if (isModalOpen) {
      const initialExpanded: Record<string, boolean> = {};
      const initialVisible: Record<string, number> = {};
      
      Object.keys(permissionCategories).forEach(category => {
        initialExpanded[category] = false;
        initialVisible[category] = 10; // Show 10 items initially
      });
      
      setExpandedCategories(initialExpanded);
      setVisibleItems(initialVisible);
    }
  }, [isModalOpen]);

  // Categorize permissions using useMemo to prevent recalculations on every render
  const permissionCategories = useMemo(() => {
    const userPermissions = permissions.filter(p => 
      p.name.toLowerCase().includes('user')
    );
    
    const contentPermissions = permissions.filter(p => 
      p.name.toLowerCase().includes('content') || p.name.toLowerCase().includes('post')
    );
    
    const systemPermissions = permissions.filter(p => 
      !userPermissions.includes(p) && !contentPermissions.includes(p)
    );
    
    return {
      'User Management': userPermissions,
      'Content Management': contentPermissions,
      'System': systemPermissions
    };
  }, [permissions]);

  // Filter permissions based on search term
  const filteredPermissionCategories = useMemo(() => {
    if (!searchTerm) return permissionCategories;
    
    const result: Record<string, Permission[]> = {};
    
    Object.entries(permissionCategories).forEach(([category, perms]) => {
      const filtered = perms.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    return result;
  }, [permissionCategories, searchTerm]);

  // Use useCallback for toggle function to prevent unnecessary re-renders
  const handlePermissionToggle = useCallback((permissionId: string | number) => {
    setSelectedPermissions(prev => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];
      
      // Calculate changes by comparing with initial permissions
      const hasChanges = newPermissions.length !== initialPermissions.length || 
        initialPermissions.some(id => !newPermissions.includes(id));
      
      setPendingChanges(hasChanges ? 1 : 0);
      return newPermissions;
    });
  }, [initialPermissions]);

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

  const handleClose = useCallback(() => {
    // Reset to initial state
    setSelectedPermissions(initialPermissions);
    setPendingChanges(0);
    setSearchTerm('');
    setIsModalOpen(false);
  }, [initialPermissions, setIsModalOpen]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const showMore = useCallback((category: string) => {
    setVisibleItems(prev => ({
      ...prev,
      [category]: prev[category] + 20
    }));
  }, []);

  // Memoize the permission items to prevent unnecessary re-renders
  const renderPermissionItem = useCallback((permission: Permission) => {
    const isSelected = selectedPermissions.includes(permission.id);
    
    return (
      <label key={permission.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handlePermissionToggle(permission.id)}
          className="hidden"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
          isSelected
            ? 'bg-violet-600 border-violet-600'
            : 'bg-white border-gray-300'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{permission.name}</p>
          {permission.description && (
            <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
          )}
        </div>
      </label>
    );
  }, [selectedPermissions, handlePermissionToggle]);

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
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Manage direct permissions for this user
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(filteredPermissionCategories).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No permissions found matching "{searchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(filteredPermissionCategories).map(([category, categoryPermissions]) => 
                categoryPermissions.length > 0 && (
                  <div key={category} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-600" />
                        {category} Permissions ({categoryPermissions.length})
                      </h3>
                      {expandedCategories[category] ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    
                    {(expandedCategories[category] || searchTerm) && (
                      <div className="mt-4">
                        <div className="grid grid-cols-1 gap-2">
                          {categoryPermissions
                            .slice(0, searchTerm ? categoryPermissions.length : visibleItems[category] || 10)
                            .map(renderPermissionItem)}
                        </div>
                        
                        {!searchTerm && categoryPermissions.length > (visibleItems[category] || 10) && (
                          <button
                            onClick={() => showMore(category)}
                            className="mt-3 text-sm text-violet-600 hover:text-violet-800 font-medium"
                          >
                            Show more ({categoryPermissions.length - (visibleItems[category] || 10)} remaining)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {pendingChanges > 0 
                ? `${pendingChanges} change${pendingChanges !== 1 ? 's' : ''} pending`
                : "No changes made"
              }
            </span>
            
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

export default React.memo(PermissionUserModel);