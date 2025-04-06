import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue, IssueStatus, IssuePriority, Comment } from '../../types/issue';
import { createIssue as apiCreateIssue, 
         getIssues as apiGetIssues,
         getIssueById as apiGetIssueById,
         voteOnIssue as apiVoteOnIssue,
         commentOnIssue as apiCommentOnIssue,
         subscribeToIssue as apiSubscribeToIssue,
         getTrendingIssues as apiGetTrendingIssues,
         getTackledIssues as apiGetTackledIssues } from '../../services/api';

// Define the state structure
interface IssuesState {
  issues: Issue[];
  trendingIssues: Issue[];
  tackledIssues: Issue[];
  userIssues: Issue[];
  currentIssue: Issue | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    region: string | null;
    status: IssueStatus | null;
    searchQuery: string;
  };
}

// Helper function to determine if we should use mock data
const useMockData = () => process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

// Helper functions for mock data persistence
const getMockIssues = () => {
  if (typeof window === 'undefined') {
    // Return empty array during server-side rendering
    return [];
  }
  
  // Client-side: get from localStorage
  const stored = localStorage.getItem('mockIssues');
  if (!stored) {
    // Initialize with some default mock data
    const defaultMockIssues = [{
      id: '1',
      title: 'Water supply interruption in Yunusabad district',
      description: 'Frequent water supply interruptions in Yunusabad district blocks 14-18. The problem has been ongoing for the past two weeks.',
      status: IssueStatus.PENDING,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        id: '1',
        firstName: 'Alisher',
        lastName: 'Usmanov',
        profilePictureUrl: null
      },
      location: { 
        regionId: 'tashkent', 
        regionName: 'Tashkent', 
        isNationwide: false 
      },
      votes: { 
        Important: 24, 
        'Very Important': 68, 
        Urgent: 133, 
        total: 225 
      },
      comments: [],
      subscribers: [],
      isEscalated: true,
      mediaUrls: []
    }];
    localStorage.setItem('mockIssues', JSON.stringify(defaultMockIssues));
    return defaultMockIssues;
  }
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

const saveMockIssues = (issues: Issue[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mockIssues', JSON.stringify(issues));
};

// Initial state
const initialState: IssuesState = {
  issues: [],  // Start with empty array, will be populated after mount
  trendingIssues: [],
  tackledIssues: [],
  userIssues: [],
  currentIssue: null,
  isLoading: false,
  error: null,
  filter: {
    region: null,
    status: null,
    searchQuery: '',
  },
};

// Async thunks for issues
export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (_, { rejectWithValue, getState }) => {
    try {
      if (useMockData()) {
        // Get issues from localStorage
        const issues = getMockIssues();
        return { issues };
      } else {
        const state = getState() as { issues: IssuesState };
        const response = await apiGetIssues(state.issues.filter);
        return response;
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch issues');
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (issueId: string, { rejectWithValue }) => {
    try {
      // For development, return mock data
      // In production, we'd use the API
      return {
        issue: {
          id: issueId,
          title: 'Water supply interruption in Yunusabad district',
          description: 'Frequent water supply interruptions in Yunusabad district blocks 14-18. The problem has been ongoing for the past two weeks.',
          status: IssueStatus.PENDING,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            id: '1',
            name: 'Alisher Usmanov',
            profilePictureUrl: null
          },
          location: { 
            regionId: 'tashkent', 
            regionName: 'Tashkent', 
            isNationwide: false 
          },
          votes: { 
            Important: 24, 
            'Very Important': 68, 
            Urgent: 133, 
            total: 225 
          },
          comments: [
            {
              id: 'c1',
              content: 'I am experiencing the same issue. It has been very difficult without water.',
              author: { 
                id: '2', 
                name: 'Dilnoza Karimova', 
                profilePictureUrl: null 
              },
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              isOfficial: false
            },
            {
              id: 'c2',
              content: 'We are aware of the issue and working to resolve it. The water supply should be restored within 48 hours.',
              author: { 
                id: '3', 
                name: 'City Water Department', 
                profilePictureUrl: null 
              },
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              isOfficial: true
            }
          ],
          subscribers: ['1', '2', '3'],
          isEscalated: true,
          mediaUrls: []
        }
      };
      
      // Actual API call for production
      // const response = await apiGetIssueById(issueId);
      // return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch issue');
    }
  }
);

export const fetchTrendingIssues = createAsyncThunk(
  'issues/fetchTrendingIssues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGetTrendingIssues();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch trending issues');
    }
  }
);

export const fetchTackledIssues = createAsyncThunk(
  'issues/fetchTackledIssues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGetTackledIssues();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tackled issues');
    }
  }
);

