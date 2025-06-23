"use client";
import React, { useState } from 'react';
import { Trash2, User, Mail, Clock, Calendar, RotateCw, Shield, CheckCircle, XCircle } from 'lucide-react';
import Model from '@/components/ui/modals/model';
import Button from '@/components/ui/buttons/button';

interface DeletedUser {
    id: string;
    user: {
        name: string;
        email: string;
        deleted_at: string;
        avatar: string;
    };
    role: string;
    deleted_by: string;
    permissions: any[];
}

interface RecycleBinUserModelProps {
    deletedUsers: DeletedUser[];
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
}

const RecycleBinUserModel: React.FC<RecycleBinUserModelProps> = ({ 
    deletedUsers,
    isModalOpen,
    setIsModalOpen
}) => {
    const [selectedUser, setSelectedUser] = useState<DeletedUser | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openUserDetails = (user: DeletedUser) => {
        setSelectedUser(user);
    };

    return (
        <Model
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Recycle Bin"
            size="lg"
            className="fixed right-0 bg-white text-gray-900 top-0 min-h-screen w-full max-w-xl shadow-lg border-l border-gray-100 transition-all duration-300 ease-in-out transform"
            showFooter={true}
            footerContent={
                <div className="flex justify-between p-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 text-gray-700 hover:bg-gray-50"
                    >
                        <RotateCw className="w-4 h-4" />
                        Restore All
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </Button>
                        <Button
                            variant="danger"
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Empty Recycle Bin
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="p-4">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Deleted Users
                        </h2>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            {deletedUsers.length} deleted items
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Deleted users will be permanently removed after 30 days
                    </p>
                </div>

                {/* User List */}
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {deletedUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Trash2 className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No deleted users</h3>
                            <p className="mt-1 text-sm text-gray-500">All deleted users will appear here</p>
                        </div>
                    ) : (
                        deletedUsers.map((user) => (
                            <div 
                                key={user.id} 
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${selectedUser?.id === user.id ? 'bg-purple-50' : ''}`}
                                onClick={() => openUserDetails(user)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                                            {user.user.avatar ? (
                                                <img
                                                    src={user.user.avatar}
                                                    alt={`${user.user.name}'s avatar`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-purple-500">
                                                    {user.user.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                                            <Trash2 className="w-2.5 h-2.5 text-white" />
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">{user.user.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{user.user.email}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(user.user.deleted_at)}
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                            {user.role || 'No role'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* User Details Section */}
                {selectedUser && (
                    <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="space-y-4">
                            {/* User Profile Header */}
                            <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                                        {selectedUser.user.avatar ? (
                                            <img
                                                src={selectedUser.user.avatar}
                                                alt={`${selectedUser.user.name}'s avatar`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-purple-500">
                                                {selectedUser.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                                        <Trash2 className="w-2 h-2 text-white" />
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-md font-bold text-gray-900">
                                        {selectedUser.user.name}
                                    </h2>
                                    <p className="text-gray-600 text-xs flex items-center gap-1.5 mt-0.5">
                                        <Mail className="w-3 h-3 text-gray-400" />
                                        {selectedUser.user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Deletion Details */}
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                <h3 className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1.5">
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                    Deletion Information
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs font-medium text-red-700">Deleted At</p>
                                        <p className="text-red-900 text-xs mt-0.5">{formatDate(selectedUser.user.deleted_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-red-700">Deleted By</p>
                                        <p className="text-red-900 text-xs mt-0.5">{selectedUser.deleted_by || 'System'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs"
                                >
                                    <RotateCw className="w-3 h-3" />
                                    Restore
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete Permanently
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Model>
    );
};

export default RecycleBinUserModel;