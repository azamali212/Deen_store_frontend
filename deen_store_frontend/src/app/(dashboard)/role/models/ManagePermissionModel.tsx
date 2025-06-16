'use client';
import Button from '@/components/ui/buttons/button';
import Model from '@/components/ui/modals/model';
import { usePermission } from '@/hooks/permissions/usePermission';
import { useRole } from '@/hooks/role/useRole';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, Check, X } from 'lucide-react';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [permissionsToAdd, setPermissionsToAdd] = useState<string[]>([]);
  const [permissionsToRemove, setPermissionsToRemove] = useState<string[]>([]);

  const allPermissions = permissions.map(p => p.name);

  // Reset on modal open
  useEffect(() => {
    if (isModalOpen) {
      setPermissionsToAdd([]);
      setPermissionsToRemove([]);
      setSearchQuery('');
    }
  }, [isModalOpen]);

  const assignedPermissions = allPermissions.filter(perm =>
    currentPermissions.includes(perm)
  );
  const unassignedPermissions = allPermissions.filter(perm =>
    !currentPermissions.includes(perm)
  );

  const filteredPermissions = [...assignedPermissions, ...unassignedPermissions].filter(
    perm => perm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPermissionSelected = (perm: string): boolean => {
    const hasRole = currentPermissions.includes(perm);
    return hasRole ? !permissionsToRemove.includes(perm) : permissionsToAdd.includes(perm);
  };

  const togglePermission = (perm: string) => {
    const hasRole = currentPermissions.includes(perm);

    if (hasRole) {
      setPermissionsToRemove(prev =>
        prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
      );
    } else {
      setPermissionsToAdd(prev =>
        prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
      );
    }
  };

  const handleSubmit = async () => {
    try {
      if (permissionsToRemove.length > 0) {
        await detachRolePermissions(roleId, permissionsToRemove);
      }
      if (permissionsToAdd.length > 0) {
        await attachRolePermissions(roleId, permissionsToAdd);
      }

      if (permissionsToAdd.length || permissionsToRemove.length) {
        toast.success('Permissions updated successfully');
        onSuccess?.();
        setIsModalOpen(false);
      } else {
        toast.info('No changes to save');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update permissions');
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      resetRole();
    }
    if (error) {
      toast.error(error);
      resetRole();
    }
  }, [successMessage, error]);

  return (
    <Model
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Manage Role Permissions"
      size="xl"
      className="fixed right-0 bg-[rgb(var(--foreground))] text-[rgb(var(--text-color))] top-0 min-h-screen rounded-none border-l border-[rgb(var(--muted))]/20"
      showFooter={true}
      footerContent={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-[rgb(var(--muted))]">
            {permissionsToAdd.length + permissionsToRemove.length} changes pending
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
              disabled={loading || permissionsLoading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted))]" />
          <input
            type="text"
            placeholder="Search permissions..."
            className="w-full pl-9 pr-3 py-2 border border-[rgb(var(--muted))]/20 rounded-md bg-[rgb(var(--background))] text-[rgb(var(--text-color))] placeholder:text-[rgb(var(--muted))] text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {permissionsLoading ? (
          <div className="animate-pulse h-10 bg-[rgb(var(--muted))]/20 rounded-md"></div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredPermissions.map((perm, idx) => {
              const selected = isPermissionSelected(perm);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium cursor-pointer transition-all duration-200 ${
                    selected
                      ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border-[rgb(var(--accent))]'
                      : 'bg-[rgb(var(--muted))]/10 text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20'
                  }`}
                  onClick={() => togglePermission(perm)}
                >
                  {selected ? <Check size={12} /> : <X size={12} />}
                  {perm}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Model>
  );
};

export default ManagePermissionModel;