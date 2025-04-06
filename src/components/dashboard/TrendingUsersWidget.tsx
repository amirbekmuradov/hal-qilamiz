import React from 'react';
import Link from 'next/link';
import { User } from '../../types/user';

interface TrendingUsersWidgetProps {
  users: User[];
}

const TrendingUsersWidget: React.FC<TrendingUsersWidgetProps> = ({ users }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No active users available.
      </div>
    );
  }

  return (
    <div>
      {users.map((user, index) => (
        <Link 
          key={user.id} 
          href={`/profile/${user.id}`}
          className="block"
        >
          <div className={`py-3 ${index !== users.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </div>
                
                <div className="flex items-center mt-1">
                  {/* Activity score visualization */}
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, user.activityScore || 0)}%` }}
                    />
                  </div>
                  
                  {/* Badges */}
                  <div className="ml-3 flex flex-wrap">
                    {user.badges && user.badges.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-2 flex items-center space-x-1">
                {/* Recent activity summary */}
                {user.recentActivity && (
                  <>
                    {user.recentActivity.issuesCreated > 0 && (
                      <div className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {user.recentActivity.issuesCreated} issues
                      </div>
                    )}
                    
                    {user.recentActivity.commentsPosted > 0 && (
                      <div className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                        {user.recentActivity.commentsPosted} comments
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
      
      <div className="text-center pt-4">
        <Link 
          href="/users" 
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View all users →
        </Link>
      </div>
    </div>
  );
};

export default TrendingUsersWidget;