// components/user/User.tsx
"use client";
import Button from '@/components/ui/buttons/button';
import { MotionConfig, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import UserCard from './userCard/UserCard';
import UserTable from './userTable/UserTable';
import { useUser } from '@/hooks/user/useUser';
import RecycleBinUserModel from './model/RecycleBinUserModel';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/spinner/Spinner';

const User = () => {
    const { 
        loadUsers, 
        error,
        loadDeletedUsers,
        deletedUsers,
        restoreUser,
        forceDeleteUser,
        stats 
    } = useUser();
    const [showRecycleBin, setShowRecycleBin] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load users and deleted users when component mounts
    useEffect(() => {
        loadUsers();
        loadDeletedUsers();
    }, [loadUsers, loadDeletedUsers]);

    const handleOpenRecycleBin = () => {
        setShowRecycleBin(true);
    };

    const handleRestoreUser = async (userId: string) => {
        setIsRestoring(true);
        try {
            const result = await restoreUser(userId);
            if (result.success) {
                toast.success(result.message);
                // Refresh both active and deleted users
                await Promise.all([loadUsers(), loadDeletedUsers()]);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to restore user');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleForceDeleteUser = async (userId: string) => {
        setIsDeleting(true);
        try {
            const result = await forceDeleteUser(userId);
            if (result.success) {
                toast.success(result.message);
                // Refresh deleted users
                await loadDeletedUsers();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to permanently delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[rgb(var(--dashboard--background))] min-h-screen relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                                User Management
                            </h1>
                        </div>
                        <p className="text-gray-500 mt-2 ml-5">
                            Configure access levels and User across your platform
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <Button
                            onClick={() => (true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl w-full sm:w-auto px-5 py-3 group"
                        >
                            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        </Button>
                        
                        <MotionConfig transition={{ type: 'spring', damping: 10, stiffness: 300 }}>
                            <div className="relative">
                                <Button
                                    onClick={handleOpenRecycleBin}
                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl w-full sm:w-auto px-5 py-3 group relative"
                                >
                                    <motion.div
                                        whileHover={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, -5, 5, -5, 5, 0],
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                            ease: 'easeInOut'
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </motion.div>
                                </Button>
                                
                                {/* Notification badge */}
                                {deletedUsers.length > 0 && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500 }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                                    >
                                        {deletedUsers.length}
                                    </motion.div>
                                )}
                            </div>
                        </MotionConfig>
                    </div>
                </div>
            </motion.div>
           
            {stats && <UserCard stats={stats} />}
        
            <UserTable onOpenRecycleBin={handleOpenRecycleBin} />
            
            {/* Recycle Bin Modal */}
            <RecycleBinUserModel 
                deletedUsers={deletedUsers} 
                isModalOpen={showRecycleBin}
                setIsModalOpen={setShowRecycleBin}
                onRestore={handleRestoreUser}
                onForceDelete={handleForceDeleteUser}
                isRestoring={isRestoring}
                isDeleting={isDeleting}
            />
        </div>
    )
}

export default User;