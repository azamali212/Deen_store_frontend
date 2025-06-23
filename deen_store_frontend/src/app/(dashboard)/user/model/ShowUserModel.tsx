"use client";
import Button from '@/components/ui/buttons/button';
import Model from '@/components/ui/modals/model';
import { Mail, User, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ShowUserModelProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    user: {
        id: string;
        user: {
            name: string;
            email: string;
            created_at: string;
            avatar: string;
        };
        contact: {
            email: string;
            verified: boolean;
        };
        role: string;
        permissions: any[];
        status: 'active' | 'inactive';
        last_activity: string | null;
    };
}

const ShowUserModel: React.FC<ShowUserModelProps> = ({
    isModalOpen,
    setIsModalOpen,
    user
}) => {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Model
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="User Details"
            size="sm"
            className="fixed right-0 bg-white text-gray-900 top-0 min-h-screen w-full max-w-xl shadow-lg border-l border-gray-100 transition-all duration-300 ease-in-out transform"
            showFooter={true}
            footerContent={
                <div className="flex justify-end p-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-md text-sm"
                    >
                        Close
                    </Button>
                </div>
            }
        >
            <div className="p-4 space-y-4">
                {/* User Profile Header */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                            {user.user.avatar ? (
                                <img
                                    src={user.user.avatar}
                                    alt={`${user.user.name}'s avatar`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-purple-500">
                                    {user.user.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span
                            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-white flex items-center justify-center"
                            style={{ backgroundColor: user.status === 'active' ? '#10B981' : '#EF4444' }}
                        >
                            {user.status === 'active' ? (
                                <CheckCircle className="w-2.5 h-2.5 text-white" />
                            ) : (
                                <XCircle className="w-2.5 h-2.5 text-white" />
                            )}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {user.user.name}
                        </h2>
                        <p className="text-gray-600 text-sm flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.user.email}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                {user.role || 'No role'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Details Cards */}
                <div className="space-y-3">
                    {/* Personal Information Card */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-purple-500" />
                            Personal Info
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Joined</p>
                                <p className="text-gray-900 text-sm mt-0.5">{formatDate(user.user.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-purple-500" />
                            Permissions
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {user.permissions?.length ? (
                                user.permissions.slice(0, 4).map((permission) => (
                                    <span
                                        key={permission.id}
                                        className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium"
                                    >
                                        {permission.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500 text-xs">No permissions</p>
                            )}
                            {user.permissions?.length > 4 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                                    +{user.permissions.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Activity Card */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-purple-500" />
                            Activity
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-blue-50">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last active</p>
                                    <p className="text-gray-900 text-sm">{formatDate(user.last_activity)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-green-50">
                                    {user.contact?.verified ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-gray-900 text-sm">
                                        {user.contact?.verified ? 'Verified' : 'Not verified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Model>
    );
};

export default ShowUserModel;