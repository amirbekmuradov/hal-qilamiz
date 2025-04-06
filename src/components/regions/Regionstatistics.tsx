import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyStat {
  date: string;
  Pending: number;
  'In Progress': number;
  Resolved: number;
  total: number;
}

interface OverallStats {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  resolutionRate: string;
  averageResolutionTime: string;
}

interface RegionStatisticsProps {
  statistics: {
    period: number;
    dailyStats: DailyStat[];
    overallStats: OverallStats;
  };
}

const RegionStatistics: React.FC<RegionStatisticsProps> = ({ statistics }) => {
  const { overallStats, dailyStats } = statistics;

  // Prepare chart data for daily statistics
  const chartData: ChartData<'line'> = {
    labels: dailyStats.map((stat) => {
      const dateObj = new Date(stat.date);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Pending',
        data: dailyStats.map((stat) => stat.Pending),
        backgroundColor: 'rgba(255, 186, 8, 0.5)',
        borderColor: 'rgb(255, 186, 8)',
        borderWidth: 2,
      },
      {
        label: 'In Progress',
        data: dailyStats.map((stat) => stat['In Progress']),
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 2,
      },
      {
        label: 'Resolved',
        data: dailyStats.map((stat) => stat.Resolved),
        backgroundColor: 'rgba(0, 166, 80, 0.5)',
        borderColor: 'rgb(0, 166, 80)',
        borderWidth: 2,
      },
      {
        label: 'Total',
        data: dailyStats.map((stat) => stat.total),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
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
    <div>
      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-700">Total Issues</p>
          <p className="text-2xl font-bold text-blue-900">{overallStats.totalIssues}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{overallStats.pendingIssues}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <p className="text-sm text-indigo-700">In Progress</p>
          <p className="text-2xl font-bold text-indigo-900">{overallStats.inProgressIssues}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-green-700">Resolved</p>
          <p className="text-2xl font-bold text-green-900">{overallStats.resolvedIssues}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-sm text-purple-700">Resolution Rate</p>
          <p className="text-2xl font-bold text-purple-900">{overallStats.resolutionRate}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-700">Avg. Resolution Time</p>
          <p className="text-2xl font-bold text-gray-900">
            {overallStats.averageResolutionTime} days
          </p>
        </div>
      </div>

      {/* Daily Statistics Chart */}
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default RegionStatistics;
