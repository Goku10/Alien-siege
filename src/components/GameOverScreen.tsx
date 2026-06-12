import type { GameSnapshot } from '../game/types';

interface GameOverScreenProps {
  snapshot: GameSnapshot;
  onRestart: () => void;
  onTitle: () => void;
}

export function GameOverScreen({ snapshot, onRestart, onTitle }: GameOverScreenProps) {
  const reason =
    snapshot.gameOverReason === 'breach'
      ? 'The perimeter was breached — alien forces overran the base.'
      : 'Base shields collapsed — the installation is lost.';

  const finalScore = snapshot.finalScore || snapshot.score;

  return (
    <div className="overlay overlay--game-over">
      <div className="panel panel--game-over">
        <p className="panel__eyebrow">Mission Failed</p>
        <h2>Game Over</h2>
        <p className="panel__reason">{reason}</p>

        <div className="game-over__stats">
          <div className="game-over__stat game-over__stat--primary">
            <span className="hud__label">FINAL SCORE</span>
            <span className="game-over__score">{finalScore.toLocaleString()}</span>
          </div>
          <div className="game-over__stat">
            <span className="hud__label">LEVEL REACHED</span>
            <span className="game-over__value">
              {snapshot.levelName || `Level ${snapshot.level}`}
            </span>
          </div>
          <div className="game-over__stat">
            <span className="hud__label">WAVES CLEARED</span>
            <span className="game-over__value">{snapshot.wave || 0}</span>
          </div>
          <div className="game-over__stat">
            <span className="hud__label">CREDITS EARNED</span>
            <span className="game-over__value game-over__value--credits">
              {snapshot.credits.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="panel__hint panel__hint--dim">
          Restarting begins a new run — shop upgrades and credits are reset.
        </p>

        <div className="panel__actions">
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            Try Again
          </button>
          <button type="button" className="btn btn--secondary" onClick={onTitle}>
            Title Screen
          </button>
        </div>
      </div>
    </div>
  );
}
