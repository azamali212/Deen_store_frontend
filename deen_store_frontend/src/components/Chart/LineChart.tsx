'use client';

import React, { FC, useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ChartProps } from '@/types/ui';

// Register the necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart: FC<ChartProps> = ({
  type = 'line', // Default to line chart
  data,
  options = {},
  width = 100,
  height = 100,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [selectedMonth, setSelectedMonth] = useState<string>('January');

  // Dynamic chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500, // 1.5 seconds for animation
      easing: 'easeInOutCubic', // Smooth animation effect
    },
    ...options,
  };

  // Filter handler for Year
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  // Filter handler for Month
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  // Here you can modify how your chart data is fetched or adjusted based on selected filters (year/month)
  // Just mock data here for illustration purposes
  useEffect(() => {
    // Update chart data based on the selected year and month
    // Example logic for dynamic data fetching or adjustments
    console.log(`Data updated for Year: ${selectedYear}, Month: ${selectedMonth}`);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="flex flex-col items-center">
      {/* Filters */}
      <div className="flex flex-row items-center mb-4 gap-4">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="p-2 border rounded"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="p-2 border rounded"
        >
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          {/* Add more months */}
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        {type === 'line' ? (
          <Line data={data} options={commonOptions} width={width} height={height} />
        ) : (
          <Bar data={data} options={commonOptions} width={width} height={height} />
        )}
      </div>
    </div>
  );
};

export default LineChart;