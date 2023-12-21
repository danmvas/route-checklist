export interface OSRM {
  code: string;
  routes: Routes[];
  waypoints: Waypoint[];
}

interface Routes {
  geometry: string;
  legs: Leg[];
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
}

interface Leg {
  steps: number[];
  summary: string;
  weight: number;
  duration: number;
  distance: number;
}

interface Waypoint {
  hint: string;
  distance: number;
  name: string;
  location: [number, number];
}
