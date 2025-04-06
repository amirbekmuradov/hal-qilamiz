import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getRegionById, getRegionIssues, getRegionStatistics } from '../../services/api';
import Layout from '../../components/layout/Layout';
import IssuesList from '../../components/issues/IssuesList';
import RegionStatistics from '../../components/regions/RegionStatistics';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { Region, RegionStatistics as RegionStatsType } from '../../types/region';
import { Issue } from '../../types/issue';
import { Tab } from '@headlessui/react';

export default function RegionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [region, setRegion] = useState<Region | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [statistics, setStatistics] = useState<RegionStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('30'); // Default: 30 days
  
  useEffect(() => {
    const fetchRegionData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch region details
        const regionData = await getRegionById(id as string);
        setRegion(regionData.region);
        
        // Fetch region issues
        const issuesData = await getRegionIssues(id as string);
        setIssues(issuesData.issues);
        
        // Fetch region statistics
        const statsData = await getRegionStatistics(id as string, { period });
        setStatistics(statsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching region data:', err);
        setError('Failed to load region information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegionData();
  }, [id, period]);
  
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };
  
  // If loading
  if (isLoading) {
    return (
      <Layout title="Loading Region - Hal Qilamiz">
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
            <Button variant="outline" as={Link} href="/regions">
              Back to Regions
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If region not found
  if (!region) {
    return (
      <Layout title="Region Not Found - Hal Qilamiz">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Region Not Found</h1>
            <p className="text-gray-600 mb-8">
              The region you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" as={Link} href="/regions">
              Back to Regions
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${region.name} - Hal Qilamiz`}>
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
              <Link href="/regions" className="hover:text-gray-700">
                Regions
              </Link>
            </li>
            <li>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{region.name}</span>
            </li>
          </ol>
        </nav>
        
        {/* Region header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-48 bg-gray-200 relative">
            {region.imageUrl ? (
              <img
                src={region.imageUrl}
                alt={region.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-uz-blue bg-opacity-10">
                <span className="text-4xl font-bold text-uz-blue">
                  {region.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{region.name}</h1>
                <p className="mt-2 text-gray-600">
                  Population: {region.population.toLocaleString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                {region.localGovernmentWebsite && (
                  <a
                    href={region.localGovernmentWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-uz-blue hover:text-uz-blue-dark"
                  >
                    Official Website
                  </a>
                )}
                {region.statisticsUrl && (
                  <a
                    href={region.statisticsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-uz-blue hover:text-uz-blue-dark"
                  >
                    Regional Statistics
                  </a>
                )}
              </div>
            </div>
            
            {region.description && (
              <div className="mt-4 text-gray-700">
                <p>{region.description}</p>
              </div>
            )}
            
            {/* Issue statistics summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {region.issueStatistics.total}
                </div>
                <div className="text-sm text-blue-600">Total Issues</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {region.issueStatistics.pending}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-indigo-700">
                  {region.issueStatistics.inProgress}
                </div>
                <div className="text-sm text-indigo-600">In Progress</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {region.issueStatistics.resolutionRate}%
                </div>
                <div className="text-sm text-green-600">Resolution Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for Issues and Statistics */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
            <Tab.List className="flex border-b border-gray-200">
              <Tab
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium flex-1 text-center focus:outline-none ${
                    selected
                      ? 'text-uz-blue border-b-2 border-uz-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Issues
              </Tab>
              <Tab
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium flex-1 text-center focus:outline-none ${
                    selected
                      ? 'text-uz-blue border-b-2 border-uz-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Statistics
              </Tab>
              <Tab
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium flex-1 text-center focus:outline-none ${
                    selected
                      ? 'text-uz-blue border-b-2 border-uz-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Representatives
              </Tab>
            </Tab.List>
            <Tab.Panels>
              {/* Issues Panel */}
              <Tab.Panel className="p-6">
                <IssuesList 
                  showFilters={true}
                  regionFilter={region.code}
                  title={`Issues in ${region.name}`}
                />
              </Tab.Panel>
              
              {/* Statistics Panel */}
              <Tab.Panel className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    Issue Statistics
                  </h2>
                  <div className="mt-4 sm:mt-0">
                    <select
                      value={period}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-uz-blue focus:border-uz-blue"
                    >
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 3 Months</option>
                      <option value="365">Last Year</option>
                    </select>
                  </div>
                </div>
                
                {statistics ? (
                  <RegionStatistics statistics={statistics} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No statistics available for this region.
                  </div>
                )}
              </Tab.Panel>
              
              {/* Representatives Panel */}
              <Tab.Panel className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Official Representatives
                </h2>
                
                {region.officialRepresentatives && region.officialRepresentatives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {region.officialRepresentatives.map((rep) => (
                      <div key={rep.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                          {rep.profilePictureUrl ? (
                            <img
                              src={rep.profilePictureUrl}
                              alt={rep.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-uz-blue text-white">
                              {rep.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {rep.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {rep.position}
                          </p>
                          {rep.department && (
                            <p className="text-sm text-gray-500">
                              {rep.department}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No official representatives listed for this region.
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </Layout>
  );
}