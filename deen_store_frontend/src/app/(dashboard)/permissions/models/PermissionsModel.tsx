"use client";
import Button from '@/components/ui/buttons/button';
import Input from '@/components/ui/inputs/input';
import Model from '@/components/ui/modals/model';
import { usePermission } from '@/hooks/permissions/usePermission';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const PermissionsModel = ({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean, setIsModalOpen: (v: boolean) => void }) => {
    const { addPermission } = usePermission();
    const [newPermission, setNewPermission] = useState({
        name: '',
        slug: '',
        color: '#8B5CF6', // Frontend-only
        category: 'General' // Frontend-only
      });

    const PERMISSION_COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#f7ebe7', '#14B8A6'];
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
          await addPermission({
            name: newPermission.name,
            slug: newPermission.slug || (newPermission.name),
            // These stay in frontend only:
            color: newPermission.color,
            
          });
          toast.success('Permission created successfully!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
          
          setIsModalOpen(false);
          setNewPermission({ 
            name: '', 
            slug: '', 
            color: '#8B5CF6', 
            category: 'General' 
          });
        } catch (error) {
          console.error('Error creating permission:', error);
          // Show error toast
          toast.error('Failed to create permission', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        }
      };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPermission(prev => ({ ...prev, [name]: value }));
    };
    return (
        <div>
            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Permission"
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
                            style={{ backgroundColor: newPermission.color }}
                        >
                            Create Permission
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Permission Name"
                        name="name"
                        className='bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20'
                        value={newPermission.name}
                        onChange={handleInputChange}
                        placeholder="e.g. manage_users"
                        required
                    />


                    <div>
                        <label className="block mb-1 text-sm font-medium text-[rgb(var(--text-color))]">
                            Slug
                        </label>
                        <Input
                            name="description"
                            value={newPermission.slug}
                            onChange={(e) => setNewPermission({ ...newPermission, slug: e.target.value })}
                            className="bg-[rgb(var(--background))] text-[rgb(var(--text-color))] border-[rgb(var(--muted))]/20"
                            placeholder="Describe what this permission allows..."
                            required
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
                                    onClick={() => setNewPermission({ ...newPermission, color })}
                                    className={`w-8 h-8 rounded-full ${newPermission.color === color
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
export default PermissionsModel
