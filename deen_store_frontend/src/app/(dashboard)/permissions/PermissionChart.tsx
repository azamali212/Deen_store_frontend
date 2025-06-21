"use client";
import React, { useEffect } from 'react'
import { motion } from 'framer-motion';
import Button from '@/components/ui/buttons/button';
import { Download } from 'lucide-react';
import Chart from '@/components/Chart/Chart';
import { usePermission } from '@/hooks/permissions/usePermission';
import Spinner from '@/components/ui/spinner/Spinner';

const PermissionChart = () => {
    const { distribution, fetchDistribution } = usePermission();

    useEffect(() => {
        fetchDistribution();
    }, [fetchDistribution]);

    if (distribution.loading && !distribution.data.length) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[500px] flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (distribution.error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[500px] flex items-center justify-center text-red-500">
                {distribution.error}
            </div>
        );
    }

    const chartData = {
        labels: distribution.data.map(item => item.name),
        datasets: [{
            data: distribution.data.map(item => item.role_count),
            backgroundColor: [
                '#8B5CF6', // purple
                '#10B981', // emerald
                '#3B82F6', // blue
                '#F59E0B', // amber
                '#EF4444', // red
                '#6B7280', // gray
                '#8B5CE7', // violet
                '#e36414', // orange
                '#9e0059'  // pink
            ],
            borderWidth: 0,
            hoverOffset: 15,
            borderRadius: 8,
            spacing: 4,
        }],
    };

    return (
        <div>
            <div className="grid grid-cols-1 gap-6 mb-8">
                {/* Permission Distribution Chart */}
                <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Permission Distribution</h2>
                       
                    </div>
                    <div className="h-[400px]">
                        <Chart
                            type="polarArea"
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