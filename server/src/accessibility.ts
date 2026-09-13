export type Settings = {profile:'manual'|'electric'|'reduced';maxIncline:number;maxKerbCm:number;minWidthCm:number;avoidPoorSurface:boolean};

export function orsOptions(settings: Settings) {
  return {
    avoid_features: ['steps'],
    profile_params: {
      restrictions: {
        surface_type: settings.avoidPoorSurface ? 'cobblestone:flattened' : 'cobblestone',
        track_type: 'grade1',
        smoothness_type: settings.avoidPoorSurface ? 'good' : 'intermediate',
        maximum_incline: settings.maxIncline,
        maximum_sloped_kerb: settings.maxKerbCm / 100,
        minimum_width: settings.minWidthCm / 100,
      },
    },
  };
}

export function confidenceFromExtraInfo(extraInfo: unknown): {confidence:'high'|'medium'|'low';unknownSegmentsPercent:number} {
  // ORS does not currently expose completeness as one canonical percentage.
  // Until a dedicated OSM completeness service is connected, be conservative.
  const documented = Array.isArray(extraInfo) && extraInfo.length > 0;
  return documented ? {confidence:'medium', unknownSegmentsPercent:35} : {confidence:'low', unknownSegmentsPercent:65};
}
