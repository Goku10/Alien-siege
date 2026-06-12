import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from '../game/Game';
import type { GameScreen, GameSnapshot } from '../game/types';

const DEFAULT_SNAPSHOT: GameSnapshot = {
  score: 0,
  credits: 0,
  level: 1,
  wave: 0,
  baseHealth: 100,
  maxBaseHealth: 100,
  baseShield: 0,
  maxBaseShield: 0,
  breach: 0,
  maxBreach: 100,
  combo: 1,
  weaponName: 'Machine Gun',
  weaponId: 'machine_gun',
  weaponKind: 'bullet',
  heat: 0,
  maxHeat: 100,
  magazine: 0,
  magazineSize: 0,
  reloading: false,
  reloadProgress: 0,
  secondaryCooldown: 0,
  secondaryMaxCooldown: 1,
  isBossFight: false,
  bossHealth: 0,
  bossMaxHealth: 0,
  enemiesRemaining: 0,
  groundThreats: 0,
  breachDanger: false,
  bombWarning: false,
  gameOverReason: null,
  finalScore: 0,
  levelName: '',
  levelSubtitle: '',
  waveInLevel: 0,
  totalWavesInLevel: 0,
  showLevelIntro: false,
  levelIntroText: '',
  levelCompleteBonus: 0,
  levelSummary: null,
  isCampaignComplete: false,
  totalLevels: 3,
  bossPhase: 0,
  bossShieldActive: false,
  bossName: 'Alien Mothership',
  showShop: false,
  shopItems: [],
  shopToast: null,
};

export function useGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [screen, setScreen] = useState<GameScreen>('title');
  const [snapshot, setSnapshot] = useState<GameSnapshot>(DEFAULT_SNAPSHOT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas, {
      onScreenChange: setScreen,
      onSnapshot: setSnapshot,
    });
    gameRef.current = game;
    game.start();

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const startGame = useCallback(() => {
    gameRef.current?.startNewRun();
  }, []);

  const goToTitle = useCallback(() => {
    gameRef.current?.resetSession({ skipIntro: true });
    gameRef.current?.setScreen('title');
  }, []);

  const togglePause = useCallback(() => {
    gameRef.current?.togglePause();
  }, []);

  const resumeGame = useCallback(() => {
    gameRef.current?.togglePause();
  }, []);

  const restartGame = useCallback(() => {
    gameRef.current?.startNewRun();
  }, []);

  const openShop = useCallback(() => {
    gameRef.current?.openShop();
  }, []);

  const leaveShop = useCallback(() => {
    gameRef.current?.leaveShopAndContinue();
  }, []);

  const purchaseShopItem = useCallback((itemId: string) => {
    gameRef.current?.purchaseShopItem(itemId);
  }, []);

  const equipShopItem = useCallback((itemId: string) => {
    gameRef.current?.equipShopItem(itemId);
  }, []);

  return {
    canvasRef,
    screen,
    snapshot,
    startGame,
    goToTitle,
    togglePause,
    resumeGame,
    restartGame,
    openShop,
    leaveShop,
    purchaseShopItem,
    equipShopItem,
  };
}
