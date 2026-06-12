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
          Hold the line. Destroy the invasion. Upgrade between levels.
        </p>

        <button type="button" className="btn btn--primary" onClick={onStart}>
          Start Defense
        </button>

        <section className="how-to-play" aria-labelledby="how-to-play-heading">
          <h2 id="how-to-play-heading">How to Play</h2>
          <div className="how-to-play__grid">
            <div className="how-to-play__block">
              <h3>Controls</h3>
              <ul>
                <li>
                  <strong>Aim</strong> — mouse or <kbd>A</kbd>/<kbd>D</kbd>
                </li>
                <li>
                  <strong>Fire</strong> — left click or <kbd>Space</kbd>
                </li>
                <li>
                  <strong>Pause</strong> — <kbd>Esc</kbd>
                </li>
              </ul>
            </div>
            <div className="how-to-play__block">
              <h3>Objectives</h3>
              <ul>
                <li>Destroy flying aliens and clear each wave</li>
                <li>Shoot bombs and drop pods before they land</li>
                <li>Stop ground units from filling the breach meter</li>
                <li>Defeat the mothership boss at the end of each level</li>
              </ul>
            </div>
            <div className="how-to-play__block">
              <h3>Progression</h3>
              <ul>
                <li>Chain kills to build combo multipliers</li>
                <li>Earn credits from kills, wave clears, and bosses</li>
                <li>Buy weapons and upgrades in the between-level shop</li>
              </ul>
            </div>
          </div>
          <p className="how-to-play__goal">
            Lose if breach reaches 100% or base health hits zero. Survive all three
            levels to complete the campaign.
          </p>
        </section>
      </div>
    </div>
  );
}
