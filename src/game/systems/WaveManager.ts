import { BALANCING } from '../data/balancing';
import type { LevelScaling } from '../data/levelScaling';
import type { LevelConfig, WaveConfig } from '../data/levels';
import type { EnemyTypeId, SpawnSide } from '../types';

export interface SpawnModifiers {
  speedMultiplier: number;
  healthMultiplier: number;
  scoreMultiplier: number;
  dropIntervalScale: number;
  maxDropsBonus: number;
}

export type SpawnCallback = (
  typeId: EnemyTypeId,
  side: SpawnSide,
  y: number | undefined,
  modifiers: SpawnModifiers,
) => void;

export interface WaveCallbacks {
  onWaveStart?: (waveNumber: number, totalWaves: number) => void;
  onWaveComplete?: (waveNumber: number, clearBonus: number) => void;
  onLevelWavesComplete?: () => void;
  onSpawn?: SpawnCallback;
}

type WaveState = 'idle' | 'between' | 'spawning';

export class WaveManager {
  private level: LevelConfig | null = null;
  private scaling: LevelScaling | null = null;
  private waveIndex = 0;
  private waveNumber = 0;
  private state: WaveState = 'idle';
  private waveTimer = 0;
  private spawnIndex = 0;
  private betweenTimer = 0;
  private callbacks: WaveCallbacks;

  constructor(callbacks: WaveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  reset(): void {
    this.level = null;
    this.scaling = null;
    this.waveIndex = 0;
    this.waveNumber = 0;
    this.state = 'idle';
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this.betweenTimer = 0;
  }

  startLevel(level: LevelConfig, scaling: LevelScaling): void {
    this.level = level;
    this.scaling = scaling;
    this.waveIndex = 0;
    this.waveNumber = 0;
    this.state = 'between';
    this.betweenTimer = BALANCING.waves.startDelay;
    this.waveTimer = 0;
    this.spawnIndex = 0;
  }

  getWaveNumber(): number {
    return this.waveNumber;
  }

  getTotalWaves(): number {
    return this.level?.waves.length ?? 0;
  }

  getState(): WaveState {
    return this.state;
  }

  isActive(): boolean {
    return this.state !== 'idle' && this.level !== null;
  }

  update(dt: number, aliveFlyingCount: number): void {
    if (!this.level || !this.scaling || this.state === 'idle') return;

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
    const delayScale = this.scaling.spawnDelayScale;

    while (this.spawnIndex < wave.spawns.length) {
      const spawn = wave.spawns[this.spawnIndex];
      const scaledDelay = spawn.delay * delayScale;
      if (scaledDelay > this.waveTimer) break;

      const side = this.resolveSide(spawn.side);
      this.callbacks.onSpawn?.(spawn.enemyType, side, spawn.y, {
        speedMultiplier: this.scaling.speedMultiplier,
        healthMultiplier: this.scaling.healthMultiplier,
        scoreMultiplier: this.scaling.scoreMultiplier,
        dropIntervalScale: this.scaling.dropIntervalScale,
        maxDropsBonus: this.scaling.maxDropsBonus,
      });
      this.spawnIndex += 1;
    }

    const allSpawned = this.spawnIndex >= wave.spawns.length;
    if (allSpawned && aliveFlyingCount === 0 && this.state === 'spawning') {
      this.completeWave(wave);
    }
  }

  private beginWave(): void {
    const wave = this.getCurrentWave();
    if (!wave || !this.level) return;

    this.waveNumber += 1;
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this.state = 'spawning';
    this.callbacks.onWaveStart?.(this.waveNumber, this.level.waves.length);
  }

  private completeWave(wave: WaveConfig): void {
    if (!this.scaling) return;

    const bonus = Math.floor(wave.clearBonus * this.scaling.clearBonusScale);
    this.callbacks.onWaveComplete?.(this.waveNumber, bonus);
    this.waveIndex += 1;

    if (this.waveIndex >= (this.level?.waves.length ?? 0)) {
      this.state = 'idle';
      this.callbacks.onLevelWavesComplete?.();
      return;
    }

    this.state = 'between';
    this.betweenTimer = BALANCING.waves.betweenWaveDelay;
  }

  private getCurrentWave(): WaveConfig | null {
    return this.level?.waves[this.waveIndex] ?? null;
  }

  private resolveSide(side: SpawnSide | 'random'): SpawnSide {
    if (side === 'random') {
      return Math.random() < 0.5 ? 'left' : 'right';
    }
    return side;
  }
}
