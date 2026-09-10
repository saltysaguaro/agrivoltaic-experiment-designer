import React, { useId, useState, useEffect, useRef } from 'react';
import { cropById, searchCrops, cropCatalog } from '../domain/crop-catalog.js';
export default function CropPicker({ value, onChange, label = 'Crop', legacy = '' }) {
  const id = useId(),
    selected = cropById(value);
  const [query, setQuery] = useState(selected?.commonName || ''),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(0);
  useEffect(() => {
    setQuery(cropById(value)?.commonName || '');
  }, [value]);
  const matches = searchCrops(query);
  const list = useRef(null);
  useEffect(() => {
    if (open)
      list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open, query]);
  const choose = (c) => {
    onChange(c.id);
    setQuery(c.commonName);
    setOpen(false);
    setActive(0);
  };
  return (
    <div
      className="crop-picker field"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setQuery(selected?.commonName || '');
        }
      }}
    >
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && matches[active] ? `${id}-option-${active}` : undefined}
        value={query}
        placeholder="Search crop or botanical name…"
        autoComplete="off"
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
            setActive((n) =>
              Math.max(0, Math.min(matches.length - 1, n + (e.key === 'ArrowDown' ? 1 : -1))),
            );
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (open && matches[active]) choose(matches[active]);
          }
          if (e.key === 'Escape') {
            e.stopPropagation();
            setOpen(false);
            setQuery(selected?.commonName || '');
          }
        }}
      />
      {selected ? (
        <small>
          <i>{selected.botanicalName}</i> · {selected.family}
        </small>
      ) : (
        <small className="zone-warning">
          {legacy ? `Previously entered: ${legacy}. ` : ''}Choose a catalog entry to identify this
          crop.
        </small>
      )}
      {open && (
        <div
          ref={list}
          id={`${id}-list`}
          role="listbox"
          className="crop-options"
          aria-label={`${label} matches`}
        >
          {matches.map((c, i) => (
            <div
              key={c.id}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(c)}
            >
              <strong>{c.commonName}</strong>
              <i>{c.botanicalName}</i>
            </div>
          ))}
          {!matches.length && (
            <p>No matching crop. Try a common name, botanical name or synonym.</p>
          )}
          <small>
            {matches.length} matches shown · {cropCatalog.length} predefined crop choices
          </small>
        </div>
      )}
    </div>
  );
}
