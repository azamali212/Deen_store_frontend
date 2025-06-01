"use client";
import Button from '@/components/ui/buttons/button';
import MultiSelectDropdown from '@/components/ui/dropdown/MultiSelectDropdown';
import Input from '@/components/ui/inputs/input';
import Model from '@/components/ui/modals/model';
import { usePermission } from '@/hooks/permissions/usePermission';
import { useRole } from '@/hooks/role/useRole';
import { getRoleColor, setRoleColor } from '@/utility/roleColors';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const ROLE_COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

interface EditRoleModelProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  id: number;
  initialData: {
    name: string;
    slug: string;
    color: string;
    permissions: string[]; // Changed to string[] to match your data
  };
}

const EditRoleModel: React.FC<EditRoleModelProps> = ({
  isModalOpen,
  setIsModalOpen,
  id,
  initialData
}) => {
  const {
    editRole,
    loading: rolesLoading,
    error,
    successMessage,
    resetRole,
    loadRoles
  } = useRole();

  const {
    permissions,
    loading: permissionsLoading,
    loadPermissions
  } = usePermission();

  const initialDataRef = useRef(initialData);
  const [editedRole, setEditedRole] = useState({
    name: '',
    slug: '',
    color: '',
    permissions: [] as string[], // Changed to string[] to match
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]); // Changed to string[]
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load permissions when component mounts
  useEffect(() => {
    loadPermissions();
  }, []);

  // Initialize state when modal opens or initialData changes
  useEffect(() => {
    if (isModalOpen && initialData) {
      initialDataRef.current = initialData;
      setEditedRole({
        name: initialData.name,
        slug: initialData.slug,
        color: initialData.color,
        permissions: initialData.permissions,
      });
      // Set permissions (now handling as strings)
      setSelectedPermissions(initialData.permissions);
      setHasChanges(false);
      setValidationError('');
    }
  }, [initialData, isModalOpen]);

  // Track changes
  useEffect(() => {
    if (isModalOpen) {
      const nameChanged = editedRole.name !== initialDataRef.current.name;
      const slugChanged = editedRole.slug !== initialDataRef.current.slug;
      const colorChanged = editedRole.color !== initialDataRef.current.color;
      const permissionsChanged = 
        JSON.stringify([...selectedPermissions].sort()) !== 
        JSON.stringify([...initialDataRef.current.permissions].sort());
      
      setHasChanges(nameChanged || slugChanged || colorChanged || permissionsChanged);
    }
  }, [editedRole, selectedPermissions, isModalOpen]);

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      resetRole();
      loadRoles();
      setIsModalOpen(false);
    }
    if (error) {
      toast.error(error);
      resetRole();
    }
  }, [successMessage, error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedRole(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (values: string[]) => {
    setSelectedPermissions(values); // No need to convert to number
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationError('');

    // Basic validation
    if (!editedRole.name.trim()) {
      const errorMsg = "Role name is required.";
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (selectedPermissions.length === 0) {
      const errorMsg = "Please select at least one permission.";
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Check if any changes were made
    if (!hasChanges) {
      const errorMsg = "No changes were made to the role.";
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // No need to filter by ID since we're working with permission names directly
    const roleToUpdate = {
      name: editedRole.name,
      slug: editedRole.slug,
      permission_names: selectedPermissions, // Using the string values directly
      color: editedRole.color
    };

    setRoleColor(editedRole.name, editedRole.color);
    editRole(id, roleToUpdate);
  };

  return (
    <Model
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Edit Role"
      size="xl"
      className="fixed right-0 bg-[rgb(var(--foreground))] text-[rgb(var(--text-color))] top-0 min-h-screen rounded-none border-l border-[rgb(var(--muted))]/20"
      showFooter={true}
      footerContent={
        <div className="flex flex-col gap-3">
          {validationError && (
            <div className="text-red-500 text-sm">
              {validationError}
            </div>
          )}
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
              style={{ backgroundColor: editedRole.color }}
              disabled={rolesLoading || permissionsLoading}
            >
              {rolesLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Role Title"
          name="name"
          className='bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"'
          value={editedRole.name}
          onChange={handleInputChange}
          placeholder="e.g. Lab Technician"
          required
        />

        <div>
          <label className="block mb-1 text-sm font-medium text-[rgb(var(--text-color))]">
            Role Description
          </label>
          <textarea
            name="slug"
            value={editedRole.slug || ''}
            onChange={(e) => setEditedRole({ ...editedRole, slug: e.target.value })}
            className="w-full px-4 py-2 border border-[rgb(var(--muted))]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] bg-[rgb(var(--background))] text-[rgb(var(--text-color))]"
            placeholder="Describe the role's responsibilities..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-color))] mb-1">
            Select Permissions
          </label>
          {permissionsLoading ? (
            <div>Loading permissions...</div>
          ) : (
            <MultiSelectDropdown
              options={permissions.map(perm => ({
                value: perm.name, // Using name as value since we're working with strings
                label: perm.name
              }))}
              selectedValues={selectedPermissions}
              onChange={handlePermissionChange}
              placeholder="Select permissions..."
              className="bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"
            />
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-[rgb(var(--text-color))]">
            Role Color
          </label>
          <div className="flex gap-3 flex-wrap">
            {ROLE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setEditedRole({ ...editedRole, color })}
                className={`w-8 h-8 rounded-full ${editedRole.color === color
                  ? 'ring-2 ring-offset-2 ring-[rgb(var(--text-color))]'
                  : ''
                  }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </form>
    </Model>
  );
};

export default EditRoleModel;