import React from 'react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'issue_created' | 'issue_commented' | 'issue_voted' | 'issue_subscribed';
  issueId: string;
  issueTitle: string;
  timestamp: string;
  content?: string;
}

interface RecentActivityWidgetProps {
  activities: Activity[];
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true
      });
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get activity icon
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'issue_created':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'issue_commented':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'issue_voted':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
        );
      case 'issue_subscribed':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Get activity text
  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'issue_created':
        return 'Created an issue:';
      case 'issue_commented':
        return 'Commented on:';
      case 'issue_voted':
        return 'Voted on:';
      case 'issue_subscribed':
        return 'Subscribed to:';
      default:
        return 'Interacted with:';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No recent activity available.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {/* Connect line between items */}
              {index !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex space-x-3">
                {/* Activity icon */}
                {getActivityIcon(activity.type)}
                
                <div className="min-w-0 flex-1">
                  <div>
                    {/* Activity type and time */}
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {getActivityText(activity)}
                      </span>
                      {' '}
                      <span className="text-gray-500">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Issue title */}
                  <div className="mt-1">
                    <Link
                      href={`/issues/${activity.issueId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {activity.issueTitle}
                    </Link>
                  </div>
                  
                  {/* Comment content if available */}
                  {activity.type === 'issue_commented' && activity.content && (
                    <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      "{activity.content}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="text-center pt-2">
        <Link 
          href="/profile" 
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
};

export default RecentActivityWidget;