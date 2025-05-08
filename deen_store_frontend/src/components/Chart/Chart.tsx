"use client"
import { FC } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { ChartProps } from '@/types/ui';

ChartJS.register(ArcElement, Tooltip, Legend, Title);



const Chart: FC<ChartProps> = ({
  type,
  data,
  options = {},
  width = 100,
  height = 100,
}) => {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500, // 1.5 seconds for animation
      easing: 'easeInOutCubic', // Smooth animation effect
    },
    ...options,
  };

  return (
    <div className="flex justify-center items-center">
      {type === 'pie' ? (
        <Pie data={data} options={commonOptions} width={width} height={height} />
      ) : (
        <Doughnut data={data} options={commonOptions} width={width} height={height} />
      )}
    </div>
  );
};

export default Chart;