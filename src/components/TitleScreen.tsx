interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="overlay overlay--title">
      <div className="title-panel">
        <p className="title-panel__eyebrow">Planetary Defense Initiative</p>
        <h1 className="title-panel__title">
          Alien Siege
          <span className="title-panel__subtitle">Turret Defense</span>
        </h1>
        <p className="title-panel__tagline">
          Hold the line. Destroy the invasion. Upgrade between waves.
        </p>

        <button type="button" className="btn btn--primary" onClick={onStart}>
          Start Defense
        </button>

        <section className="how-to-play" aria-labelledby="how-to-play-heading">
          <h2 id="how-to-play-heading">How to Play</h2>
          <ul>
            <li>
              <strong>Aim</strong> with the mouse (or <kbd>A</kbd>/<kbd>D</kbd> keys)
            </li>
            <li>
              <strong>Fire</strong> with left click or <kbd>Space</kbd>
            </li>
            <li>
              <strong>Secondary</strong> with right click or <kbd>Shift</kbd> (coming soon)
            </li>
            <li>
              <strong>Pause</strong> with <kbd>Esc</kbd>
            </li>
          </ul>
          <p className="how-to-play__goal">
            Destroy alien ships and ground threats before they breach your base.
            Earn credits between levels to upgrade weapons and defenses.
          </p>
        </section>
      </div>
    </div>
  );
}
