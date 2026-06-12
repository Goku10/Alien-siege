import { BossWarningScreen } from './BossWarningScreen';
import { GameHUD } from './GameHUD';
import { GameOverScreen } from './GameOverScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { LevelIntroOverlay } from './LevelIntroOverlay';
import { PauseOverlay } from './PauseOverlay';
import { TitleScreen } from './TitleScreen';
import { useGameCanvas } from '../hooks/useGameCanvas';

export function GameCanvas() {
  const {
    canvasRef,
    screen,
    snapshot,
    startGame,
    goToTitle,
    resumeGame,
    restartGame,
    continueLevel,
  } = useGameCanvas();

  const showHUD =
    screen === 'playing' ||
    screen === 'paused' ||
    screen === 'bossWarning';

  return (
    <div className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Alien Siege gameplay canvas"
      />
      <GameHUD snapshot={snapshot} visible={showHUD} />
      {screen === 'title' && <TitleScreen onStart={startGame} />}
      {screen === 'playing' && <LevelIntroOverlay snapshot={snapshot} />}
      {screen === 'paused' && (
        <PauseOverlay onResume={resumeGame} onQuit={goToTitle} />
      )}
      {screen === 'bossWarning' && <BossWarningScreen snapshot={snapshot} />}
      {screen === 'levelComplete' && (
        <LevelCompleteScreen
          snapshot={snapshot}
          onContinue={continueLevel}
          onTitle={goToTitle}
        />
      )}
      {screen === 'gameOver' && (
        <GameOverScreen
          snapshot={snapshot}
          onRestart={restartGame}
          onTitle={goToTitle}
        />
      )}
      {screen === 'playing' && (
        <div className="prototype-badge">Phase 4 — Level Progression</div>
      )}
    </div>
  );
}
