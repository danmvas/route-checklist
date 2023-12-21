export interface Photon {
  geometry: Geometry;
  properties: Properties;
  type: 'Feature';
}

interface Geometry {
  coordinates: number[];
  type: 'Point';
}

interface Properties {
  name: string;
  osm_type: string;
  osm_id: number;
  extent: number[];
  country: string;
  osm_key: string;
  countrycode: string;
  osm_value: string;
  type: string;
}
