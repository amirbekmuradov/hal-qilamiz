// Define issue priority levels
export enum IssuePriority {
    IMPORTANT = 'Important',
    VERY_IMPORTANT = 'Very Important',
    URGENT = 'Urgent',
  }
  
  // Define issue status types
  export enum IssueStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
  }
  
  
  // Author type
  export interface Author {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl: string | null;
  }
  
  // Define the comment type
  export interface Comment {
    id: string;
    content: string;
    author: Author;
    createdAt: string;
    isOfficial: boolean;
    parentComment?: string;
    likes?: string[];
  }
  
  // Define the issue type
  export interface Issue {
    id: string;
    title: string;
    description: string;
    location: {
      regionId: string | null;
      regionName: string;
      isNationwide: boolean;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    status: IssueStatus;
    createdAt: string;
    updatedAt: string;
    author: Author;
    votes: {
      [IssuePriority.IMPORTANT]: number;
      [IssuePriority.VERY_IMPORTANT]: number;
      [IssuePriority.URGENT]: number;
      total: number;
    };
    mediaUrls: string[];
    comments: Comment[];
    subscribers: string[];
    responseTimeExpected?: string | null;
    isEscalated: boolean;
    // For resolution tracking
    resolutionSteps?: {
      id: string;
      description: string;
      status: 'pending' | 'completed';
      date: string;
      updatedBy: string;
    }[];
    lastUpdatedBy?: Author;
  }
  
  // Form submission type
  export interface IssueFormData {
    title: string;
    description: string;
    regionId: string;
    isNationwide: boolean;
    media: File[];
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }
  
  // API response types
  export interface IssueListResponse {
    issues: Issue[];
    totalCount?: number;
    page?: number;
    limit?: number;
  }
  
  export interface IssueResponse {
    issue: Issue;
  }
  
  export interface VoteResponse {
    issueId: string;
    votes: Issue['votes'];
    message?: string;
  }
  
  export interface CommentResponse {
    issueId: string;
    comment: Comment;
  }