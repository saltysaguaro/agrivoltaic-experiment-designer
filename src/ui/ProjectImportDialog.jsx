import { periodLabel } from '../domain/period.js';
import React, { useEffect, useRef } from 'react';
import { dimensions } from '../domain/study.js';
export default function ProjectImportDialog({
  project,
  busy,
  progress,
  onStop,
  onOpen,
  onCancel,
  onBackup,
}) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    if (dialog.current.showModal) dialog.current.showModal();
    else dialog.current.setAttribute('open', '');
    return () => {
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  const s = project.study,
    r = project.result;
  return (
    <dialog
      ref={dialog}
      className="project-dialog"
      aria-labelledby="project-import-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <header>
        <h2 id="project-import-title">Open project</h2>
        <button aria-label="Close project preview" onClick={onCancel}>
          ×
        </button>
      </header>
      <div className="project-preview-content">
        <h3>{s.metadata.title}</h3>
        <p>{s.metadata.investigator || 'Investigator not specified'}</p>
        <dl>
          <dt>System</dt>
          <dd>
            {dimensions(s).modules.toLocaleString()} modules · {s.array.rows} PV rows
          </dd>
          <dt>Research plan</dt>
          <dd>
            {s.experimentSensors.length} sensors · {s.crops.length} crop beds
          </dd>
          <dt>Site / date</dt>
          <dd>
            {s.site.latitude}°, {s.site.longitude}° · {periodLabel(s)}
          </dd>
          <dt>Weather</dt>
          <dd>
            {s.weather.name}
            <br />
            {s.weather.rows.length} retained intervals
            {s.weather.sourceText !== undefined ? ' · original source included' : ''}
          </dd>
          <dt>Light results</dt>
          <dd>
            {r
              ? `${r.cells.length.toLocaleString()} receivers · ${r.backend} · calculated ${r.createdAt}`
              : 'Not restored; calculate light after opening'}
          </dd>
          <dt>Integrity</dt>
          <dd>{project.integrity}</dd>
        </dl>
        {project.warnings.length > 0 && (
          <ul className="project-import-notes">
            {project.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
        <p>
          Opening replaces the project on this device. Export the current project first if you want
          to keep it.
        </p>
        {progress && (
          <div className="project-inline-progress" role="status">
            <span>{progress}</span>
            <button onClick={onStop}>Cancel export</button>
          </div>
        )}
      </div>
      <footer>
        <button className="secondary" disabled={busy} onClick={onBackup}>
          Export current project
        </button>
        <button className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" disabled={busy} onClick={onOpen}>
          Open project
        </button>
      </footer>
    </dialog>
  );
}
