import { Issue } from './issue';
import { Region } from './region';

export interface DailyStats {
  date: string;
  Pending: number;
  'In Progress': number;
  Resolved: number;
  total: number;
}

export interface RegionStats {
  id: string;
  name: string;
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'issue_created' | 'issue_commented' | 'issue_voted' | 'issue_subscribed';
  issueId: string;
  issueTitle: string;
  timestamp: string;
  content?: string;
}

export interface DashboardStatistics {
  overallStats: {
    totalIssues: number;
    pendingIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    resolutionRate: number;
    activeUsers: number;
    averageResolutionTime: number;
  };
  dailyStats: DailyStats[];
  regionalStats: RegionStats[];
  trendingIssues: Issue[];
  recentActivity: ActivityItem[];
}