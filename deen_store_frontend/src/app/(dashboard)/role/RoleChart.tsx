import React, { useMemo } from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import Chart from '@/components/Chart/Chart';

type Role = {
  title: string;
  color: string;
  permissionsCount?: number;
};

interface RoleChartProps {
  transformedRoles: Role[];
}

const RoleChart: React.FC<RoleChartProps> = ({ transformedRoles }) => {
  const chartData: ChartData<'doughnut'> = useMemo(() => ({
    labels: transformedRoles.map(role => role.title),
    datasets: [
      {
        label: 'Permissions Distribution',
        data: transformedRoles.map(role => role.permissionsCount ?? 0),
        backgroundColor: transformedRoles.map(role => role.color),
        borderWidth: 0,
        hoverOffset: 15,
        borderRadius: 8,
        spacing: 4,
      },
    ],
  }), [transformedRoles]);

  const chartOptions: ChartOptions<'doughnut'> = useMemo(() => ({
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
        backgroundColor: 'rgb(var(--card))',
        titleColor: 'rgb(var(--text-color))',
        bodyColor: 'rgb(var(--text-color))',
        padding: 12,
        cornerRadius: 12,
        borderColor: 'rgb(var(--muted))',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw} permissions`;
          }
        }
      }
    },
    cutout: '75%',
  }), []);

  return (
    <div className="h-[350px] lg:h-[400px] w-full">
      <Chart
        key={JSON.stringify(chartData)}
        type="doughnut"
        data={chartData}
        options={chartOptions}
        width={800}
        height={400}
      />
    </div>
  );
};

export default RoleChart;