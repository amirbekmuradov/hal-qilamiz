import React from 'react';

interface StatItemProps {
  title: string;
  value: string | number;
  change?: number;
  bgColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ title, value, change, bgColor, textColor, icon }) => (
  <div className={`${bgColor} rounded-lg shadow-sm p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`mt-1 text-2xl font-bold ${textColor}`}>{value}</p>
        
        {change !== undefined && (
          <div className="mt-1">
            <span className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="ml-1 text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </div>
      {icon && (
        <div className={`${textColor} opacity-70`}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

interface DashboardStatsProps {
  statistics: {
    totalIssues: number;
    pendingIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    resolutionRate: number;
    activeUsers: number;
    averageResolutionTime: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem
        title="Total Issues"
        value={statistics.totalIssues.toLocaleString()}
        bgColor="bg-blue-50"
        textColor="text-blue-700"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      />
      
      <StatItem
        title="Pending Issues"
        value={statistics.pendingIssues.toLocaleString()}
        bgColor="bg-yellow-50"
        textColor="text-yellow-700"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      
      <StatItem
        title="Resolution Rate"
        value={`${statistics.resolutionRate}%`}
        bgColor="bg-green-50"
        textColor="text-green-700"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      
      <StatItem
        title="Active Users"
        value={statistics.activeUsers.toLocaleString()}
        bgColor="bg-purple-50"
        textColor="text-purple-700"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />
    </div>
  );
};

export default DashboardStats;