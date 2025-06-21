"use client";
import { FC } from 'react';
import { 
  Pie, 
  Doughnut, 
  Bar, 
  Line, 
  Radar, 
  PolarArea, 
  Bubble,
  Scatter
} from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  ChartData,
  Plugin,
  ChartType,
  CoreChartOptions,
  ElementChartOptions,
  PluginChartOptions,
  DatasetChartOptions,
  ScaleChartOptions,
  DoughnutControllerChartOptions,
  PieControllerChartOptions,
  BarControllerChartOptions,
  LineControllerChartOptions,
  RadarControllerChartOptions,
  PolarAreaControllerChartOptions
} from 'chart.js';
import { ChartProps } from '@/types/ui';

// Register all ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler
);

type ChartTypeSpecificOptions<T extends ChartType> = 
  CoreChartOptions<T> &
  ElementChartOptions<T> &
  PluginChartOptions<T> &
  DatasetChartOptions<T> &
  ScaleChartOptions<T> &
  (T extends 'doughnut' ? DoughnutControllerChartOptions :
   T extends 'pie' ? PieControllerChartOptions :
   T extends 'bar' ? BarControllerChartOptions :
   T extends 'line' ? LineControllerChartOptions :
   T extends 'radar' ? RadarControllerChartOptions :
   T extends 'polarArea' ? PolarAreaControllerChartOptions : {});

const Chart: FC<ChartProps> = ({
  type,
  data,
  options = {},
  width = 100,
  height = 100,
  plugins = [],
}) => {
  // Common options for all chart types
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuad',
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          labelColor: (context) => {
            return {
              borderColor: 'transparent',
              backgroundColor: context.dataset.backgroundColor as string,
              borderRadius: 6
            };
          }
        }
      },
      ...options.plugins
    },
    ...options
  } as ChartTypeSpecificOptions<typeof type>;

  // Custom plugins
  const backgroundPlugin: Plugin = {
    id: 'customCanvasBackground',
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      
      const { top, left, width, height } = chartArea;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  };

  const allPlugins = [backgroundPlugin, ...plugins];

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return <Pie data={data} options={commonOptions}  width={width} height={height} />;
      case 'doughnut':
        return <Doughnut data={data} options={commonOptions}  width={width} height={height} />;
      case 'bar':
        return <Bar data={data} options={commonOptions}  width={width} height={height} />;
      case 'line':
        return <Line data={data} options={commonOptions}  width={width} height={height} />;
      case 'radar':
        return <Radar data={data} options={commonOptions}  width={width} height={height} />;
      case 'polarArea':
        return <PolarArea data={data} options={commonOptions}  width={width} height={height} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="relative w-full h-full">
      {renderChart()}
    </div>
  );
};

export default Chart;