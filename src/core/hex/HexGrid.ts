import { HexCoord, hexKey, hexNeighbors } from './HexCoord';

/**
 * Generic hex grid container using axial coordinates.
 * Stores values by hex key for O(1) lookup.
 * Maintains a parallel coord map to avoid string-parsing on iteration.
 */
export class HexGrid<T> {
  private cells = new Map<string, T>();
  private coords = new Map<string, HexCoord>();

  get(q: number, r: number): T | undefined {
    return this.cells.get(hexKey(q, r));
  }

  getCoord(coord: HexCoord): T | undefined {
    return this.cells.get(hexKey(coord.q, coord.r));
  }

  /** O(1) lookup by pre-computed hex key string — avoids re-computing hexKey. */
  getByKey(key: string): T | undefined {
    return this.cells.get(key);
  }

  set(q: number, r: number, value: T): void {
    const key = hexKey(q, r);
    this.cells.set(key, value);
    if (!this.coords.has(key)) this.coords.set(key, { q, r });
  }

  setCoord(coord: HexCoord, value: T): void {
    const key = hexKey(coord.q, coord.r);
    this.cells.set(key, value);
    if (!this.coords.has(key)) this.coords.set(key, coord);
  }

  has(q: number, r: number): boolean {
    return this.cells.has(hexKey(q, r));
  }

  delete(q: number, r: number): boolean {
    const key = hexKey(q, r);
    this.coords.delete(key);
    return this.cells.delete(key);
  }

  get size(): number {
    return this.cells.size;
  }

  entries(): IterableIterator<[string, T]> {
    return this.cells.entries();
  }

  values(): IterableIterator<T> {
    return this.cells.values();
  }

  keys(): IterableIterator<string> {
    return this.cells.keys();
  }

  forEach(callback: (value: T, key: string) => void): void {
    this.cells.forEach(callback);
  }

  /** Iterate entries with parsed coords (no string splitting). */
  forEachEntry(callback: (coord: HexCoord, value: T) => void): void {
    for (const [key, value] of this.cells) {
      callback(this.coords.get(key)!, value);
    }
  }

  getNeighborValues(q: number, r: number): T[] {
    const coord: HexCoord = { q, r };
    return hexNeighbors(coord)
      .map((n) => this.getCoord(n))
      .filter((v): v is T => v !== undefined);
  }

  clear(): void {
    this.cells.clear();
    this.coords.clear();
  }

  toArray(): { coord: HexCoord; value: T }[] {
    const result: { coord: HexCoord; value: T }[] = [];
    for (const [key, value] of this.cells) {
      const coord = this.coords.get(key)!;
      result.push({ coord, value });
    }
    return result;
  }
}
