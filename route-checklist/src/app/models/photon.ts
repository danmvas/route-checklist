export interface Photon {
  features: Feature[];
  type: 'FeatureCollection';
}

export interface Feature {
  geometry: Geometry;
  type: 'Feature';
  properties: Properties;
}

interface Geometry {
  coordinates: number[];
  type: 'Point';
}

interface Properties {
  name: string;
  osm_type: string | null;
  osm_id: number | null;
  extent: number[] | null;
  country: string | null;
  osm_key: string | null;
  countrycode: string | null;
  osm_value: string | null;
  type: string | null;
  state: string | null;
  street: string | null;
  district: string | null;
  county: string | null;
  house: string | null;
  postcode: string | null;
  housenumber: string | null;
  city: string | null;
}
