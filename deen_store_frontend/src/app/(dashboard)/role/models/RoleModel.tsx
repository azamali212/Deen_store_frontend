import Button from '@/components/ui/buttons/button'
import MultiSelectDropdown from '@/components/ui/dropdown/MultiSelectDropdown'
import Input from '@/components/ui/inputs/input'
import Model from '@/components/ui/modals/model'
import { showToast } from '@/components/ui/toast/ToastNotification'
import { usePermission } from '@/hooks/permissions/usePermission'
import { useRole } from '@/hooks/role/useRole'
import { getRoleColor, setRoleColor } from '@/utility/roleColors'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const ROLE_COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#f7ebe7', '#14B8A6'];

const RoleModel = ({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean, setIsModalOpen: (v: boolean) => void }) => {
    const {
        addRole,
        roles,
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

    const [newRole, setNewRole] = useState({
        name: '',
        slug: '',
        color: '#8B5CF6',
        permissions: [] as string[],
    });

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    useEffect(() => {
        loadPermissions();
    }, []);

    useEffect(() => {
        if (successMessage) {
            showToast({
                type: 'success',
                title: 'Operation Successful',
                message: 'Your changes have been saved successfully',
                options: {
                    autoClose: 3000,
                }
            });
            resetRole();
            loadRoles();
            setIsModalOpen(false); // Close modal after success
        }
        if (error) {
            showToast({
                type: 'error',
                message: error,
            });
            resetRole();
        }
    }, [successMessage, error, resetRole, loadRoles, setIsModalOpen]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewRole(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newRole.name.trim()) {
            return;
        }

        if (selectedPermissions.length === 0) {
            return;
        }

        const permissionNames = permissions
            .filter(perm => selectedPermissions.includes(perm.id))
            .map(perm => perm.name);

        setRoleColor(newRole.name, newRole.color);

        const roleToAdd = {
            name: newRole.name,
            slug: newRole.slug,
            permission_names: permissionNames,
            color: newRole.color // Include the color in the role data
        };



        addRole(roleToAdd);
        setIsModalOpen(false);
        setNewRole({ name: '', slug: '', color: '#f7ebe7', permissions: [] });
        setSelectedPermissions([]);
    };
    return (
        <div>
            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Role"
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
                            style={{ backgroundColor: newRole.color }}
                            disabled={rolesLoading || permissionsLoading}
                        >
                            {rolesLoading ? 'Creating...' : 'Create Role'}

                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Role Title"
                        name="name"
                        className='bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"'
                        value={newRole.name}
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
                            value={newRole.slug}
                            onChange={(e) => setNewRole({ ...newRole, slug: e.target.value })}
                            className="w-full px-4 py-2 border border-[rgb(var(--muted))]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] bg-[rgb(var(--background))] text-[rgb(var(--text-color))]"
                            placeholder="Describe the role's responsibilities..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-color))] mb-1">
                            Select Permissions
                        </label>
                        <MultiSelectDropdown
                            options={permissions.map(perm => ({
                                value: perm.id.toString(), // Ensure string values
                                label: perm.name
                            }))}
                            selectedValues={selectedPermissions.map(String)}
                            onChange={(values) => setSelectedPermissions(values.map(Number))}
                            placeholder="Select permissions..."
                            className="bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"
                        />
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
                                    onClick={() => setNewRole({ ...newRole, color })}
                                    className={`w-8 h-8 rounded-full ${newRole.color === color
                                        ? 'ring-2 ring-offset-2 ring-[rgb(var(--text-color))]'
                                        : ''
                                        }`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select color ${color}`}
                                />

                            )
                            )}
                        </div>

                       
                    </div>
                </form>
            </Model>
        </div>
    )
}

export default RoleModel
