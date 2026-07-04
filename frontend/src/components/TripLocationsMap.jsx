import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import {
  DEFAULT_MAP_ZOOM,
  buildMapPoints,
  ensureLeafletMarkerIcons,
} from '../utils/leaflet.js';

ensureLeafletMarkerIcons();

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0].position, 13);
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => point.position));
    map.fitBounds(bounds.pad(0.3));
  }, [map, points]);

  return null;
}

export default function TripLocationsMap({
  title,
  arrivalLocation,
  destination,
  emptyMessage,
}) {
  const points = buildMapPoints([
    arrivalLocation ? { ...arrivalLocation, label: 'Arrival' } : null,
    destination ? { ...destination, label: 'Destination' } : null,
  ].filter(Boolean));

  if (points.length === 0) {
    return (
      <div className="rounded-[2rem] border border-stone-800 bg-stone-900/85 p-6">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-stone-400">{emptyMessage}</p>
      </div>
    );
  }

  const initialCenter = points[0].position;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-stone-800 bg-stone-900/85">
      <div className="border-b border-stone-800 px-6 py-5">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-stone-400">
          OpenStreetMap preview with saved trip coordinates, markers, and popups.
        </p>
      </div>

      <div className="h-72">
        <MapContainer
          center={initialCenter}
          zoom={DEFAULT_MAP_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds points={points} />
          {points.map((point) => (
            <Marker key={`${point.label}-${point.name}`} position={point.position}>
              <Popup>
                <div className="text-sm">
                  <strong>{point.label}</strong>
                  <div>{point.name}</div>
                  <div>{point.coordinates.lat.toFixed(6)}, {point.coordinates.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
