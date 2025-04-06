import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { voteOnIssue, subscribeToIssue, Issue, IssuePriority, IssueStatus } from '../../store/slices/issuesSlice';
import { RootState } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import VotingButtons from './VotingButtons';

interface IssueCardProps {
  issue: Issue;
  isCompact?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, isCompact = false }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Truncate text for display
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  // Handle vote
  const handleVote = (priority: IssuePriority) => {
    if (!isAuthenticated) {
      dispatch(openModal('login'));
      return;
    }
    
    dispatch(voteOnIssue({
      issueId: issue.id,
      priority,
    }));
  };
  
  // Handle subscribe
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      dispatch(openModal('login'));
      return;
    }
    
    dispatch(subscribeToIssue(issue.id));
  };
  
  // Check if user is subscribed
  const isSubscribed = user && issue.subscribers.includes(user.uid);
  
  // Get status badge classes
  const getStatusBadgeClasses = () => {
    switch (issue.status) {
      case IssueStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case IssueStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case IssueStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Compact card layout for listings
  if (isCompact) {
    return (
      <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/issues/${issue.id}`}>
                <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                  {truncateText(issue.title, 60)}
                </h3>
              </Link>
              
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span>{issue.location.regionName}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(issue.createdAt)}</span>
                <span className="mx-1">•</span>
                <span>By {issue.authorName}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses()}`}>
                {issue.status}
              </span>
              
              {issue.isEscalated && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Escalated
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {truncateText(issue.description, 150)}
            </p>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
                {issue.votes.total}
              </div>
              
              <div className="flex items-center text-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
                  />
                </svg>
                {issue.comments.length}
              </div>
            </div>
            
            <Link href={`/issues/${issue.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Full card layout for issue details page
  return (
    <div className="border rounded-lg shadow-md bg-white">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{issue.title}</h2>
            
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span>{issue.location.regionName}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(issue.createdAt)}</span>
              <span className="mx-1">•</span>
              <span>By {issue.authorName}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClasses()}`}>
              {issue.status}
            </span>
            
            {issue.isEscalated && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                Escalated
              </span>
            )}
          </div>
        </div>
        
        {/* Media gallery */}
        {issue.mediaUrls.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {issue.mediaUrls.map((url, index) => (
                <div key={index} className="relative h-48 w-full">
                  <img
                    src={url}
                    alt={`Issue media ${index + 1}`}
                    className="h-48 w-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className="mt-4">
          <p className="text-gray-700 whitespace-pre-line">
            {issue.description}
          </p>
        </div>
        
        {/* Expected response time */}
        {issue.responseTimeExpected && (
          <div className="mt-4 bg-blue-50 p-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-blue-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Expected response by</h3>
                <p className="mt-1 text-sm text-blue-700">
                  {formatDate(issue.responseTimeExpected)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Resolution steps if any */}
        {issue.resolutionSteps && issue.resolutionSteps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Resolution Progress</h3>
            <ul className="mt-2 space-y-3">
              {issue.resolutionSteps.map((step) => (
                <li key={step.id} className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  } flex items-center justify-center mt-1`}>
                    {step.status === 'completed' && (
                      <svg 
                        className="h-3 w-3 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">{step.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.status === 'completed' ? 'Completed on ' : 'Expected by '}
                      {formatDate(step.date)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Voting and subscription */}
        <div className="mt-6">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <VotingButtons 
                issueId={issue.id} 
                votes={issue.votes} 
                onVote={handleVote}
              />
              
              <div className="mt-3 sm:mt-0">
                <Button
                  variant={isSubscribed ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleSubscribe}
                  icon={
                    <svg 
                      className="h-5 w-5 mr-1" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  }
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe to updates'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;