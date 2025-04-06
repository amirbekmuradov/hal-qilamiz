import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Feature } from 'geojson';
import type { MapContainer as MapContainerType, TileLayer as TileLayerType, GeoJSON as GeoJSONType } from 'react-leaflet';

interface RegionData {
  id: string;
  name: string;
  issueCount: number;
  resolvedCount: number;
}

interface UzbekistanMapProps {
  regions: RegionData[];
  onRegionClick: (regionId: string) => void;
}

// Dynamically import react-leaflet components with no SSR
const MapContainer = dynamic<React.ComponentProps<typeof MapContainerType>>(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic<React.ComponentProps<typeof TileLayerType>>(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const GeoJSON = dynamic<React.ComponentProps<typeof GeoJSONType>>(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

const UzbekistanMap: React.FC<UzbekistanMapProps> = ({ regions, onRegionClick }) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    fetch('/data/uz.json')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(error => console.error('Error loading map data:', error));
  }, []);

  const mapStyle = {
    height: '700px',
    width: '100%',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0'
  };

  // Get color based on issue count (heat map style)
  const getColor = (issueCount: number) => {
    // Using a red color scale similar to the US map
    if (issueCount >= 100) return '#67000d';
    if (issueCount >= 75) return '#a50f15';
    if (issueCount >= 50) return '#cb181d';
    if (issueCount >= 25) return '#ef3b2c';
    if (issueCount >= 10) return '#fb6a4a';
    if (issueCount >= 5) return '#fc9272';
    if (issueCount >= 1) return '#fcbba1';
    return '#fee5d9';
  };

  const getRegionStyle = (feature: Feature) => {
    const region = regions.find(r => r.id === feature.properties?.id);
    const isActive = activeRegion === feature.properties?.id;
    const issueCount = region?.issueCount || 0;

    return {
      fillColor: getColor(issueCount),
      weight: isActive ? 2 : 1,
      opacity: 1,
      color: '#000000',
      dashArray: '',
      fillOpacity: isActive ? 0.9 : 0.7
    };
  };

  const onEachFeature = (feature: Feature, layer: any) => {
    const region = regions.find(r => r.id === feature.properties?.id);
    
    layer.on({
      mouseover: () => {
        setActiveRegion(feature.properties?.id);
        layer.setStyle({
          weight: 2,
          fillOpacity: 0.9
        });
        layer.bringToFront();
      },
      mouseout: () => {
        setActiveRegion(null);
        layer.setStyle(getRegionStyle(feature));
      },
      click: () => {
        if (feature.properties?.id) {
          onRegionClick(feature.properties.id);
        }
      }
    });

    if (region) {
      const tooltipContent = `
        <div class="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-1">${feature.properties?.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${feature.properties?.name_en}</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Issues:</span>
              <span class="font-medium">${region.issueCount}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Resolved:</span>
              <span class="font-medium">${region.resolvedCount}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Resolution Rate:</span>
              <span class="font-medium">${Math.round((region.resolvedCount / region.issueCount) * 100) || 0}%</span>
            </div>
          </div>
        </div>
      `;
      layer.bindTooltip(tooltipContent, { 
        permanent: false,
        direction: 'center',
        className: 'custom-tooltip'
      });
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <MapContainer
        center={[41.377491, 64.585262]}
        zoom={6}
        style={mapStyle}
        zoomControl={true}
        scrollWheelZoom={true}
        maxBounds={[
          [37.0, 56.0],
          [46.0, 73.0]
        ]}
        minZoom={5}
        maxZoom={8}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={getRegionStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Issue Count:</span>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#fee5d9' }}></span>
            <span className="text-xs mx-1">0</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#fcbba1' }}></span>
            <span className="text-xs mx-1">1-4</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#fc9272' }}></span>
            <span className="text-xs mx-1">5-9</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#fb6a4a' }}></span>
            <span className="text-xs mx-1">10-24</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#ef3b2c' }}></span>
            <span className="text-xs mx-1">25-49</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#cb181d' }}></span>
            <span className="text-xs mx-1">50-74</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#a50f15' }}></span>
            <span className="text-xs mx-1">75-99</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#67000d' }}></span>
            <span className="text-xs mx-1">100+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UzbekistanMap; 