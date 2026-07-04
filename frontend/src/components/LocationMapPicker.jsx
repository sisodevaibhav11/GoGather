import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  ensureLeafletMarkerIcons,
  hasCoordinates,
  toLatLngTuple,
} from '../utils/leaflet.js';

ensureLeafletMarkerIcons();

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function MapViewport({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);

  return null;
}

export default function LocationMapPicker({ label, value, onChange }) {
  const markerPosition = toLatLngTuple(value);
  const center = markerPosition || DEFAULT_MAP_CENTER;
  const zoom = markerPosition ? 13 : DEFAULT_MAP_ZOOM;
  const coordinatesLabel = hasCoordinates(value)
    ? `${value.coordinates.lat.toFixed(6)}, ${value.coordinates.lng.toFixed(6)}`
    : 'No coordinates pinned yet';

  const popupText = markerPosition && value?.name?.trim()
    ? value.name.trim()
    : 'Pinned location';

  function handleSelectCoordinates(coordinates) {
    onChange({
      ...value,
      coordinates,
    });
  }

  function handleClearCoordinates() {
    onChange({
      ...value,
      coordinates: null,
    });
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-stone-800 bg-stone-950/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-stone-200">{label}</p>
          <p className="text-xs text-stone-500">Click the map to drop or move the marker.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Coordinates</p>
          <p className="text-sm text-stone-300">{coordinatesLabel}</p>
        </div>
      </div>

      <div className="h-64">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport center={center} zoom={zoom} />
          <MapClickHandler onSelect={handleSelectCoordinates} />
          {markerPosition ? (
            <Marker position={markerPosition}>
              <Popup>{popupText}</Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-stone-400">
        <p>Use the text field for the place name and this map for the exact pin.</p>
        <button
          type="button"
          onClick={handleClearCoordinates}
          disabled={!markerPosition}
          className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear pin
        </button>
      </div>
    </div>
  );
}
