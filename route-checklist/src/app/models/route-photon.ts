export interface RoutePhoton {
  features: Features[];
}

export interface Features {
  geometry: Geometry[];
  type: string;
  properties: Properties[];
}

export interface Geometry {
  coordinates: number[];
  type: string;
}

export interface Properties {
  osm_type: string;
  osm_id: number;
  extent: number[];
  country: string;
  osm_key: string;
  countrycode: string;
  osm_value: string;
  name: string;
  county: string;
  state: string;
  type: string;
}
