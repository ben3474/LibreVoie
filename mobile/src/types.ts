export type Coordinate = { latitude: number; longitude: number };

export type MobilityProfile = 'manual' | 'electric' | 'reduced';

export type AccessibilitySettings = {
  profile: MobilityProfile;
  maxIncline: number;
  maxKerbCm: number;
  minWidthCm: number;
  avoidPoorSurface: boolean;
};

export type RouteResult = {
  geometry: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  confidence: 'high' | 'medium' | 'low';
  unknownSegmentsPercent: number;
  warnings: string[];
};

export type SearchResult = { id: string; label: string; coordinate: Coordinate };

export type Obstacle = {
  id: string;
  coordinate: Coordinate;
  kind: 'works' | 'blocked_sidewalk' | 'lift_failure' | 'other';
  createdAt: string;
};

