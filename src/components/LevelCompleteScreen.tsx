import type { GameSnapshot } from '../game/types';

interface LevelCompleteScreenProps {
  snapshot: GameSnapshot;
  onContinue: () => void;
  onTitle: () => void;
}

function formatAccuracy(percent: number | null): string {
  if (percent === null) return '—';
  return `${Math.round(percent * 100)}%`;
}

export function LevelCompleteScreen({ snapshot, onContinue, onTitle }: LevelCompleteScreenProps) {
  const allDone = snapshot.isCampaignComplete;
  const showShop = !allDone;
  const summary = snapshot.levelSummary;

  return (
    <div className="overlay overlay--level-complete">
      <div className="panel panel--level-complete">
        {allDone ? (
          <>
            <p className="panel__eyebrow panel__eyebrow--success">Campaign Complete</p>
            <h2>Sector Secured</h2>
            <p className="panel__reason">
              All defense perimeters held. The alien advance has been broken.
            </p>
          </>
        ) : (
          <>
            <p className="panel__eyebrow panel__eyebrow--success">Level Complete</p>
            <h2>{snapshot.levelName}</h2>
            <p className="panel__reason">Perimeter secured. Hostile wave assault neutralized.</p>
          </>
        )}

        {summary ? (
          <div className="level-summary">
            <div className="level-summary__row level-summary__row--highlight">
              <span className="hud__label">SCORE THIS LEVEL</span>
              <span className="level-summary__value level-summary__value--score">
                +{summary.scoreGained.toLocaleString()}
              </span>
            </div>
            <div className="level-summary__row level-summary__row--highlight">
              <span className="hud__label">CREDITS EARNED</span>
              <span className="level-summary__value level-summary__value--credits">
                +{summary.creditsEarned.toLocaleString()}
              </span>
            </div>
            <div className="level-summary__divider" />
            <div className="level-summary__row">
              <span className="hud__label">ENEMIES DESTROYED</span>
              <span className="level-summary__value">{summary.enemiesDestroyed}</span>
            </div>
            <div className="level-summary__row">
              <span className="hud__label">ACCURACY</span>
              <span className="level-summary__value">
                {formatAccuracy(summary.accuracyPercent)}
              </span>
            </div>
            {summary.bossCreditReward > 0 && (
              <div className="level-summary__row">
                <span className="hud__label">BOSS REWARD</span>
                <span className="level-summary__value level-summary__value--credits">
                  +{summary.bossCreditReward} CR
                </span>
              </div>
            )}
            {(summary.accuracyBonus > 0 || summary.breachBonus > 0) && (
              <>
                <div className="level-summary__divider" />
                <p className="level-summary__bonuses-label">Performance bonuses</p>
                {summary.accuracyBonus > 0 && (
                  <div className="level-summary__row level-summary__row--bonus">
                    <span className="hud__label">ACCURACY BONUS</span>
                    <span className="level-summary__value level-summary__value--credits">
                      +{summary.accuracyBonus} CR
                    </span>
                  </div>
                )}
                {summary.breachBonus > 0 && (
                  <div className="level-summary__row level-summary__row--bonus">
                    <span className="hud__label">LOW BREACH BONUS</span>
                    <span className="level-summary__value level-summary__value--credits">
                      +{summary.breachBonus} CR
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="level-summary__footer">
              <span className="hud__label">TOTAL CREDITS</span>
              <span className="level-summary__total">{snapshot.credits.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="game-over__stats">
            <div className="game-over__stat">
              <span className="hud__label">SCORE</span>
              <span className="game-over__score">{snapshot.score.toLocaleString()}</span>
            </div>
            <div className="game-over__stat">
              <span className="hud__label">CREDITS</span>
              <span className="game-over__value">{snapshot.credits.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="panel__actions">
          {showShop && (
            <button type="button" className="btn btn--primary" onClick={onContinue}>
              {snapshot.level >= snapshot.totalLevels ? 'Visit Final Shop' : 'Visit Shop'}
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
