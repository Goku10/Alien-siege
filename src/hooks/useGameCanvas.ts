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
  breach: 0,
  maxBreach: 100,
  combo: 1,
  weaponName: 'Machine Gun',
  heat: 0,
  maxHeat: 100,
  secondaryCooldown: 0,
  secondaryMaxCooldown: 1,
  isBossFight: false,
  bossHealth: 0,
  bossMaxHealth: 0,
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
    gameRef.current?.beginPrototypeSession();
  }, []);

  const goToTitle = useCallback(() => {
    gameRef.current?.resetSession();
    gameRef.current?.setScreen('title');
  }, []);

  const togglePause = useCallback(() => {
    gameRef.current?.togglePause();
  }, []);

  const resumeGame = useCallback(() => {
    gameRef.current?.setScreen('playing');
  }, []);

  return {
    canvasRef,
    screen,
    snapshot,
    startGame,
    goToTitle,
    togglePause,
    resumeGame,
  };
}
