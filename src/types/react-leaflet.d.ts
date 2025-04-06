declare module 'react-leaflet' {
  import { FC, ComponentProps } from 'react';
  import { LatLngExpression, MapOptions } from 'leaflet';

  export interface MapContainerProps extends MapOptions {
    center: LatLngExpression;
    zoom: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    zoomControl?: boolean;
    scrollWheelZoom?: boolean;
  }

  export const MapContainer: FC<MapContainerProps>;

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export const TileLayer: FC<TileLayerProps>;

  export interface GeoJSONProps {
    data: any;
    style?: (feature: any) => any;
    onEachFeature?: (feature: any, layer: any) => void;
  }

  export const GeoJSON: FC<GeoJSONProps>;
} 