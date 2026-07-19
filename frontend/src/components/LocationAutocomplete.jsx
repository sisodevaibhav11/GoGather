import { useEffect, useRef, useState } from 'react';
import { fetchLocationSuggestions } from '../api.js';

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipFetchRef = useRef(false);

  useEffect(() => {
    if (!value?.name || value.name.trim().length < 2) {
      return undefined;
    }

    // Skip fetch immediately after a user selects a suggestion
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        const { data } = await fetchLocationSuggestions(value.name);
        // backend returns { results: [...] }
        setLocalSuggestions(data.results || []);
      } catch {
        setLocalSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [value?.name]);

  function handleSelect(suggestion) {
    // prevent the immediate effect-triggered fetch after selection
    skipFetchRef.current = true;
    onChange(suggestion);
    setLocalSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <label className="field-label relative">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <span className="field-note">
        Place autocomplete powered by OpenStreetMap (proxied). Select a place to capture coordinates.
      </span>
      <input
        value={value?.name || ''}
        onChange={(event) => {
          onChange({
            name: event.target.value,
            coordinates: value?.coordinates || null,
          });
          if (event.target.value.trim().length < 2) {
            setLocalSuggestions([]);
          }
          setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="field-input"
      />
      {showSuggestions && localSuggestions.length > 0 ? (
        <div className="absolute top-full z-10 mt-1 overflow-hidden rounded-2xl border border-[#333333] bg-[#1a1a1a] shadow-2xl shadow-black/40">
          {localSuggestions.map((suggestion, index) => (
            <button
              key={`${label}-${suggestion.coordinates?.lat ?? 'noLat'}-${suggestion.coordinates?.lng ?? 'noLng'}-${index}`}
              type="button"
              onMouseDown={() => handleSelect(suggestion)}
              className="block w-full px-4 py-3 text-left text-sm text-white transition hover:bg-[#2a2a2a]"
            >
              {suggestion.name}
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}
