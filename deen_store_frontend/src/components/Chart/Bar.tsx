'use client';

import React, { FC } from 'react';
import { Bar as BarChart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BarProps } from '@/types/ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Bar: FC<BarProps> = ({
  data,
  options = {},
}) => {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutCubic',
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#a8c9f6',
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#a8c9f6' },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#6B7280' },
        grid: { color: '#E5E7EB' },
      },
    },
    ...options,
  };

  return (
    <div className="relative w-full h-full">
      <BarChart data={data} options={commonOptions} />
    </div>
  );
};

export default Bar;