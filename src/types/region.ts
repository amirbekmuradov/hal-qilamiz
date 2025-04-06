export interface Region {
    id: string;
    name: string;
    code: string;
    description?: string;
    population: number;
    imageUrl?: string;
    localGovernmentWebsite?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    boundary?: {
      type: string;
      coordinates: [[[number]]]; // GeoJSON format
    };
    imageUrl?: string | null;
    statisticsUrl?: string | null;
    localGovernmentWebsite?: string | null;
    subRegions?: {
      name: string;
      code: string;
    }[];
    officialRepresentatives?: {
      id: string;
      name: string;
      position: string;
      department?: string;
      profilePictureUrl?: string | null;
      Representative[];
    }[];
    issueStatistics?: {
      total: number;
      pending: number;
      inProgress: number;
      resolved: number;
      resolutionRate: number;
    };
    isActive?: boolean;
  }
  
  export interface RegionStatistics {
    period: number;
    dailyStats: {
      date: string;
      Pending: number;
      'In Progress': number;
      Resolved: number;
      total: number;
    }[];
    overallStats: {
      totalIssues: number;
      pendingIssues: number;
      inProgressIssues: number;
      resolvedIssues: number;
      resolutionRate: number;
      averageResolutionTime: number;
    };
    // Issue categories breakdown
  issuesByCategory: {
    name: string;
    count: number;
    percentage: number;
  }[];

  // Issues over time
  issuesTimeline: {
    date: string;
    count: number;
  }[];

  // Response times
  responseTimes?: {
    initialResponse: string; // e.g., "24h" or "3 days"
    assignmentTime: string;
    resolutionTime: string;
    satisfactionRate: number; // percentage
  };

  // Top issues in the region
  topIssues?: {
    id: string;
    title: string;
    votes: number;
    comments: number;
    status: string;
  }[];

  // Comparison with other regions
  regionComparison?: {
    issuesPerCapita: {
      current: number;
      average: number;
      highest: number;
    };
    resolutionRate: {
      current: number;
      average: number;
    };
  };
  }

  export interface Representative {
    id: string;
    name: string;
    position: string;
    department?: string;
    profilePictureUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
  }