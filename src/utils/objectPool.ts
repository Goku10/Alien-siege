/** Generic object pool for high-frequency entities (bullets, particles, etc.) */

export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;

  constructor(factory: () => T, reset: (item: T) => void, initialSize = 16) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    const item = this.pool.pop();
    if (item) {
      this.reset(item);
      return item;
    }
    return this.factory();
  }

  release(item: T): void {
    this.pool.push(item);
  }

  get available(): number {
    return this.pool.length;
  }
}
