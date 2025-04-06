// Define user role types
export enum UserRole {
    USER = 'user',
    MODERATOR = 'moderator',
    ADMIN = 'admin',
    OFFICIAL = 'official', // Government representatives
  }
  
  // Define badge types
  export enum BadgeType {
    COMMUNITY_HERO = 'Community Hero',
    REGIONAL_ADVOCATE = 'Regional Advocate',
    ISSUE_SOLVER = 'Issue Solver',
    ACTIVE_VOTER = 'Active Voter',
    VERIFIED_RESIDENT = 'Verified Resident',
  }
  
  // Define user profile type
  export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    region: {
      id: string;
      name: string;
    };
    role: UserRole;
    trustScore: number;
    badges: BadgeType[];
    isVerified: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    isIdVerified: boolean;
    createdAt: string;
    lastActive: string;
    profilePictureUrl?: string;
    bio?: string;
    organization?: string; // For official accounts
    position?: string; // For official accounts
  }
  
  // Define activity type
  export interface UserActivity {
    id: string;
    type: 'issue_created' | 'issue_commented' | 'issue_voted' | 'issue_subscribed';
    issueId: string;
    issueTitle: string;
    timestamp: string;
  }
  
  // Define user statistics type
  export interface UserStatistics {
    issuesCreated: number;
    issuesResolved: number;
    commentsPosted: number;
    votesGiven: number;
    totalActivity: number;
    activeDays: number;
  }
  
  // Form submission types
  export interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    regionId: string;
  }
  
  export interface LoginFormData {
    email: string;
    password: string;
  }
  
  export interface ProfileUpdateFormData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    regionId?: string;
    bio?: string;
    profilePicture?: File;
  }
  
  // API response types
  export interface AuthResponse {
    user: UserProfile;
    token: string;
    message: string;
  }
  
  export interface UserProfileResponse {
    user: UserProfile;
    statistics: UserStatistics;
    recentActivity: UserActivity[];
  }
  
  export interface UserListResponse {
    users: UserProfile[];
    totalCount: number;
    page: number;
    limit: number;
  }