// Add the missing createIssue thunk
export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData: Partial<Issue>, { rejectWithValue }) => {
    try {
      if (useMockData()) {
        // Mock response
        const mockIssue: Issue = {
          id: Math.random().toString(36).substring(2, 11),
          title: issueData.title || 'New Issue',
          description: issueData.description || 'Issue description',
          status: issueData.status || IssueStatus.PENDING,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: '1',
            firstName: 'Current',
            lastName: 'User',
            profilePictureUrl: null
          },
          location: issueData.location || { 
            regionId: 'tashkent', 
            regionName: 'Tashkent', 
            isNationwide: false 
          },
          votes: { 
            Important: 0, 
            'Very Important': 0, 
            Urgent: 0, 
            total: 0 
          },
          comments: [],
          subscribers: ['1'],
          isEscalated: false,
          mediaUrls: issueData.mediaUrls || []
        };

        // Get existing issues and add the new one
        const existingIssues = getMockIssues();
        const updatedIssues = [mockIssue, ...existingIssues];
        saveMockIssues(updatedIssues);
        
        return { issue: mockIssue };
      } else {
        const response = await apiCreateIssue(issueData);
        return response;
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create issue');
    }
  }
);

export const voteOnIssue = createAsyncThunk(
  'issues/voteOnIssue',
  async ({ issueId, priority }: { issueId: string; priority: IssuePriority }, { rejectWithValue }) => {
    try {
      // In a real app, we'd call the API and update the vote
      // const response = await apiVoteOnIssue(issueId, priority);
      // return response;
      
      // For development, mock the response
      return {
        issueId,
        votes: {
          Important: 25,
          'Very Important': 68,
          Urgent: 133,
          total: 226
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to vote on issue');
    }
  }
);

export const commentOnIssue = createAsyncThunk(
  'issues/commentOnIssue',
  async ({ issueId, content }: { issueId: string; content: string }, { rejectWithValue }) => {
    try {
      // In a real app, we'd call the API and add the comment
      // const response = await apiCommentOnIssue(issueId, content);
      // return response;
      
      // For development, mock the response
      const mockComment: Comment = {
        id: Math.random().toString(36).substring(2, 11),
        content,
        author: {
          id: '1',
          name: 'Current User',
          profilePictureUrl: null
        },
        createdAt: new Date().toISOString(),
        isOfficial: false
      };
      
      return { issueId, comment: mockComment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

export const subscribeToIssue = createAsyncThunk(
  'issues/subscribeToIssue',
  async (issueId: string, { rejectWithValue }) => {
    try {
      // In a real app, we'd call the API and update the subscription
      // const response = await apiSubscribeToIssue(issueId);
      // return response;
      
      // For development, mock the response
      return {
        issueId,
        subscribed: true,
        subscriberCount: 4
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to subscribe to issue');
    }
  }
);

// Create the issues slice
const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<IssuesState['filter']>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilters(state) {
      state.filter = initialState.filter;
    },
    initializeMockData(state) {
      if (useMockData()) {
        state.issues = getMockIssues();
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTackledIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      
      builder.addCase(fetchTackledIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tackledIssues = action.payload.tackledIssues;
      });
      
      builder.addCase(fetchTackledIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    builder.addCase(fetchTrendingIssues.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTrendingIssues.fulfilled, (state, action) => {
      state.isLoading = false;
      state.trendingIssues = action.payload.trendingIssues;
    });
    builder.addCase(fetchTrendingIssues.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
      
    // Fetch all issues
    builder.addCase(fetchIssues.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchIssues.fulfilled, (state, action) => {
      state.isLoading = false;
      state.issues = action.payload.issues;
      if (useMockData()) {
        saveMockIssues(state.issues);
      }
    });
    builder.addCase(fetchIssues.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch issue by id
    builder.addCase(fetchIssueById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchIssueById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentIssue = action.payload.issue;
    });
    builder.addCase(fetchIssueById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create issue
    builder.addCase(createIssue.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createIssue.fulfilled, (state, action) => {
      state.isLoading = false;
      state.issues = [action.payload.issue, ...state.issues];
      if (useMockData()) {
        saveMockIssues(state.issues);
      }
    });
    builder.addCase(createIssue.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Vote on issue
    builder.addCase(voteOnIssue.fulfilled, (state, action) => {
      // Update the votes for the issue in the issues array
      const issueIndex = state.issues.findIndex(issue => issue.id === action.payload.issueId);
      if (issueIndex !== -1) {
        state.issues[issueIndex].votes = action.payload.votes;
      }
      
      // Update the current issue if it's the same
      if (state.currentIssue && state.currentIssue.id === action.payload.issueId) {
        state.currentIssue.votes = action.payload.votes;
      }
    });

    // Comment on issue
    builder.addCase(commentOnIssue.fulfilled, (state, action) => {
      // Update the comments for the issue
      if (state.currentIssue && state.currentIssue.id === action.payload.issueId) {
        state.currentIssue.comments.push(action.payload.comment);
      }
    });

    // Subscribe to issue
    builder.addCase(subscribeToIssue.fulfilled, (state, action) => {
      // Add the current user to the subscribers list if not already there
      if (state.currentIssue && state.currentIssue.id === action.payload.issueId) {
        // This is just for development - in production, we'd get the actual list of subscribers
        if (action.payload.subscribed) {
          // Add the current user if they're not already a subscriber
          if (!state.currentIssue.subscribers.includes('1')) {
            state.currentIssue.subscribers.push('1');
          }
        } else {
          // Remove the current user from subscribers
          state.currentIssue.subscribers = state.currentIssue.subscribers.filter(id => id !== '1');
        }
      }
    });
  },
});

export const { setFilter, clearFilters, initializeMockData } = issuesSlice.actions;
export default issuesSlice.reducer;