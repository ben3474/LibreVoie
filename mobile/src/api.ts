import { AccessibilitySettings, Coordinate, RouteResult, SearchResult } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8787';

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) throw new Error((await response.text()) || `Erreur ${response.status}`);
  return response.json() as Promise<T>;
}

export async function searchPlaces(query: string, near?: Coordinate) {
  const params = new URLSearchParams({q: query});
  if (near) { params.set('lat', String(near.latitude)); params.set('lon', String(near.longitude)); }
  return json<SearchResult[]>(`/api/search?${params}`);
}

export async function computeRoute(start: Coordinate, end: Coordinate, settings: AccessibilitySettings) {
  return json<RouteResult>('/api/route', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({start, end, settings}),
  });
}

