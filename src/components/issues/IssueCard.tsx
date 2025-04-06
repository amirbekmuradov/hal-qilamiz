import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { voteOnIssue, subscribeToIssue } from '../../store/slices/issuesSlice';
import { Issue, IssuePriority, IssueStatus } from '../../types/issue';
import { RootState, AppDispatch } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import VotingButtons from './VotingButtons';

interface IssueCardProps {
  issue: Issue;
  isCompact?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, isCompact = false }) => {
  const dispatch = useDispatch<AppDispatch>();
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
  
  // Get author display name
  const getAuthorName = () => {
    const { author } = issue;
    if (author.name) return author.name;
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    if (author.firstName) return author.firstName;
    if (author.lastName) return author.lastName;
    return 'Anonymous';
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
  
  // Twitter/Thread-like card layout for all issues
  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white mb-6">
      <div className="p-4">
        <div className="flex items-start">
          {/* Author avatar */}
          <div className="mr-3 flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
              {getAuthorName().charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1">
            {/* Header with author info and status */}
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{getAuthorName()}</span>
                <span className="mx-1 text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatDate(issue.createdAt)}</span>
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
            
            {/* Issue title */}
            <h3 className="text-xl font-semibold text-gray-900 mt-1">
              {issue.title}
            </h3>
            
            {/* Location */}
            <div className="text-sm text-gray-500 mt-1">
              <span>{issue.location.regionName}</span>
            </div>
            
            {/* Description */}
            <p className="text-base text-gray-600 mt-3">
              {isCompact ? truncateText(issue.description, 200) : issue.description}
            </p>
            
            {/* Media (if available) */}
            {issue.mediaUrls.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={issue.mediaUrls[0]}
                  alt={`Issue media`}
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
            
            {/* Action bar - similar to Twitter */}
            <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
              {/* Comment button */}
              <Link href={`/issues/${issue.id}`} className="flex items-center text-gray-500 hover:text-uz-blue transition-colors">
                <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{issue.comments.length}</span>
              </Link>
              
              {/* Voting */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleVote(IssuePriority.IMPORTANT)}
                  className="flex items-center text-gray-500 hover:text-yellow-500 transition-colors px-2"
                >
                  <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{issue.votes[IssuePriority.IMPORTANT]}</span>
                </button>
                <button
                  onClick={() => handleVote(IssuePriority.VERY_IMPORTANT)}
                  className="flex items-center text-gray-500 hover:text-orange-500 transition-colors px-2"
                >
                  <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{issue.votes[IssuePriority.VERY_IMPORTANT]}</span>
                </button>
                <button
                  onClick={() => handleVote(IssuePriority.URGENT)}
                  className="flex items-center text-gray-500 hover:text-red-500 transition-colors px-2"
                >
                  <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span>{issue.votes[IssuePriority.URGENT]}</span>
                </button>
              </div>
              
              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                className={`flex items-center transition-colors ${isSubscribed ? 'text-uz-blue' : 'text-gray-500 hover:text-uz-blue'}`}
              >
                <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {!isCompact && (
        <div className="border-t border-gray-100 p-4">
          {/* Resolution steps, comments section, etc. can go here */}
        </div>
      )}
    </div>
  );
  
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
              <span>By {getAuthorName()}</span>
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