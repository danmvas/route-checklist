import LType from 'leaflet';
declare const L: typeof LType;

export interface TableItem {
  name: string;
  checked: boolean;
  latLng: LType.LatLng;
  // lat: number;
  // lng: number;
  // marker: LType.Marker;
}
