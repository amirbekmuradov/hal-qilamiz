import axios from 'axios';
import { Issue, IssueStatus } from '../types/issue';
import { User, UserProfile } from '../types/user';
import { Region, RegionStatistics } from '../types/region';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication services
export const registerUser = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// User services
export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userData: any) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await api.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getTrendingUsers = async () => {
  // For development, return mock data
  // In production, uncomment the API call
  // const response = await api.get('/users/trending');
  // return response.data;
  
  return {
    users: [
      {
        id: '1',
        firstName: 'Alisher',
        lastName: 'Usmanov',
        profilePictureUrl: null,
        trustScore: 85,
        badges: ['Community Hero', 'Active Voter'],
        activityScore: 90,
        recentActivity: {
          issuesCreated: 5,
          commentsPosted: 12,
          voteCount: 32,
        },
      },
      {
        id: '2',
        firstName: 'Dilnoza',
        lastName: 'Karimova',
        profilePictureUrl: null,
        trustScore: 78,
        badges: ['Regional Advocate'],
        activityScore: 75,
        recentActivity: {
          issuesCreated: 3,
          commentsPosted: 8,
          voteCount: 21,
        },
      },
      {
        id: '3',
        firstName: 'Bobur',
        lastName: 'Alimov',
        profilePictureUrl: null,
        trustScore: 92,
        badges: ['Issue Solver', 'Verified Resident'],
        activityScore: 88,
        recentActivity: {
          issuesCreated: 7,
          commentsPosted: 15,
          voteCount: 40,
        },
      },
    ],
  };
};

// Issue services
export const getIssues = async (filters: any = {}) => {
  const response = await api.get('/issues', { params: filters });
  return response.data;
};

export const getTrendingIssues = async () => {
  const response = await api.get('/issues/trending');
  return response.data;
};

export const getTackledIssues = async () => {
  const response = await api.get('/issues/tackled');
  return response.data;
};

export const getIssueById = async (issueId: string) => {
  const response = await api.get(`/issues/${issueId}`);
  return response.data;
};

export const createIssue = async (issueData: any) => {
  const response = await api.post('/issues', issueData);
  return response.data;
};

export const updateIssue = async (issueId: string, issueData: any) => {
  const response = await api.put(`/issues/${issueId}`, issueData);
  return response.data;
};

export const voteOnIssue = async (issueId: string, priority: string) => {
  const response = await api.post(`/issues/${issueId}/vote`, { priority });
  return response.data;
};

export const subscribeToIssue = async (issueId: string) => {
  const response = await api.post(`/issues/${issueId}/subscribe`);
  return response.data;
};

export const commentOnIssue = async (issueId: string, content: string) => {
  const response = await api.post(`/issues/${issueId}/comment`, { content });
  return response.data;
};

export const getUserIssues = async (userId: string, filters: any = {}) => {
  const response = await api.get(`/users/${userId}/issues`, { params: filters });
  return response.data;
};

// Region services
export const getAllRegions = async () => {
  // For development, return mock data
  // In production, uncomment the API call
  // const response = await api.get('/regions');
  // return response.data;
  
  return {
    regions: [
      {
        id: 'tashkent',
        code: 'tashkent',
        name: 'Tashkent',
        description: 'The capital city of Uzbekistan',
        population: 2500000,
        coordinates: { latitude: 41.2995, longitude: 69.2401 },
        imageUrl: null,
      },
      {
        id: 'samarkand',
        code: 'samarkand',
        name: 'Samarkand',
        description: 'Historic city and a UNESCO World Heritage Site',
        population: 500000,
        coordinates: { latitude: 39.6542, longitude: 66.9597 },
        imageUrl: null,
      },
      {
        id: 'bukhara',
        code: 'bukhara',
        name: 'Bukhara',
        description: 'Ancient city with well-preserved historical monuments',
        population: 280000,
        coordinates: { latitude: 39.7747, longitude: 64.4286 },
        imageUrl: null,
      },
    ],
  };
};

export const getRegionById = async (regionId: string) => {
  // For development, return mock data
  // In production, uncomment the API call
  // const response = await api.get(`/regions/${regionId}`);
  // return response.data;
  
  return {
    region: {
      id: regionId,
      name: regionId.charAt(0).toUpperCase() + regionId.slice(1),
      code: regionId,
      description: 'Region description would go here',
      population: 1000000,
      coordinates: { latitude: 41.2995, longitude: 69.2401 },
      imageUrl: null,
      issueStatistics: {
        total: 245,
        pending: 87,
        inProgress: 98,
        resolved: 60,
        resolutionRate: 24.5,
      },
      officialRepresentatives: [
        {
          id: 'rep1',
          name: 'Aziz Kholmatov',
          position: 'Regional Manager',
          department: 'Public Works',
          profilePictureUrl: null,
        },
      ],
    },
  };
};

export const getRegionIssues = async (regionId: string, filters: any = {}) => {
  const response = await api.get(`/regions/${regionId}/issues`, { params: filters });
  return response.data;
};

