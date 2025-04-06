import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setFilter, clearFilters } from '../../store/slices/issuesSlice';
import { IssueStatus } from '../../types/issue';
import { RootState, AppDispatch } from '../../store';
import IssueCard from './IssueCard';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Sample regions data (replace with API call)
const REGIONS = [
  { id: 'tashkent', name: 'Tashkent' },
  { id: 'samarkand', name: 'Samarkand' },
  { id: 'bukhara', name: 'Bukhara' },
  { id: 'andijan', name: 'Andijan' },
  { id: 'namangan', name: 'Namangan' },
  { id: 'fergana', name: 'Fergana' },
  { id: 'karakalpakstan', name: 'Karakalpakstan' },
  { id: 'surkhandarya', name: 'Surkhandarya' },
  { id: 'kashkadarya', name: 'Kashkadarya' },
  { id: 'khorezm', name: 'Khorezm' },
  { id: 'jizzakh', name: 'Jizzakh' },
  { id: 'syrdarya', name: 'Syrdarya' },
  { id: 'navoi', name: 'Navoi' },
];

// Debounce function to limit API calls while typing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

interface IssuesListProps {
  title?: string;
  showFilters?: boolean;
  regionFilter?: string | null;
  statusFilter?: IssueStatus | null;
  initialSearchQuery?: string;
}

const IssuesList: React.FC<IssuesListProps> = ({
  title = 'All Issues',
  showFilters = true,
  regionFilter = null,
  statusFilter = null,
  initialSearchQuery = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, isLoading, error, filter } = useSelector((state: RootState) => state.issues);
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Set initial filters
  useEffect(() => {
    if (regionFilter || statusFilter || initialSearchQuery) {
      dispatch(setFilter({
        region: regionFilter,
        status: statusFilter,
        searchQuery: initialSearchQuery,
      }));
    }
  }, [dispatch, regionFilter, statusFilter, initialSearchQuery]);
  
  // Fetch issues when filters change
  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch, filter]);
  
  // Update search query in filter
  useEffect(() => {
    dispatch(setFilter({
      searchQuery: debouncedSearchQuery,
    }));
  }, [dispatch, debouncedSearchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value || null;
    dispatch(setFilter({ region }));
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as IssueStatus || null;
    dispatch(setFilter({ status }));
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    dispatch(clearFilters());
  };
  
  return (
    <div>
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search for issues..."
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            
            <div>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filter.region || ''}
                onChange={handleRegionChange}
              >
                <option value="">All Regions</option>
                <option value="nationwide">Nationwide</option>
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filter.status || ''}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
          
          {/* Applied filters */}
          {(filter.region || filter.status || filter.searchQuery) && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Applied filters:</span>
              
              {filter.region && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Region: {filter.region === 'nationwide' ? 'Nationwide' : REGIONS.find(r => r.id === filter.region)?.name}
                </span>
              )}
              
              {filter.status && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                  Status: {filter.status}
                </span>
              )}
              
              {filter.searchQuery && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                  Search: {filter.searchQuery}
                </span>
              )}
              
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-primary-600 hover:text-primary-500 ml-auto"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
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
      )}
      
      {/* Empty state */}
      {!isLoading && !error && issues.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No issues found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No issues match your current filters.
          </p>
          {showFilters && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Issues list */}
      {!isLoading && !error && issues.length > 0 && (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isCompact={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IssuesList;