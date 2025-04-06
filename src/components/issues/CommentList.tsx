import React from 'react';
import { Comment } from '../../types/issue';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No comments yet. Be the first to leave a comment!
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <div className="flex-shrink-0">
            {comment.author.profilePictureUrl ? (
              <img
                className="h-10 w-10 rounded-full"
                src={comment.author.profilePictureUrl}
                alt={comment.author.name || 'User avatar'}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">
                  {(comment.author.name || 'U').charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {comment.author.name || 'Anonymous'}
              </span>
              {comment.isOfficial && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Official
                </span>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
              {comment.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;