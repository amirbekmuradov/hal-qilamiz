import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap';

interface RegionStats {
  id: string;
  name: string;
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
}

interface RegionalMapProps {
  data: RegionStats[];
}

const RegionalMap: React.FC<RegionalMapProps> = ({ data }) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionStats | null>(null);
  const [metricType, setMetricType] = useState<'totalIssues' | 'resolutionRate'>('totalIssues');

  // Get color based on metric value (for the table rows)
  const getColor = (region: RegionStats) => {
    if (metricType === 'totalIssues') {
      // Color based on total issues (more issues = darker blue)
      const maxIssues = Math.max(...data.map(r => r.totalIssues));
      const normalizedValue = region.totalIssues / maxIssues;
      const blueIntensity = Math.floor(200 - normalizedValue * 150);
      return `rgb(0, ${blueIntensity}, 255)`;
    } else {
      // Color based on resolution rate (higher rate = more green)
      const normalizedValue = region.resolutionRate / 100;
      const redValue = Math.floor(255 * (1 - normalizedValue));
      const greenValue = Math.floor(200 * normalizedValue);
      return `rgb(${redValue}, ${greenValue}, 0)`;
    }
  };

  // Handle region click
  const handleRegionClick = (region: RegionStats) => {
    setSelectedRegion(region);
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {metricType === 'totalIssues' ? 'Showing total issues by region' : 'Showing resolution rate by region'}
        </div>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              metricType === 'totalIssues'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setMetricType('totalIssues')}
          >
            Issues
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              metricType === 'resolutionRate'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setMetricType('resolutionRate')}
          >
            Resolution Rate
          </button>
        </div>
      </div>
      
      {/* Interactive Map of Uzbekistan */}
      <div className="bg-white p-4 rounded-lg h-64 mb-4 border border-gray-200">
        <InteractiveMap 
          data={data} 
          onRegionClick={handleRegionClick} 
          selectedRegion={selectedRegion} 
          metricType={metricType} 
        />
      </div>
      
      {/* Region list with visualization */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-7 text-sm font-medium text-gray-700 border-b border-gray-200 px-4 py-2">
          <div className="col-span-2">Region</div>
          <div className="col-span-1 text-center">Total</div>
          <div className="col-span-1 text-center">Pending</div>
          <div className="col-span-1 text-center">In Progress</div>
          <div className="col-span-1 text-center">Resolved</div>
          <div className="col-span-1 text-center">Rate</div>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {data.map((region) => (
            <div
              key={region.id}
              className={`grid grid-cols-7 text-sm px-4 py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedRegion?.id === region.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleRegionClick(region)}
            >
              <div className="col-span-2 flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getColor(region) }}
                ></div>
                {region.name}
              </div>
              <div className="col-span-1 text-center">{region.totalIssues}</div>
              <div className="col-span-1 text-center">{region.pendingIssues}</div>
              <div className="col-span-1 text-center">{region.inProgressIssues}</div>
              <div className="col-span-1 text-center">{region.resolvedIssues}</div>
              <div className="col-span-1 text-center">{region.resolutionRate}%</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected region details */}
      {selectedRegion && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-gray-900">{selectedRegion.name}</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-sm text-gray-500">Total Issues</div>
              <div className="text-lg font-semibold">{selectedRegion.totalIssues}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Resolution Rate</div>
              <div className="text-lg font-semibold">{selectedRegion.resolutionRate}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalMap;