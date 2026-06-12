import type { GameSnapshot } from '../game/types';

interface LevelIntroOverlayProps {
  snapshot: GameSnapshot;
}

export function LevelIntroOverlay({ snapshot }: LevelIntroOverlayProps) {
  if (!snapshot.showLevelIntro) return null;

  return (
    <div className="overlay overlay--level-intro">
      <div className="level-intro">
        <p className="level-intro__eyebrow">
          Level {snapshot.level} — {snapshot.levelSubtitle}
        </p>
        <h2 className="level-intro__title">{snapshot.levelName}</h2>
        <p className="level-intro__text">{snapshot.levelIntroText}</p>
        <p className="level-intro__waves">
          {snapshot.totalWavesInLevel} waves before mothership contact
        </p>
      </div>
    </div>
  );
}
