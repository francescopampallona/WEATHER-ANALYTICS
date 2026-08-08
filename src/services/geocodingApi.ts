import { Location, GeocodingResult } from '../models/location';

const RECENT_LOCATIONS_KEY = 'weather_analytics_recent_locations';

export const DEFAULT_LOCATION: Location = {
  id: 2525400,
  name: 'Caltagirone',
  latitude: 37.2382,
  longitude: 14.5136,
  country: 'Italia',
  admin1: 'Sicilia',
  timezone: 'Europe/Rome',
  elevation: 608,
};

/**
 * Searches locations using Open-Meteo Geocoding API
 */
export async function searchLocations(query: string): Promise<Location[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding API HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: GeocodingResult) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      admin1: item.admin1 || item.admin2 || '',
      timezone: item.timezone || 'auto',
      elevation: item.elevation,
    }));
  } catch (error) {
    console.error('Error searching locations with Open-Meteo:', error);
    throw new Error('Unable to search locations. Please check your internet connection.');
  }
}

/**
 * Retrieves recently selected locations from local storage
 */
export function getRecentLocations(): Location[] {
  try {
    const raw = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!raw) return [DEFAULT_LOCATION];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading recent locations:', e);
  }
  return [DEFAULT_LOCATION];
}

/**
 * Saves a newly selected location into recent locations list
 */
export function saveRecentLocation(location: Location): void {
  try {
    const recents = getRecentLocations();
    const filtered = recents.filter((loc) => loc.id !== location.id && loc.name !== location.name);
    const updated = [location, ...filtered].slice(0, 8); // Keep max 8
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving recent location:', e);
  }
}

/**
 * Clears recent locations list
 */
export function clearRecentLocations(): void {
  try {
    localStorage.removeItem(RECENT_LOCATIONS_KEY);
  } catch (e) {}
}
