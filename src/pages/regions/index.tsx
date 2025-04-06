import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import UzbekistanMap from '../../components/regions/UzbekistanMap';
import { fetchRegionStats } from '../../services/api';

interface RegionStats {
  id: string;
  name: string;
  issueCount: number;
  resolvedCount: number;
  activeIssues: number;
  population: number;
}

export default function RegionsPage() {
  const router = useRouter();
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRegionStats = async () => {
      try {
        const stats = await fetchRegionStats();
        setRegionStats(stats);
      } catch (error) {
        console.error('Error loading region stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegionStats();
  }, []);

  const handleRegionClick = (regionId: string) => {
    router.push(`/regions/${regionId}`);
  };

  return (
    <Layout title="Regions - Hal Qilamiz">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Regions</h1>
          <p className="mt-2 text-sm text-gray-500">
            Explore issues and progress across different regions of Uzbekistan
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
          </div>
        ) : (
          <>
            {/* Interactive Map */}
            <div className="mb-8">
              <UzbekistanMap
                regions={regionStats}
                onRegionClick={handleRegionClick}
              />
            </div>

            {/* Region Statistics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regionStats.map((region) => (
                <div
                  key={region.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleRegionClick(region.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{region.name}</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Issues:</span>
                      <span className="font-medium">{region.issueCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resolved:</span>
                      <span className="font-medium text-green-600">{region.resolvedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Issues:</span>
                      <span className="font-medium text-orange-500">{region.activeIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Population:</span>
                      <span className="font-medium">{region.population.toLocaleString()}</span>
                    </div>
                    <div className="pt-2">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-gray-500">
                              Resolution Rate
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-gray-500">
                              {((region.resolvedCount / region.issueCount) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ width: `${(region.resolvedCount / region.issueCount) * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-uz-blue"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}