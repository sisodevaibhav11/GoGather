import { useEffect, useRef, useState } from 'react';
import { fetchLocationSuggestions } from '../api.js';

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const inputRef = useRef(null);
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!value?.name || value.name.trim().length < 2) {
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        const { data } = await fetchLocationSuggestions(value.name);
        setLocalSuggestions(data.suggestions || []);
      } catch {
        setLocalSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [value?.name]);

  function handleSelect(suggestion) {
    onChange(suggestion);
    setLocalSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <label className="relative flex flex-col gap-2 text-sm text-stone-300">
      <span className="font-medium text-stone-200">
        {label}
        {required ? ' *' : ''}
      </span>
      <span className="text-xs text-stone-500">
        Saved trip locations from TravelBuddy are suggested here. Use the map picker below to pin exact coordinates.
      </span>
      <input
        ref={inputRef}
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
        className="rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-white outline-none transition focus:border-amber-400"
      />
      {showSuggestions && localSuggestions.length > 0 ? (
        <div className="absolute top-full z-10 mt-1 overflow-hidden rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl shadow-black/40">
          {localSuggestions.map((suggestion) => (
            <button
              key={`${label}-${suggestion.name}`}
              type="button"
              onMouseDown={() => handleSelect(suggestion)}
              className="block w-full px-4 py-3 text-left text-sm text-stone-200 transition hover:bg-stone-800"
            >
              {suggestion.name}
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}