export const getRegionStatistics = async (regionId: string, params: any = {}) => {
  // For development, return mock data
  // In production, uncomment the API call
  // const response = await api.get(`/regions/${regionId}/statistics`, { params });
  // return response.data;
  
  return {
    period: params.period || 30,
    dailyStats: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        Pending: Math.floor(Math.random() * 10) + 5,
        'In Progress': Math.floor(Math.random() * 15) + 5,
        Resolved: Math.floor(Math.random() * 8) + 1,
        total: Math.floor(Math.random() * 20) + 15,
      };
    }),
    overallStats: {
      totalIssues: 245,
      pendingIssues: 87,
      inProgressIssues: 98,
      resolvedIssues: 60,
      resolutionRate: 24.5,
      averageResolutionTime: 12.3,
    },
  };
};

// Dashboard services
export const getDashboardStatistics = async (params: any = {}) => {
  // For development, return mock data
  // In production, uncomment the API call
  // const response = await api.get('/dashboard/statistics', { params });
  // return response.data;
  
  return {
    overallStats: {
      totalIssues: 3245,
      pendingIssues: 987,
      inProgressIssues: 1158,
      resolvedIssues: 1100,
      resolutionRate: 33.9,
      activeUsers: 14587,
      averageResolutionTime: 14.2,
    },
    dailyStats: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        Pending: Math.floor(Math.random() * 20) + 10,
        'In Progress': Math.floor(Math.random() * 30) + 15,
        Resolved: Math.floor(Math.random() * 15) + 5,
        total: Math.floor(Math.random() * 40) + 30,
      };
    }),
    regionalStats: [
      {
        id: 'tashkent',
        name: 'Tashkent',
        totalIssues: 842,
        pendingIssues: 246,
        inProgressIssues: 375,
        resolvedIssues: 221,
        resolutionRate: 26.2,
      },
      {
        id: 'samarkand',
        name: 'Samarkand',
        totalIssues: 523,
        pendingIssues: 187,
        inProgressIssues: 205,
        resolvedIssues: 131,
        resolutionRate: 25.0,
      },
      {
        id: 'bukhara',
        name: 'Bukhara',
        totalIssues: 398,
        pendingIssues: 112,
        inProgressIssues: 146,
        resolvedIssues: 140,
        resolutionRate: 35.2,
      },
      {
        id: 'andijan',
        name: 'Andijan',
        totalIssues: 467,
        pendingIssues: 154,
        inProgressIssues: 196,
        resolvedIssues: 117,
        resolutionRate: 25.1,
      },
      {
        id: 'fergana',
        name: 'Fergana',
        totalIssues: 512,
        pendingIssues: 164,
        inProgressIssues: 203,
        resolvedIssues: 145,
        resolutionRate: 28.3,
      },
    ],
    trendingIssues: [
      {
        id: '1',
        title: 'Water supply interruption in Yunusabad district',
        description: 'Frequent water supply interruptions in Yunusabad district blocks 14-18. The problem has been ongoing for the past two weeks.',
        status: IssueStatus.PENDING,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: { regionId: 'tashkent', regionName: 'Tashkent', isNationwide: false },
        votes: { Important: 24, 'Very Important': 68, Urgent: 133, total: 225 },
        comments: Array(12).fill({}),
        isEscalated: true,
      },
      {
        id: '2',
        title: 'Road repair needed on Amir Temur street',
        description: 'Large potholes on Amir Temur street causing traffic jams and posing danger to vehicles.',
        status: IssueStatus.IN_PROGRESS,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: { regionId: 'tashkent', regionName: 'Tashkent', isNationwide: false },
        votes: { Important: 41, 'Very Important': 87, Urgent: 56, total: 184 },
        comments: Array(23).fill({}),
        isEscalated: false,
      },
      {
        id: '3',
        title: 'Garbage collection issues in Chilanzar district',
        description: 'Garbage containers are overflowing and not being emptied regularly in Chilanzar district.',
        status: IssueStatus.PENDING,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: { regionId: 'tashkent', regionName: 'Tashkent', isNationwide: false },
        votes: { Important: 52, 'Very Important': 78, Urgent: 41, total: 171 },
        comments: Array(8).fill({}),
        isEscalated: false,
      },
    ],
    recentActivity: [
      {
        id: 'act1',
        type: 'issue_created',
        issueId: '1',
        issueTitle: 'Water supply interruption in Yunusabad district',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act2',
        type: 'issue_commented',
        issueId: '2',
        issueTitle: 'Road repair needed on Amir Temur street',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        content: 'I noticed that repair work has started today. Thank you for addressing this issue!',
      },
      {
        id: 'act3',
        type: 'issue_voted',
        issueId: '3',
        issueTitle: 'Garbage collection issues in Chilanzar district',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act4',
        type: 'issue_subscribed',
        issueId: '1',
        issueTitle: 'Water supply interruption in Yunusabad district',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
};

export default api;