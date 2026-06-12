export type UpdateFn = (dt: number) => void;
export type RenderFn = () => void;

export class GameLoop {
  private running = false;
  private paused = false;
  private rafId = 0;
  private lastTime = 0;
  private updateFn: UpdateFn;
  private renderFn: RenderFn;
  private maxDt = 1 / 30;

  constructor(updateFn: UpdateFn, renderFn: RenderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  setPaused(paused: boolean): void {
    if (paused && !this.paused) {
      this.lastTime = performance.now();
    }
    this.paused = paused;
  }

  isPaused(): boolean {
    return this.paused;
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    dt = Math.min(dt, this.maxDt);

    if (!this.paused) {
      this.updateFn(dt);
    }
    this.renderFn();
  };
}
