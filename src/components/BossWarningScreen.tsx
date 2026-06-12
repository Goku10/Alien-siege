import type { GameSnapshot } from '../game/types';

interface BossWarningScreenProps {
  snapshot: GameSnapshot;
}

export function BossWarningScreen({ snapshot }: BossWarningScreenProps) {
  return (
    <div className="overlay overlay--boss-warning">
      <div className="boss-warning">
        <p className="boss-warning__eyebrow">Level {snapshot.level} — All waves cleared</p>
        <h2 className="boss-warning__title">MOTHERSHIP INCOMING</h2>
        <p className="boss-warning__text">
          Alien command vessel breaching upper atmosphere. Target the glowing core
          weak points — body shots are reduced. Watch for shields in later phases.
        </p>
        <div className="boss-warning__pulse" aria-hidden="true" />
      </div>
    </div>
  );
}
