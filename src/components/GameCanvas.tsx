import { BossWarningScreen } from './BossWarningScreen';
import { GameHUD } from './GameHUD';
import { GameOverScreen } from './GameOverScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { LevelIntroOverlay } from './LevelIntroOverlay';
import { PauseOverlay } from './PauseOverlay';
import { ShopScreen } from './ShopScreen';
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
    openShop,
    leaveShop,
    purchaseShopItem,
    equipShopItem,
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
      {screen === 'playing' && <LevelIntroOverlay snapshot={snapshot} />}
      {screen === 'paused' && (
        <PauseOverlay onResume={resumeGame} onQuit={goToTitle} />
      )}
      {screen === 'bossWarning' && <BossWarningScreen snapshot={snapshot} />}
      {screen === 'levelComplete' && (
        <LevelCompleteScreen
          snapshot={snapshot}
          onContinue={openShop}
          onTitle={goToTitle}
        />
      )}
      {screen === 'shop' && (
        <ShopScreen
          snapshot={snapshot}
          onContinue={leaveShop}
          onBuy={purchaseShopItem}
          onEquip={equipShopItem}
        />
      )}
      {screen === 'gameOver' && (
        <GameOverScreen
          snapshot={snapshot}
          onRestart={restartGame}
          onTitle={goToTitle}
        />
      )}
    </div>
  );
}
