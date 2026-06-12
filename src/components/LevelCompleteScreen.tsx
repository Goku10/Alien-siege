import type { GameSnapshot } from '../game/types';

interface LevelCompleteScreenProps {
  snapshot: GameSnapshot;
  onContinue: () => void;
  onTitle: () => void;
}

export function LevelCompleteScreen({ snapshot, onContinue, onTitle }: LevelCompleteScreenProps) {
  const allDone = snapshot.isCampaignComplete;
  const showNextLevel = !allDone && snapshot.level < snapshot.totalLevels;

  return (
    <div className="overlay overlay--level-complete">
      <div className="panel panel--level-complete">
        {allDone ? (
          <>
            <p className="panel__eyebrow panel__eyebrow--success">Campaign Complete</p>
            <h2>Sector Secured</h2>
            <p className="panel__reason">
              All defense perimeters held. The mothership boss awaits in the next deployment.
            </p>
          </>
        ) : (
          <>
            <p className="panel__eyebrow panel__eyebrow--success">Level Complete</p>
            <h2>{snapshot.levelName}</h2>
            <p className="panel__reason">Perimeter secured. Hostile wave assault neutralized.</p>
          </>
        )}

        <div className="game-over__stats">
          <div className="game-over__stat">
            <span className="hud__label">SCORE</span>
            <span className="game-over__score">{snapshot.score.toLocaleString()}</span>
          </div>
          {snapshot.levelCompleteBonus > 0 && (
            <div className="game-over__stat">
              <span className="hud__label">LEVEL BONUS</span>
              <span className="game-over__value">+{snapshot.levelCompleteBonus}</span>
            </div>
          )}
        </div>

        <div className="panel__actions">
          {showNextLevel && (
            <button type="button" className="btn btn--primary" onClick={onContinue}>
              Next Level
            </button>
          )}
          <button type="button" className="btn btn--secondary" onClick={onTitle}>
            {allDone ? 'Title Screen' : 'Quit to Title'}
          </button>
        </div>
      </div>
    </div>
  );
}
