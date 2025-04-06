import React from 'react';
import { IssuePriority } from '../../store/slices/issuesSlice';

interface VotingButtonsProps {
  issueId: string;
  votes: {
    [key: string]: number;
    total: number;
  };
  onVote: (priority: IssuePriority) => void;
  compact?: boolean;
}

const VotingButtons: React.FC<VotingButtonsProps> = ({
  issueId,
  votes,
  onVote,
  compact = false,
}) => {
  // Vote button styles
  const getButtonStyle = (priority: IssuePriority) => {
    switch (priority) {
      case IssuePriority.IMPORTANT:
        return {
          base: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
          active: 'bg-blue-100 border-blue-500',
        };
      case IssuePriority.VERY_IMPORTANT:
        return {
          base: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
          active: 'bg-yellow-100 border-yellow-500',
        };
      case IssuePriority.URGENT:
        return {
          base: 'bg-red-50 text-red-700 hover:bg-red-100',
          active: 'bg-red-100 border-red-500',
        };
      default:
        return {
          base: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
          active: 'bg-gray-100 border-gray-500',
        };
    }
  };

  if (compact) {
    // Compact view for issue cards in list
    return (
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => onVote(IssuePriority.IMPORTANT)}
          className={`rounded-md px-2 py-1 text-xs font-medium ${getButtonStyle(IssuePriority.IMPORTANT).base}`}
          aria-label="Vote as Important"
        >
          <span className="flex items-center">
            <span className="mr-1">🔵</span>
            <span>{votes[IssuePriority.IMPORTANT] || 0}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote(IssuePriority.VERY_IMPORTANT)}
          className={`rounded-md px-2 py-1 text-xs font-medium ${getButtonStyle(IssuePriority.VERY_IMPORTANT).base}`}
          aria-label="Vote as Very Important"
        >
          <span className="flex items-center">
            <span className="mr-1">🟡</span>
            <span>{votes[IssuePriority.VERY_IMPORTANT] || 0}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote(IssuePriority.URGENT)}
          className={`rounded-md px-2 py-1 text-xs font-medium ${getButtonStyle(IssuePriority.URGENT).base}`}
          aria-label="Vote as Urgent"
        >
          <span className="flex items-center">
            <span className="mr-1">🔴</span>
            <span>{votes[IssuePriority.URGENT] || 0}</span>
          </span>
        </button>
      </div>
    );
  }

  // Full view for issue details page
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 mb-1">How important is this issue?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onVote(IssuePriority.IMPORTANT)}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${getButtonStyle(IssuePriority.IMPORTANT).base}`}
        >
          <span className="mr-1">🔵</span>
          <span>Important</span>
          <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
            {votes[IssuePriority.IMPORTANT] || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote(IssuePriority.VERY_IMPORTANT)}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${getButtonStyle(IssuePriority.VERY_IMPORTANT).base}`}
        >
          <span className="mr-1">🟡</span>
          <span>Very Important</span>
          <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
            {votes[IssuePriority.VERY_IMPORTANT] || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote(IssuePriority.URGENT)}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${getButtonStyle(IssuePriority.URGENT).base}`}
        >
          <span className="mr-1">🔴</span>
          <span>Urgent</span>
          <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
            {votes[IssuePriority.URGENT] || 0}
          </span>
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Total votes: {votes.total}
      </p>
    </div>
  );
};

export default VotingButtons;