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

  return (
    <div className="overlay overlay--game-over">
      <div className="panel panel--game-over">
        <p className="panel__eyebrow">Mission Failed</p>
        <h2>Game Over</h2>
        <p className="panel__reason">{reason}</p>

        <div className="game-over__stats">
          <div className="game-over__stat">
            <span className="hud__label">FINAL SCORE</span>
            <span className="game-over__score">
              {(snapshot.finalScore || snapshot.score).toLocaleString()}
            </span>
          </div>
          <div className="game-over__stat">
            <span className="hud__label">WAVES SURVIVED</span>
            <span className="game-over__value">{snapshot.wave || 0}</span>
          </div>
        </div>

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
