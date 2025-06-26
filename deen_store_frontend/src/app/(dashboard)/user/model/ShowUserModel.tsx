'use client';
import Button from '@/components/ui/buttons/button';
import Model from '@/components/ui/modals/model';
import { Mail, User as UserIcon, Shield, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useUser } from '@/hooks/user/useUser';
import { useCallback, useEffect, useState } from 'react';
import Avatar from '@/components/avatar/Avatar';
import { TableUser } from '../userTable/UserTable';


interface ShowUserModelProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    userId?: string;
    userData?: TableUser | null;  // Accept TableUser or null
}
interface UserData {
    id: string;
    name: string;
    email: string;
    status?: string;
    created_at?: string;
    last_login_at?: string;
    email_verified_at?: string | null;
    location?: string;
    roles?: Array<{
        id: number;
        name: string;
        permissions?: Array<{
            id: number;
            name: string;
        }>;
    }>;
    permissions?: Array<{
        id: number;
        name: string;
    }>;
}

const ShowUserModel: React.FC<ShowUserModelProps> = ({
    isModalOpen,
    setIsModalOpen,
    userId,
    userData: initialUserData
}) => {
    const { loadSingleUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<any>(initialUserData || null);

    const fetchUserData = useCallback(async () => {
        if (!userId || userData) return; // Only fetch if we don't have data
        try {
            setIsLoading(true);
            const response = await loadSingleUser(userId, 'roles,permissions');
            
            if (!response || !response.payload) {
                throw new Error('No user data received');
            }
    
            if ('message' in response.payload) {
                throw new Error(response.payload.message);
            }
            
            setUserData({
                user: response.payload,
                roles: response.payload.roles || [],
                permissions: response.payload.permissions || [],
                email_verified_at: response.payload.email_verified_at || null,
            });
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, loadSingleUser, userData]); 

    useEffect(() => {
        let isMounted = true;
    
        if (isModalOpen && userId && !isLoading && !userData) { // Added !userData condition
            console.log("Fetching user data for:", userId);
            fetchUserData();
        }
    
        return () => {
            isMounted = false;
        };
    }, [isModalOpen, userId, isLoading, fetchUserData, userData]);

    useEffect(() => {
        console.log("Current userData:", {
            user: userData?.user,
            emailVerified: userData.email_verified_at,
            status: userData.status
        });
    }, [userData]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Never';

        try {
            // Handle both ISO format and database timestamp format
            const date = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T'));

            if (isNaN(date.getTime())) {
                console.warn("Invalid date string:", dateString);
                return 'Invalid date';
            }

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Date formatting error:", error, "for date:", dateString);
            return 'Invalid date';
        }
    };

    if ((!userData && userId) || isLoading) {
        return (
            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Loading User..."
                size="sm"
                className="fixed right-0 bg-white text-gray-900 top-0 min-h-screen w-full max-w-xl shadow-lg border-l border-gray-100 transition-all duration-300 ease-in-out transform"
                showFooter={false}
            >
                <div className="p-4 flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </Model>
        );
    }

    if (!userData) {
        return null;
    }

    const primaryRole = userData.roles?.[0]?.name || 'User';
    const allPermissions = userData.roles?.flatMap(role =>
        typeof role === 'object' ? role.permissions : []
    ) || [];

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
                            <Avatar
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user.name)}&background=random`}
                                name={userData.user.name}
                                size="lg"
                            />
                        </div>
                        <span
                            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-white flex items-center justify-center"
                            style={{ backgroundColor: userData.status === 'active' ? '#10B981' : '#EF4444' }}
                        >
                            {userData.status === 'active' ? (
                                <CheckCircle className="w-2.5 h-2.5 text-white" />
                            ) : (
                                <XCircle className="w-2.5 h-2.5 text-white" />
                            )}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {userData.user.name || 'Unnamed User'}
                        </h2>
                        <p className="text-gray-600 text-sm flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {userData.user.email || 'No email on record'}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                {primaryRole}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Details Cards */}
                <div className="space-y-3">
                    {/* Personal Information Card */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-purple-500" />
                            Personal Info
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Joined</p>
                                <p className="text-gray-900 text-sm mt-0.5">{formatDate(userData.user.created_at)}</p>
                            </div>
                            {userData.location && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Location</p>
                                    <p className="text-gray-900 text-sm mt-0.5">{userData.location}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-purple-500" />
                            Permissions
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {allPermissions.length ? (
                                allPermissions.slice(0, 4).map((permission) => (
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
                            {allPermissions.length > 4 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                                    +{allPermissions.length - 4} more
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
                                    <p className="text-gray-900 text-sm">
                                        {userData?.last_login_at ? (
                                            <>
                                                {formatDate(userData.last_login_at)}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    (raw: {userData.last_login_at})
                                                </span>
                                            </>
                                        ) : 'Never logged in'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-green-50">
                                    {userData.email_verified_at ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-gray-900 text-sm">
                                        {userData.email_verified_at ? (
                                            <>
                                                Verified on {formatDate(userData.email_verified_at)}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    (raw: {userData.email_verified_at})
                                                </span>
                                            </>
                                        ) : 'Not verified'}
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