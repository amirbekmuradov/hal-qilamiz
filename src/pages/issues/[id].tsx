import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchIssueById, commentOnIssue } from '../../store/slices/issuesSlice';
import Layout from '../../components/layout/Layout';
import IssueCard from '../../components/issues/IssueCard';
import CommentList from '../../components/issues/CommentList';
import CommentForm from '../../components/issues/CommentForm';
import Button from '../../components/ui/Button';
import { openModal } from '../../store/slices/uiSlice';
import Link from 'next/link';

export default function IssueDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { currentIssue, isLoading, error } = useSelector((state: RootState) => state.issues);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [commentContent, setCommentContent] = useState('');
  
  useEffect(() => {
    if (id) {
      dispatch(fetchIssueById(id as string));
    }
  }, [dispatch, id]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      dispatch(openModal('login'));
      return;
    }
    
    if (!commentContent.trim()) return;
    
    try {
      await dispatch(commentOnIssue({
        issueId: id as string,
        content: commentContent,
      }));
      
      // Clear comment form after successful submission
      setCommentContent('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };
  
  // If loading
  if (isLoading) {
    return (
      <Layout title="Loading Issue - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If error
  if (error) {
    return (
      <Layout title="Error - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Button variant="outline" as={Link} href="/issues">
              Back to Issues
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If issue not found
  if (!currentIssue) {
    return (
      <Layout title="Issue Not Found - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
            <p className="text-gray-600 mb-8">
              The issue you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" as={Link} href="/issues">
              Back to Issues
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${currentIssue.title} - Hal Qilamiz`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">›</span>
              <Link href="/issues" className="hover:text-gray-700">
                Issues
              </Link>
            </li>
            <li>
              <span className="mx-2">›</span>
              <span className="text-gray-900">Details</span>
            </li>
          </ol>
        </nav>
        
        {/* Issue details */}
        <div className="mb-8">
          <IssueCard issue={currentIssue} />
        </div>
        
        {/* Comments section */}
        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Comments</h2>
          
          {/* Comment form */}
          <div className="mb-8">
            <CommentForm
              content={commentContent}
              setContent={setCommentContent}
              onSubmit={handleSubmitComment}
              isAuthenticated={isAuthenticated}
            />
          </div>
          
          {/* Comments list */}
          <CommentList comments={currentIssue.comments} />
        </div>
      </div>
    </Layout>
  );
}