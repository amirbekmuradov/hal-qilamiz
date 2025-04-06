import { useEffect, useState } from 'react';
import { getAllRegions } from '../../services/api';
import Layout from '../../components/layout/Layout';
import Link from 'next/link';
import { Region } from '../../types/region';

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true);
        const response = await getAllRegions();
        setRegions(response.regions);
        setError(null);
      } catch (err) {
        console.error('Error fetching regions:', err);
        setError('Failed to load regions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegions();
  }, []);
  
  // Map of Uzbekistan regions (simplified for demonstration)
  const renderMap = () => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <svg 
        viewBox="0 0 800 500" 
        className="w-full h-auto"
        style={{ maxHeight: '500px' }}
      >
        {/* This would be a proper SVG map of Uzbekistan with paths for each region */}
        {/* For this example, we're using a placeholder */}
        <rect x="0" y="0" width="800" height="500" fill="#f0f0f0" />
        <text x="400" y="250" textAnchor="middle" fontSize="18">
          Map of Uzbekistan Regions
        </text>
        <text x="400" y="280" textAnchor="middle" fontSize="14" fill="#666">
          (Interactive map would be implemented here)
        </text>
      </svg>
    </div>
  );
  
  return (
    <Layout title="Regions - Hal Qilamiz">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Regions</h1>
        
        {/* Map of Uzbekistan */}
        <div className="mb-10">
          {renderMap()}
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
          </div>
        )}
        
        {/* Error state */}
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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* List of regions */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <Link 
                key={region.id} 
                href={`/regions/${region.code}`}
                className="block"
              >
                <div className="h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gray-200 relative">
                    {region.imageUrl ? (
                      <img
                        src={region.imageUrl}
                        alt={region.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-uz-blue bg-opacity-10">
                        <span className="text-2xl font-bold text-uz-blue">
                          {region.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{region.name}</h2>
                    {region.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {region.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Population: {region.population.toLocaleString()}</span>
                      <span className="text-uz-blue">View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}