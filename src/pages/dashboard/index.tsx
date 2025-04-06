import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getDashboardStatistics, getTrendingUsers } from '../../services/api';
import Layout from '../../components/layout/Layout';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DashboardChart from '../../components/dashboard/DashboardChart';
import RegionalMap from '../../components/dashboard/RegionalMap';
import TrendingIssuesWidget from '../../components/dashboard/TrendingIssuesWidget';
import TrendingUsersWidget from '../../components/dashboard/TrendingUsersWidget';
import RecentActivityWidget from '../../components/dashboard/RecentActivityWidget';
import { DashboardStatistics } from '../../types/dashboard';
import { User } from '../../types/user';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [trendingUsers, setTrendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30'); // Default: 30 days
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard statistics
        const statsData = await getDashboardStatistics({ period });
        setStatistics(statsData);
        
        // Fetch trending users
        const usersData = await getTrendingUsers();
        setTrendingUsers(usersData.users);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [period]);
  
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };
  
  // If loading
  if (isLoading) {
    return (
      <Layout title="Dashboard - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Dashboard - Hal Qilamiz">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="mt-4 sm:mt-0">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-uz-blue focus:border-uz-blue"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!error && statistics && (
          <>
            {/* Statistics overview cards */}
            <div className="mb-8">
              <DashboardStats statistics={statistics.overallStats} />
            </div>
            
            {/* Main charts and maps layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Issue trends chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Issue Trends</h2>
                <DashboardChart data={statistics.dailyStats} />
              </div>
              
              {/* Regional map */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Regional Overview</h2>
                <RegionalMap data={statistics.regionalStats} />
              </div>
            </div>
            
            {/* Widgets section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Trending issues widget */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Trending Issues</h2>
                </div>
                <div className="p-6">
                  <TrendingIssuesWidget issues={statistics.trendingIssues} />
                </div>
              </div>
              
              {/* Trending users widget */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Active Users</h2>
                </div>
                <div className="p-6">
                  <TrendingUsersWidget users={trendingUsers} />
                </div>
              </div>
              
              {/* Recent activity widget */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                </div>
                <div className="p-6">
                  {isAuthenticated ? (
                    <RecentActivityWidget activities={statistics.recentActivity} />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">
                        Sign in to see your recent activity
                      </p>
                      <button
                        onClick={() => router.push('/auth/login')}
                        className="px-4 py-2 bg-uz-blue text-white rounded-md hover:bg-uz-blue-dark transition-colors"
                      >
                        Sign in
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}