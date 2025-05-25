'use client';
import React, { JSX, useEffect, useState } from 'react';
import { User, ShieldCheck, Stethoscope, UserCog, BriefcaseMedical, Plus } from 'lucide-react';
import Card from '@/components/ui/cards/card';
import { ChartData, ChartOptions } from 'chart.js';
import Chart from '@/components/Chart/Chart';
import { motion } from 'framer-motion';
import Button from '@/components/ui/buttons/button';
import Model from '@/components/ui/modals/model';
import Input from '@/components/ui/inputs/input';
import { useRole } from '@/hooks/role/useRole';
import { toast } from 'react-toastify';

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

type Role = {
    id: string;
    title: string;
    description: string;
    userCount: number;
    color: string;
};

const Role = () => {
    const {
        roles,
        loading,
        error,
        successMessage,
        loadRoles,
        addRole,
        resetRole
    } = useRole();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRole, setNewRole] = useState({
        name: '',
        slug: '',
        color: '#8B5CF6'
    });

    useEffect(() => {
        console.log('Raw roles data:', roles);
        const transformed = transformRolesData(roles);
        console.log('Transformed roles:', transformed);
    }, [roles]);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            resetRole();
        }
        if (error) {
            toast.error(error);
            resetRole();
        }
    }, [successMessage, error, resetRole]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewRole(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addRole(newRole);
        setIsModalOpen(false);
        setNewRole({ name: '', slug: '', color: '#8B5CF6' });
    };

    const chartOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 14,
                        family: 'Inter, sans-serif'
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: 'rgb(var(--text-color))'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: 12,
                cornerRadius: 12,
            }
        },
        cutout: '75%',
    };

    const transformRolesData = (rawRoles: any): Role[] | null => {
        if (!Array.isArray(rawRoles)) return null;

        return rawRoles.map(role => ({
            id: role?.id || Math.random().toString(36).substring(2, 9),
            title: role?.name || role?.title || role?.roleName || 'Unnamed Role',
            description: role?.description || 'No description available',
            userCount: role?.userCount || role?.users?.length || role?.count || 1,
            color: role?.color || getRandomColor()
        }));
    };

    const getRandomColor = (): string => {
        const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const transformedRoles = transformRolesData(roles);
    const hasData = Array.isArray(transformedRoles) && transformedRoles.length > 0;
    const hasValidData = hasData && transformedRoles.some(role => role.userCount > 0);

    const defaultRoles: Role[] = [
        {
            id: 'default-1',
            title: 'Super Admin',
            description: 'Full system access and control',
            userCount: 5,
            color: '#8B5CF6',
        },
        {
            id: 'default-2',
            title: 'Admin',
            description: 'Administrative privileges',
            userCount: 10,
            color: '#10B981',
        },
        {
            id: 'default-3',
            title: 'Vendor Admin',
            description: 'Manages vendor accounts',
            userCount: 8,
            color: '#3B82F6',
        },
        {
            id: 'default-4',
            title: 'Customer',
            description: 'Regular customer account',
            userCount: 50,
            color: '#F59E0B',
        },
        {
            id: 'default-5',
            title: 'Delivery Manager',
            description: 'Manages delivery operations',
            userCount: 12,
            color: '#EF4444',
        }
    ];

    const displayRoles = hasData ? transformedRoles : defaultRoles;

    const chartData: ChartData<'doughnut'> = {
        labels: hasValidData ? 
            transformedRoles!.map(role => role.title) : 
            displayRoles.map(role => role.title),
        datasets: [
            {
                label: 'Role Distribution',
                data: hasValidData ? 
                    transformedRoles!.map(role => role.userCount) : 
                    displayRoles.map(role => role.userCount),
                backgroundColor: hasValidData ? 
                    transformedRoles!.map(role => role.color) : 
                    displayRoles.map(role => role.color),
                borderWidth: 0,
                hoverOffset: 15,
                borderRadius: 8,
                spacing: 4,
            },
        ],
    };

    const getRoleIcon = (title: string): JSX.Element => {
        const iconMap: Record<string, JSX.Element> = {
            'Super Admin': <ShieldCheck className="w-8 h-8" />,
            'Admin': <ShieldCheck className="w-8 h-8" />,
            'Vendor Admin': <User className="w-8 h-8" />,
            'Customer': <User className="w-8 h-8" />,
            'Delivery Manager': <User className="w-8 h-8" />,
            'System Admin': <ShieldCheck className="w-8 h-8" />,
            'Hospital Admin': <BriefcaseMedical className="w-8 h-8" />,
            'Doctor': <Stethoscope className="w-8 h-8" />,
            'Nurse': <UserCog className="w-8 h-8" />,
            'Staff': <User className="w-8 h-8" />
        };
        return iconMap[title] || <User className="w-8 h-8" />;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[rgb(var(--background))] min-h-screen relative">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-color))]">
                        Current Role Distribution
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: '#8B5CF6' }}
                    >
                        <Plus className="w-5 h-5" />
                        Add Role
                    </Button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-10"
            >
                <div className="h-[350px] lg:h-[400px] w-full">
                    <Chart
                        type="doughnut"
                        data={chartData}
                        options={chartOptions}
                        width={800}
                        height={400}
                    />
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
               {displayRoles.map((role) => (
                    <motion.div
                        key={role.id}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="h-full"
                    >
                        <div className="h-full p-5 rounded-xl bg-[rgb(var(--card-bg))] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center mb-4">
                                    <div
                                        className="p-2 rounded-lg mr-3"
                                        style={{ backgroundColor: `${role.color}20` }}
                                    >
                                        {React.cloneElement(getRoleIcon(role.title), {
                                            className: "w-6 h-6",
                                            style: { color: role.color }
                                        })}
                                    </div>
                                    <h3 className="text-lg font-semibold text-[rgb(var(--text-color))]">
                                        {role.title}
                                    </h3>
                                </div>

                                <div className="mb-4">
                                    <span className="text-2xl font-bold" style={{ color: role.color }}>
                                        {role.userCount}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                                    {role.description}
                                </p>

                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        className="text-sm font-medium hover:underline"
                                        style={{ color: role.color }}
                                    >
                                        Manage Permissions →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <Model
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Role"
                size="xl"
                className="fixed right-0 top-0 min-h-screen rounded-none border-l border-gray-200"
                showFooter={true}
                footerContent={
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            style={{ backgroundColor: '#8B5CF6' }}
                        >
                            Create Role
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Role Title"
                        name="name"
                        value={newRole.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Lab Technician"
                        required
                    />

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Role Description
                        </label>
                        <textarea
                            name="slug"
                            value={newRole.slug}
                            onChange={(e) => setNewRole({ ...newRole, slug: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px]"
                            placeholder="Describe the role's responsibilities..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Role Color
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewRole({ ...newRole, color })}
                                    className={`w-8 h-8 rounded-full ${newRole.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                </form>
            </Model>
        </div>
    );
};

export default Role;