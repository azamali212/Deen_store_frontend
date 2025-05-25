'use client';
import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Download, Edit, Trash2, X } from 'lucide-react';
import Chart from '@/components/Chart/Chart';
import Table from '@/components/ui/table/Table';
import Button from '@/components/ui/buttons/button';
import Input from '@/components/ui/inputs/input';
import { motion, AnimatePresence, color } from 'framer-motion';
import SearchBar from '@/components/ui/search/SearchBar';

const Permission = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newPermission, setNewPermission] = useState({
        name: '',
        description: '',
        category: 'General',
        color: '#8B5CF6',
    });

    // Permission data
    const permissionCategories = [
        { name: 'General', color: '#8B5CF6', count: 12 },
        { name: 'Administrative', color: '#10B981', count: 8 },
        { name: 'User Management', color: '#3B82F6', count: 15 },
        { name: 'Content', color: '#F59E0B', count: 7 },
        { name: 'Reporting', color: '#EF4444', count: 5 },
    ];

    // Filter permissions based on search query
    const filteredPermissions = [
        { id: 1, name: 'View Dashboard', category: 'General', description: 'Access to view dashboard', lastModified: '5 days ago' },
        { id: 2, name: 'Edit User Roles', category: 'User Management', description: 'Modify user roles and permissions', lastModified: '3 days ago' },
        { id: 3, name: 'Delete Content', category: 'Content', description: 'Permission to delete any content', lastModified: '1 week ago' },
        { id: 4, name: 'Generate Reports', category: 'Reporting', description: 'Access to generate system reports', lastModified: '2 days ago' },
        { id: 5, name: 'System Configuration', category: 'Administrative', description: 'Change system-wide settings', lastModified: '1 month ago' },
        { id: 6, name: 'Manage Permissions', category: 'Administrative', description: 'Create and modify permissions', lastModified: '2 weeks ago' },
    ].filter(perm =>
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chartData = {
        labels: permissionCategories.map(cat => cat.name),
        datasets: [{
            data: permissionCategories.map(cat => cat.count),
            backgroundColor: permissionCategories.map(cat => cat.color),
            borderWidth: 0,
            hoverOffset: 15,
            borderRadius: 8,
            spacing: 4,
        }],
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPermission(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New permission submitted:', newPermission);
        setIsModalOpen(false);
        setNewPermission({ name: '', description: '', category: 'General', color: '#8B5CF6' });
    };

    return (
        <div className="p-6 bg-[rgb(var(--background))] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col  gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--text-color))]">
                        Permission Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage and configure system permissions
                    </p>
                </div>

                {/* Search and Button in a single row */}
                <div className="flex flex-col md:flex-row items-center  gap-3 w-full md:w-auto">
                    <div className="w-full md:w-64 pt-4">
                        <SearchBar
                            onSearch={(query) => setSearchQuery(query)}
                            className="w-full"
                        />
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#8B5CF6' }}
                        className="flex items-center gap-3 bg-[#8B5CF6] hover:bg-[#7C4DFF] text-white rounded-lg transition-colors shadow-md hover:shadow-lg w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="whitespace-nowrap">Add Permission</span>
                    </Button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Permission Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Permission Distribution</h2>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                    <div className="h-[400px]">
                        <Chart
                            type="doughnut"
                            data={chartData}
                            options={{
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            usePointStyle: true,
                                            pointStyle: 'circle',
                                            padding: 20,
                                            font: {
                                                family: 'Inter, sans-serif',
                                                size: 14
                                            }
                                        }
                                    }
                                },
                                cutout: '65%'
                            }}
                            width={600}
                            height={300}
                        />
                    </div>
                </div>

                {/* Permission Usage Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Permission Usage</h2>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            Last 30 days
                        </Button>
                    </div>
                    <div className="h-[400px]">
                        <Chart
                            type="pie"
                            data={{
                                labels: ['Active', 'Assigned', 'Unused'],
                                datasets: [{
                                    data: [65, 25, 10],
                                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
                                    borderWidth: 0
                                }]
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            usePointStyle: true,
                                            pointStyle: 'circle',
                                            padding: 20,
                                            font: {
                                                family: 'Inter, sans-serif',
                                                size: 14
                                            }
                                        }
                                    }
                                }
                            }}
                            width={600}
                            height={300}
                        />
                    </div>
                </div>
            </div>

            {/* Permissions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-lg font-semibold">All Permissions</h2>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
                <Table
                    headers={['Name', 'Category', 'Description', 'Last Modified', 'Actions']}
                    data={filteredPermissions.map(perm => ({
                        name: (
                            <span className="font-medium">{perm.name}</span>
                        ),
                        category: (
                            <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                    backgroundColor: `${permissionCategories.find(c => c.name === perm.category)?.color}20`,
                                    color: permissionCategories.find(c => c.name === perm.category)?.color
                                }}
                            >
                                {perm.category}
                            </span>
                        ),
                        description: perm.description,
                        'last modified': (
                            <span className="text-sm text-gray-500">{perm.lastModified}</span>
                        ),
                        actions: (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        )
                    }))}
                />
            </div>

            {/* Add Permission Sidebar Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black z-40"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', ease: 'easeInOut' }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold">Create New Permission</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <Input
                                    label="Permission Name"
                                    name="name"
                                    value={newPermission.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. manage_users"
                                    required
                                    className="border-gray-200 focus:ring-purple-500"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={newPermission.category}
                                        onChange={(e) => setNewPermission({ ...newPermission, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        {permissionCategories.map((cat) => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newPermission.description}
                                        onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                                        placeholder="Describe what this permission allows..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#8B5CF6] hover:bg-[#7C4DFF] text-white"
                                        style={{ backgroundColor: '#8B5CF6' }}
                                    >
                                        Create Permission
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Permission;