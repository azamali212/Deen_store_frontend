"use client";
import Button from '@/components/ui/buttons/button';
import MultiSelectDropdown from '@/components/ui/dropdown/MultiSelectDropdown';
import Model from '@/components/ui/modals/model';
import { usePermission } from '@/hooks/permissions/usePermission';
import { useRole } from '@/hooks/role/useRole';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface ManagePermissionModelProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    roleId: number;
    currentPermissions: string[];
    roleColor: string;
    onSuccess?: () => void;
  }
  
  const ManagePermissionModel: React.FC<ManagePermissionModelProps> = ({
    isModalOpen,
    setIsModalOpen,
    roleId,
    currentPermissions,
    roleColor,
    onSuccess
  }) => {
    const { permissions, loading: permissionsLoading } = usePermission();
    const { 
      attachRolePermissions, 
      detachRolePermissions, 
      loading, 
      error, 
      successMessage, 
      resetRole 
    } = useRole();
  
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(currentPermissions);
    const [hasChanges, setHasChanges] = useState(false);
  
    // Reset state when modal opens
    useEffect(() => {
      if (isModalOpen) {
        setSelectedPermissions(currentPermissions);
        setHasChanges(false);
      }
    }, [isModalOpen, currentPermissions]);
  
    // Handle success/error states
    useEffect(() => {
      if (successMessage) {
        toast.success(successMessage);
        resetRole();
        setIsModalOpen(false);
        onSuccess?.(); // Call the success callback
      }
      if (error) {
        toast.error(error);
        resetRole();
      }
    }, [successMessage, error, resetRole, setIsModalOpen, onSuccess]);
  
    // Check for changes
    useEffect(() => {
      const permissionsChanged = 
        JSON.stringify([...selectedPermissions].sort()) !== 
        JSON.stringify([...currentPermissions].sort());
      setHasChanges(permissionsChanged);
    }, [selectedPermissions, currentPermissions]);
  
    const handleSubmit = async () => {
      if (!hasChanges) {
        toast.info("No permission changes detected");
        return;
      }
  
      try {
        const permissionsToAdd = selectedPermissions.filter(
          perm => !currentPermissions.includes(perm)
        );
        const permissionsToRemove = currentPermissions.filter(
          perm => !selectedPermissions.includes(perm)
        );
  
        // Perform updates sequentially
        if (permissionsToRemove.length > 0) {
          await detachRolePermissions(roleId, permissionsToRemove);
        }
        if (permissionsToAdd.length > 0) {
          await attachRolePermissions(roleId, permissionsToAdd);
        }
      } catch (err) {
        console.error("Failed to update permissions:", err);
        toast.error("Failed to update permissions");
      }
    };

  return (
    <Model
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Manage Role Permissions"
      size="xl"
      className="fixed right-0 bg-[rgb(var(--foreground))] text-[rgb(var(--text-color))] top-0 min-h-screen rounded-none border-l border-[rgb(var(--muted))]/20"
      showFooter={true}
      footerContent={
        <div className="flex justify-end gap-3">
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
            disabled={loading || permissionsLoading || !hasChanges}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-color))] mb-1">
            Select Permissions
          </label>
          {permissionsLoading ? (
            <div className="animate-pulse h-10 bg-[rgb(var(--muted))]/20 rounded-md"></div>
          ) : (
            <MultiSelectDropdown
              options={permissions.map(perm => ({
                value: perm.name,
                label: perm.name
              }))}
              selectedValues={selectedPermissions}
              onChange={setSelectedPermissions}
              placeholder="Select permissions..."
              className="bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"
            />
          )}
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-medium mb-2 text-[rgb(var(--text-color))]">
            Current Permissions:
          </h4>
          {currentPermissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentPermissions.map((permission, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${roleColor}20`,
                    color: roleColor,
                    border: `1px solid ${roleColor}`
                  }}
                >
                  {permission}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[rgb(var(--muted))]">No permissions assigned</p>
          )}
        </div>
      </div>
    </Model>
  );
};

export default ManagePermissionModel;