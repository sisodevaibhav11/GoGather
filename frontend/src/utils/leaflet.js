import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

export const DEFAULT_MAP_CENTER = [20.5937, 78.9629];
export const DEFAULT_MAP_ZOOM = 5;

let leafletIconsConfigured = false;

export function ensureLeafletMarkerIcons() {
  if (leafletIconsConfigured) {
    return;
  }

  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });

  leafletIconsConfigured = true;
}

export function hasCoordinates(location) {
  return Number.isFinite(location?.coordinates?.lat) && Number.isFinite(location?.coordinates?.lng);
}

export function toLatLngTuple(location) {
  if (!hasCoordinates(location)) {
    return null;
  }

  return [location.coordinates.lat, location.coordinates.lng];
}

export function buildMapPoints(locations) {
  return locations
    .filter((location) => hasCoordinates(location))
    .map((location) => ({
      ...location,
      position: [location.coordinates.lat, location.coordinates.lng],
    }));
}
