import React from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography 
} from 'react-simple-maps';

// Simplified GeoJSON for Uzbekistan - this is a basic rectangular boundary
const UZBEKISTAN_SIMPLIFIED = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Uzbekistan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[56, 37], [73, 37], [73, 45], [56, 45], [56, 37]]]
      }
    }
  ]
};

const SimpleMap: React.FC = () => {
  console.log("SimpleMap component rendering");
  
  return (
    <div style={{ width: "100%", height: "300px", border: "1px solid red" }}>
      <h3>Uzbekistan Map</h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [64.5, 41.5] // Approximate center of Uzbekistan
        }}
        style={{ 
          width: "100%", 
          height: "200px",
          border: "1px solid blue" 
        }}
      >
        <Geographies geography={UZBEKISTAN_SIMPLIFIED}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#D6D6DA"
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#F53" },
                  pressed: { outline: "none" }
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default SimpleMap;