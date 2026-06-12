interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <div className="overlay overlay--pause">
      <div className="panel panel--centered">
        <h2>Paused</h2>
        <div className="panel__actions">
          <button type="button" className="btn btn--primary" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="btn btn--secondary" onClick={onQuit}>
            Quit to Title
          </button>
        </div>
        <p className="panel__hint">Press <kbd>Esc</kbd> to resume</p>
      </div>
    </div>
  );
}
