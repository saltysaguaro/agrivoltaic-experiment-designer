import React, { useEffect, useId, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import Info from './Info.jsx';
import { searchLocations } from '../site/mapbox.js';
export default function LocationSearch({ address, onSelect }) {
  const id = useId(),
    [query, setQuery] = useState(address || ''),
    [items, setItems] = useState([]),
    [message, setMessage] = useState(''),
    [active, setActive] = useState(0),
    [searching, setSearching] = useState(false);
  const sequence = useRef(0),
    controller = useRef();
  useEffect(() => {
    setQuery(address || '');
    setSearching(false);
    setItems([]);
  }, [address]);
  useEffect(() => {
    const token = ++sequence.current;
    controller.current?.abort();
    if (!searching || query.trim().length < 3) {
      setItems([]);
      setMessage('');
      return;
    }
    const flight = new AbortController();
    controller.current = flight;
    const timer = setTimeout(async () => {
      setMessage('Searching Mapbox…');
      try {
        const result = await searchLocations(query, { signal: flight.signal });
        if (token !== sequence.current || flight.signal.aborted) return;
        setItems(result);
        setActive(0);
        setMessage(result.length ? '' : 'No matches. Try a more specific address or place.');
      } catch (error) {
        if (token === sequence.current && !flight.signal.aborted) {
          setItems([]);
          setMessage(error.message);
        }
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      flight.abort();
    };
  }, [query, searching]);
  function choose(item) {
    sequence.current++;
    controller.current?.abort();
    setSearching(false);
    setQuery(item.label);
    setItems([]);
    setMessage('');
    onSelect(item);
  }
  return (
    <div className="field location-search">
      <div className="field-label">
        <label htmlFor={id}>Address or place</label>
        <Info label="Address or place">
          Search for a field address, town or region. Choose a Mapbox suggestion to fill latitude
          and longitude. The UTC offset is a longitude estimate; confirm local standard time.
        </Info>
      </div>
      <div className="input-wrap">
        <Search size={15} />
        <input
          id={id}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={items.length > 0}
          aria-controls={`${id}-results`}
          aria-activedescendant={items.length ? `${id}-option-${active}` : undefined}
          placeholder="Search an address or place…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearching(true);
            setItems([]);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              sequence.current++;
              controller.current?.abort();
              setItems([]);
              setSearching(false);
            }
            if (items.length && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
              e.preventDefault();
              setActive((active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length);
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (items[active]) choose(items[active]);
            }
          }}
        />
      </div>
      {items.length > 0 && (
        <div
          id={`${id}-results`}
          role="listbox"
          aria-label="Matching locations"
          className="location-results"
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="option"
              id={`${id}-option-${i}`}
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {message && <small role="status">{message}</small>}
      <small>
        Search by{' '}
        <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">
          Mapbox
        </a>{' '}
        · or enter coordinates below
      </small>
    </div>
  );
}
