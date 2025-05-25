'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface CombinationChartProps {
  vendorData: number[];
  customerData: number[];
  labels: string[];
  chartTitle?: string;
}

const CombinationChart: React.FC<CombinationChartProps> = ({
  vendorData,
  customerData,
  labels,
  chartTitle,
}) => {
  // Define chart data for combination chart (bar + line)
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Vendor Sales',
        data: vendorData,
        borderColor: 'rgba(75, 192, 192, 1)', // Line color for Vendor
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bar color for Vendor
        borderWidth: 2,
        fill: true, // Whether to fill the area under the line
        type: 'line', // Line chart
        tension: 0.4, // Line smoothness
      },
      {
        label: 'Customer Feedback',
        data: customerData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Bar color for Customer
        borderColor: 'rgba(255, 99, 132, 1)', // Bar border color for Customer
        borderWidth: 1,
        type: 'bar', // Bar chart
      },
    ],
  };

  // Options for the chart
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: chartTitle, // Dynamic title
        font: {
          size: 18,
        },
      },
      tooltip: {
        mode: 'index' as 'index', // Corrected the tooltip mode type
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: false,
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="text-center p-4 text-xl font-bold mb-4">{chartTitle}</h3>
      <div className="chart">
        <Bar data={data} options={options} />
        {/* You could use either Bar or Line chart, but here we're using both */}
      </div>
    </div>
  );
};

export default CombinationChart;