import { AccessibilitySettings, MobilityProfile } from './types';

export const PROFILES: Record<MobilityProfile, AccessibilitySettings> = {
  manual: {profile: 'manual', maxIncline: 6, maxKerbCm: 3, minWidthCm: 90, avoidPoorSurface: true},
  electric: {profile: 'electric', maxIncline: 10, maxKerbCm: 6, minWidthCm: 90, avoidPoorSurface: false},
  reduced: {profile: 'reduced', maxIncline: 6, maxKerbCm: 6, minWidthCm: 80, avoidPoorSurface: true},
};

export const PROFILE_LABELS: Record<MobilityProfile, string> = {manual: 'Fauteuil manuel', electric: 'Fauteuil électrique', reduced: 'Mobilité réduite'};
