import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { AppDispatch } from '../../store';
import { setFilter, initializeMockData } from '../../store/slices/issuesSlice';
import { IssueStatus } from '../../types/issue';
import Layout from '../../components/layout/Layout';
import IssuesList from '../../components/issues/IssuesList';
import Button from '../../components/ui/Button';
import { openModal } from '../../store/slices/uiSlice';

export default function IssuesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { region, status, q } = router.query;

  useEffect(() => {
    // Initialize mock data on client side
    dispatch(initializeMockData());
  }, [dispatch]);

  useEffect(() => {
    // Set filters based on URL query parameters
    if (region || status || q) {
      dispatch(setFilter({
        region: region as string || null,
        status: status as IssueStatus || null,
        searchQuery: q as string || '',
      }));
    }
  }, [dispatch, region, status, q]);

  const handleReportIssue = () => {
    dispatch(openModal('createIssue'));
  };

  return (
    <Layout title="Issues - Hal Qilamiz">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
            <p className="mt-2 text-sm text-gray-500">
              Browse and search through community issues
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              onClick={handleReportIssue}
            >
              Report New Issue
            </Button>
          </div>
        </div>

        {/* Issues list with filters */}
        <IssuesList 
          showFilters={true}
          regionFilter={region as string || null}
          statusFilter={status as IssueStatus || null}
          initialSearchQuery={q as string || ''}
        />
      </div>
    </Layout>
  );
}