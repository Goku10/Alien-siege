import type { GameSnapshot } from '../game/types';

interface GameHUDProps {
  snapshot: GameSnapshot;
  visible: boolean;
}

export function GameHUD({ snapshot, visible }: GameHUDProps) {
  if (!visible) return null;

  const healthPct = (snapshot.baseHealth / snapshot.maxBaseHealth) * 100;
  const breachPct = (snapshot.breach / snapshot.maxBreach) * 100;
  const heatPct = (snapshot.heat / snapshot.maxHeat) * 100;

  return (
    <div className="hud" aria-live="polite">
      <div className="hud__top">
        <div className="hud__stat">
          <span className="hud__label">SCORE</span>
          <span className="hud__value">{snapshot.score.toLocaleString()}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">CREDITS</span>
          <span className="hud__value hud__value--credits">{snapshot.credits}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">LEVEL</span>
          <span className="hud__value">{snapshot.level}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">WAVE</span>
          <span className="hud__value">{snapshot.wave || '—'}</span>
        </div>
      </div>

      <div className="hud__bottom">
        <div className="hud__bar-group">
          <span className="hud__label">BASE HEALTH</span>
          <div className="hud__bar">
            <div
              className="hud__bar-fill hud__bar-fill--health"
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>

        <div className="hud__bar-group">
          <span className="hud__label">BREACH</span>
          <div className="hud__bar">
            <div
              className="hud__bar-fill hud__bar-fill--breach"
              style={{ width: `${breachPct}%` }}
            />
          </div>
        </div>

        <div className="hud__weapon">
          <span className="hud__label">WEAPON</span>
          <span className="hud__weapon-name">{snapshot.weaponName}</span>
          <div className="hud__bar hud__bar--heat">
            <div
              className="hud__bar-fill hud__bar-fill--heat"
              style={{ width: `${heatPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
