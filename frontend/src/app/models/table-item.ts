import LType from 'leaflet';
declare const L: typeof LType;

export interface TableItem {
  id: number;
  name: string;
  checked: number;
  latLng: LType.LatLng;
  // lat: number;
  // lng: number;
  // marker: LType.Marker;
}
