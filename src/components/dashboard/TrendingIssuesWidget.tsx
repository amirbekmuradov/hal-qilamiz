import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyStats {
  date: string;
  Pending: number;
  'In Progress': number;
  Resolved: number;
  total: number;
}

interface DashboardChartProps {
  data: DailyStats[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

   // ✅ Add this check right here
   if (!data || !Array.isArray(data)) return null;
   
  // Prepare chart data
  const chartData: ChartData<'line' | 'bar'> = {
    
    labels: data.map(item => {
      // Format date to be more readable (e.g., Jan 1)
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Pending',
        data: data.map(item => item.Pending),
        backgroundColor: 'rgba(255, 186, 8, 0.5)',
        borderColor: 'rgb(255, 186, 8)',
        borderWidth: 2,
      },
      {
        label: 'In Progress',
        data: data.map(item => item['In Progress']),
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 2,
      },
      {
        label: 'Resolved',
        data: data.map(item => item.Resolved),
        backgroundColor: 'rgba(0, 166, 80, 0.5)',
        borderColor: 'rgb(0, 166, 80)',
        borderWidth: 2,
      },
      {
        label: 'Total',
        data: data.map(item => item.total),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        // Only show Total line in line chart
        hidden: chartType === 'bar',
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-80">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          className={`px-3 py-1 text-sm rounded-md ${
            chartType === 'line'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setChartType('line')}
        >
          Line
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-md ${
            chartType === 'bar'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setChartType('bar')}
        >
          Bar
        </button>
      </div>
      
      <div className="h-full">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default DashboardChart;