import { BALANCING } from '../data/balancing';
import { LEVEL_1, type LevelConfig, type WaveConfig } from '../data/levels';
import type { EnemyTypeId, SpawnSide } from '../types';

export type SpawnCallback = (
  typeId: EnemyTypeId,
  side: SpawnSide,
  y?: number,
) => void;

export interface WaveCallbacks {
  onWaveStart?: (waveNumber: number) => void;
  onWaveComplete?: (waveNumber: number, clearBonus: number) => void;
  onSpawn?: SpawnCallback;
}

type WaveState = 'waiting' | 'spawning' | 'active' | 'between';

export class WaveManager {
  private level: LevelConfig = LEVEL_1;
  private waveIndex = 0;
  private waveNumber = 0;
  private state: WaveState = 'waiting';
  private waveTimer = 0;
  private spawnIndex = 0;
  private betweenTimer = 0;
  private callbacks: WaveCallbacks;

  constructor(callbacks: WaveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  reset(): void {
    this.waveIndex = 0;
    this.waveNumber = 0;
    this.state = 'waiting';
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this.betweenTimer = BALANCING.waves.startDelay;
  }

  start(): void {
    this.reset();
    this.state = 'between';
    this.betweenTimer = BALANCING.waves.startDelay;
  }

  getWaveNumber(): number {
    return this.waveNumber;
  }

  getState(): WaveState {
    return this.state;
  }

  isSpawningComplete(): boolean {
    const wave = this.getCurrentWave();
    if (!wave) return true;
    return this.spawnIndex >= wave.spawns.length;
  }

  update(dt: number, aliveEnemyCount: number): void {
    if (this.state === 'waiting') return;

    if (this.state === 'between') {
      this.betweenTimer -= dt;
      if (this.betweenTimer <= 0) {
        this.beginWave();
      }
      return;
    }

    const wave = this.getCurrentWave();
    if (!wave) return;

    this.waveTimer += dt;

    while (
      this.spawnIndex < wave.spawns.length &&
      wave.spawns[this.spawnIndex].delay <= this.waveTimer
    ) {
      const spawn = wave.spawns[this.spawnIndex];
      const side = this.resolveSide(spawn.side);
      this.callbacks.onSpawn?.(spawn.enemyType, side, spawn.y);
      this.spawnIndex += 1;
    }

    const allSpawned = this.spawnIndex >= wave.spawns.length;
    if (allSpawned && aliveEnemyCount === 0 && this.state === 'spawning') {
      this.state = 'active';
      this.completeWave(wave);
    }
  }

  private beginWave(): void {
    const wave = this.getCurrentWave();
    if (!wave) {
      this.loopWaves();
      return;
    }

    this.waveNumber += 1;
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this.state = 'spawning';
    this.callbacks.onWaveStart?.(this.waveNumber);
  }

  private completeWave(wave: WaveConfig): void {
    this.callbacks.onWaveComplete?.(this.waveNumber, wave.clearBonus);
    this.waveIndex += 1;

    if (this.waveIndex >= this.level.waves.length) {
      this.loopWaves();
    }

    this.state = 'between';
    this.betweenTimer = BALANCING.waves.betweenWaveDelay;
  }

  private loopWaves(): void {
    this.waveIndex = BALANCING.waves.loopFromWave - 1;
  }

  private getCurrentWave(): WaveConfig | null {
    return this.level.waves[this.waveIndex] ?? null;
  }

  private resolveSide(side: SpawnSide | 'random'): SpawnSide {
    if (side === 'random') {
      return Math.random() < 0.5 ? 'left' : 'right';
    }
    return side;
  }
}
