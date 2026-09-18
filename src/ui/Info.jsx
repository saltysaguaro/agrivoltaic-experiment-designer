import React, { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info as InfoIcon } from 'lucide-react';
export default function Info({ label, children, portalTarget }) {
  const id = useId(),
    [position, setPosition] = useState(null);
  const show = (e) => {
    const r = e.currentTarget.getBoundingClientRect(),
      width = Math.min(290, window.innerWidth - 24);
    setPosition({
      left: Math.max(12, Math.min(r.left, window.innerWidth - width - 12)),
      top: Math.min(r.bottom + 8, window.innerHeight - 170),
      width,
    });
  };
  return (
    <>
      <button
        type="button"
        className="input-info"
        aria-label={`About ${label}`}
        aria-describedby={position ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget) setPosition(null);
        }}
        onFocus={show}
        onBlur={() => setPosition(null)}
        onClick={show}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setPosition(null);
        }}
      >
        <InfoIcon size={14} />
      </button>
      {position &&
        createPortal(
          <div id={id} role="tooltip" className="input-tooltip" style={position}>
            {children}
          </div>,
          portalTarget?.current || document.body,
        )}
    </>
  );
}
