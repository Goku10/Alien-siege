import { GameHUD } from './GameHUD';
import { GameOverScreen } from './GameOverScreen';
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
  } = useGameCanvas();

  const showHUD = screen === 'playing' || screen === 'paused';

  return (
    <div className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Alien Siege gameplay canvas"
      />
      <GameHUD snapshot={snapshot} visible={showHUD} />
      {screen === 'title' && <TitleScreen onStart={startGame} />}
      {screen === 'paused' && (
        <PauseOverlay onResume={resumeGame} onQuit={goToTitle} />
      )}
      {screen === 'gameOver' && (
        <GameOverScreen
          snapshot={snapshot}
          onRestart={restartGame}
          onTitle={goToTitle}
        />
      )}
      {screen === 'playing' && (
        <div className="prototype-badge">Phase 3 — Base Defense</div>
      )}
    </div>
  );
}
