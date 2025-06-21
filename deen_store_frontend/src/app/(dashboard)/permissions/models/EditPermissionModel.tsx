"use client";
import Button from '@/components/ui/buttons/button';
import Input from '@/components/ui/inputs/input';
import Model from '@/components/ui/modals/model';
import { usePermission } from '@/hooks/permissions/usePermission';
import { ExtendedPermission } from '@/types/ui';
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';

interface EditPermissionModelProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    permissionToEdit: ExtendedPermission | null;
    onSuccess: () => void;
  }

const EditPermissionModel = ({ 
  isModalOpen, 
  setIsModalOpen,
  permissionToEdit 
}: EditPermissionModelProps) => {
    const { updatePermission, successMessage, error, clearMessages } = usePermission();
    const [editedPermission, setEditedPermission] = useState({
        id: 0,
        name: '',
        slug: '',
        color: '#8B5CF6',
        category: 'General'
    });

    const PERMISSION_COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#f7ebe7', '#14B8A6'];
    
    // Initialize form with permission data when permissionToEdit changes
    useEffect(() => {
        if (permissionToEdit) {
            setEditedPermission({
                id: permissionToEdit.id,
                name: permissionToEdit.name,
                slug: permissionToEdit.slug,
                color: permissionToEdit.color || '#8B5CF6',
                category: permissionToEdit.category || 'General'
            });
        }
    }, [permissionToEdit]);

    // Handle success/error messages from Redux
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            clearMessages();
            setIsModalOpen(false);
        }
        
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            clearMessages();
        }
    }, [successMessage, error, clearMessages, setIsModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await updatePermission(editedPermission.id, {
                name: editedPermission.name,
                slug: editedPermission.slug || editedPermission.name.toLowerCase().replace(/\s+/g, '_'),
            });
            
        } catch (err) {
            console.error('Error updating permission:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedPermission(prev => ({ ...prev, [name]: value }));
        
        // Auto-generate slug if name changes and slug is empty
        if (name === 'name' && !editedPermission.slug) {
            setEditedPermission(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/\s+/g, '_')
            }));
        }
    };

    return (
        <div>
            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Permission"
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
                            style={{ backgroundColor: editedPermission.color }}
                        >
                            Update Permission
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Permission Name"
                        name="name"
                        className='bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20'
                        value={editedPermission.name}
                        onChange={handleInputChange}
                        placeholder="e.g. manage_users"
                        required
                    />

                    <div>
                        <label className="block mb-1 text-sm font-medium text-[rgb(var(--text-color))]">
                            Slug
                        </label>
                        <Input
                            name="slug"
                            value={editedPermission.slug}
                            onChange={handleInputChange}
                            className="bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"
                            placeholder="Will be auto-generated if empty"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[rgb(var(--text-color))]">
                            Permission Color
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {PERMISSION_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setEditedPermission({ ...editedPermission, color })}
                                    className={`w-8 h-8 rounded-full ${editedPermission.color === color
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
        </div>
    )
}

export default EditPermissionModel;