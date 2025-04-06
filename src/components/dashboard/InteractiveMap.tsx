import React, { useState } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from 'react-simple-maps';
import { RegionStats } from '../../types/dashboard';

// GeoJSON for Uzbekistan regions - this is simplified for example purposes
// In a real application, you would use a more detailed GeoJSON file
const UZBEKISTAN_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Tashkent", "id": "tashkent" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[69.1, 41.2], [69.4, 41.2], [69.4, 41.4], [69.1, 41.4], [69.1, 41.2]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Samarkand", "id": "samarkand" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[66.8, 39.5], [67.1, 39.5], [67.1, 39.7], [66.8, 39.7], [66.8, 39.5]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Bukhara", "id": "bukhara" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[64.2, 39.6], [64.5, 39.6], [64.5, 39.9], [64.2, 39.9], [64.2, 39.6]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Andijan", "id": "andijan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[72.1, 40.7], [72.4, 40.7], [72.4, 40.9], [72.1, 40.9], [72.1, 40.7]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Fergana", "id": "fergana" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[71.6, 40.3], [71.9, 40.3], [71.9, 40.5], [71.6, 40.5], [71.6, 40.3]]]
      }
    }
  ]
};

interface InteractiveMapProps {
  data: RegionStats[];
  onRegionClick: (region: RegionStats) => void;
  selectedRegion: RegionStats | null;
  metricType: 'totalIssues' | 'resolutionRate';
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  data, 
  onRegionClick,
  selectedRegion,
  metricType
}) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Get color based on metric value
  const getColor = (regionId: string) => {
    const region = data.find(r => r.id === regionId);
    
    if (!region) return "#F3F4F6"; // Default light gray for unknown regions
    
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

  // Handle mouse events for tooltip
  const handleMouseEnter = (geo: any, evt: any) => {
    const regionId = geo.properties.id;
    const region = data.find(r => r.id === regionId);
    
    if (region) {
      const metricValue = metricType === 'totalIssues' 
        ? `${region.totalIssues} issues`
        : `${region.resolutionRate}% resolved`;
        
      setTooltipContent(`${region.name}: ${metricValue}`);
      setTooltipPosition({ x: evt.clientX, y: evt.clientY });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Handle region click
  const handleRegionClick = (geo: any) => {
    const regionId = geo.properties.id;
    const region = data.find(r => r.id === regionId);
    
    if (region) {
      onRegionClick(region);
    }
  };
  
  return (
    <div className="relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 3000,
          center: [64.5, 41.5] // Approximate center of Uzbekistan
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup zoom={1} center={[64.5, 41.5]}>
          <Geographies geography={UZBEKISTAN_GEOJSON}>
            {({ geographies }) =>
              geographies.map(geo => {
                const regionId = geo.properties.id;
                const isSelected = selectedRegion?.id === regionId;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(regionId)}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: "none",
                        filter: isSelected ? "brightness(1.1)" : "brightness(1)",
                        stroke: isSelected ? "#000" : "#FFF",
                        strokeWidth: isSelected ? 1.5 : 0.5
                      },
                      hover: {
                        outline: "none",
                        filter: "brightness(1.1)",
                        cursor: "pointer"
                      },
                      pressed: {
                        outline: "none",
                        filter: "brightness(0.9)"
                      }
                    }}
                    onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRegionClick(geo)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bg-white px-2 py-1 rounded shadow-md text-sm pointer-events-none z-10"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 40}px`,
            transform: "translate(-50%, -100%)"
          }}
        >
          {tooltipContent}
        </div>
      )}
      
      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-sm text-xs">
        <div className="font-medium mb-1">
          {metricType === 'totalIssues' ? 'Issue Count' : 'Resolution Rate'}
        </div>
        <div className="flex items-center">
          {metricType === 'totalIssues' ? (
            <div className="w-full h-2 bg-gradient-to-r from-blue-600 to-blue-200"></div>
          ) : (
            <div className="w-full h-2 bg-gradient-to-r from-green-500 to-red-500"></div>
          )}
          <div className="flex justify-between w-full mt-1">
            <span>High</span>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;