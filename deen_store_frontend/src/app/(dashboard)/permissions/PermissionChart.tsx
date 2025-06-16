"use client";
import React from 'react'
import { motion } from 'framer-motion';
import Button from '@/components/ui/buttons/button';
import { Download } from 'lucide-react';
import Chart from '@/components/Chart/Chart';

const PermissionChart = () => {

    const permissionCategories = [
        { name: 'General', color: '#8B5CF6', count: 12 },
        { name: 'Administrative', color: '#10B981', count: 8 },
        { name: 'User Management', color: '#3B82F6', count: 15 },
        { name: 'Content', color: '#F59E0B', count: 7 },
        { name: 'Reporting', color: '#EF4444', count: 5 },
    ];

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

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Permission Distribution Chart */}
                <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                </motion.div>

                {/* Permission Usage Chart */}
                <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                </motion.div>
            </div>
        </div>
    )
}

export default PermissionChart
