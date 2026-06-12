interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <div className="overlay overlay--pause">
      <div className="pause-backdrop" aria-hidden />
      <div className="panel panel--centered panel--pause">
        <p className="panel__eyebrow panel__eyebrow--muted">Combat Suspended</p>
        <h2>Paused</h2>
        <p className="panel__reason panel__reason--compact">
          Take a breath — the invasion waits.
        </p>
        <div className="panel__actions">
          <button type="button" className="btn btn--primary" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="btn btn--secondary" onClick={onQuit}>
            Quit to Title
          </button>
        </div>
        <div className="pause-hints">
          <p className="panel__hint">
            Press <kbd>Esc</kbd> to resume
          </p>
          <p className="panel__hint panel__hint--dim">
            <kbd>Space</kbd> or click to fire · Aim with mouse
          </p>
        </div>
      </div>
    </div>
  );
}
