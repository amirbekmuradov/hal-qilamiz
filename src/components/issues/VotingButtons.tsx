import React from 'react';
import { IssuePriority } from '../../types/issue';
import Button from '../ui/Button';

interface VotingButtonsProps {
  issueId: string;
  votes: {
    [IssuePriority.IMPORTANT]: number;
    [IssuePriority.VERY_IMPORTANT]: number;
    [IssuePriority.URGENT]: number;
    total: number;
  };
  onVote: (priority: IssuePriority) => void;
  compact?: boolean;
}

const VotingButtons: React.FC<VotingButtonsProps> = ({ issueId, votes, onVote, compact = false }) => {
  const getButtonStyle = (priority: IssuePriority) => {
    switch (priority) {
      case IssuePriority.IMPORTANT:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case IssuePriority.VERY_IMPORTANT:
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case IssuePriority.URGENT:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className={getButtonStyle(IssuePriority.IMPORTANT)}
          onClick={() => onVote(IssuePriority.IMPORTANT)}
        >
          {votes[IssuePriority.IMPORTANT]}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={getButtonStyle(IssuePriority.VERY_IMPORTANT)}
          onClick={() => onVote(IssuePriority.VERY_IMPORTANT)}
        >
          {votes[IssuePriority.VERY_IMPORTANT]}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={getButtonStyle(IssuePriority.URGENT)}
          onClick={() => onVote(IssuePriority.URGENT)}
        >
          {votes[IssuePriority.URGENT]}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="ghost"
        className={`${getButtonStyle(IssuePriority.IMPORTANT)} px-4 py-2`}
        onClick={() => onVote(IssuePriority.IMPORTANT)}
      >
        Important ({votes[IssuePriority.IMPORTANT]})
      </Button>
      <Button
        variant="ghost"
        className={`${getButtonStyle(IssuePriority.VERY_IMPORTANT)} px-4 py-2`}
        onClick={() => onVote(IssuePriority.VERY_IMPORTANT)}
      >
        Very Important ({votes[IssuePriority.VERY_IMPORTANT]})
      </Button>
      <Button
        variant="ghost"
        className={`${getButtonStyle(IssuePriority.URGENT)} px-4 py-2`}
        onClick={() => onVote(IssuePriority.URGENT)}
      >
        Urgent ({votes[IssuePriority.URGENT]})
      </Button>
    </div>
  );
};

export default VotingButtons;