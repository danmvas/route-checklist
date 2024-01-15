import LType from 'leaflet';
declare const L: typeof LType;

export interface TableItem {
  name: string;
  checked: boolean;
  // marker: LType.Marker;
  latLng: LType.LatLng;
}
