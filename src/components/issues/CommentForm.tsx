import React from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/slices/uiSlice';
import Button from '../ui/Button';

interface CommentFormProps {
  content: string;
  setContent: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAuthenticated: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  content,
  setContent,
  onSubmit,
  isAuthenticated,
}) => {
  const dispatch = useDispatch();

  const handleLoginClick = () => {
    dispatch(openModal('login'));
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600 mb-3">
          Please log in to leave a comment
        </p>
        <Button variant="primary" size="sm" onClick={handleLoginClick}>
          Log in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="comment" className="sr-only">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your comment..."
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;