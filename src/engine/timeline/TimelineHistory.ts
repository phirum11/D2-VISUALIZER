import { TimelineSnapshot } from './types'

export class TimelineHistory {
  private past: TimelineSnapshot[] = []
  private future: TimelineSnapshot[] = []
  private maxEntries: number

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries
  }

  /**
   * Pushes a new snapshot onto the undo stack and clears redo stack
   */
  public pushState(snapshot: TimelineSnapshot): void {
    const clone = this.cloneSnapshot(snapshot)
    this.past.push(clone)
    if (this.past.length > this.maxEntries) {
      this.past.shift()
    }
    this.future = []
  }

  /**
   * Pops previous state from undo stack, pushing current state to redo stack
   */
  public undo(current: TimelineSnapshot): TimelineSnapshot | null {
    if (this.past.length === 0) return null

    const previous = this.past.pop()!
    this.future.push(this.cloneSnapshot(current))

    return this.cloneSnapshot(previous)
  }

  /**
   * Pops next state from redo stack, pushing current state to undo stack
   */
  public redo(current: TimelineSnapshot): TimelineSnapshot | null {
    if (this.future.length === 0) return null

    const next = this.future.pop()!
    this.past.push(this.cloneSnapshot(current))

    return this.cloneSnapshot(next)
  }

  public canUndo(): boolean {
    return this.past.length > 0
  }

  public canRedo(): boolean {
    return this.future.length > 0
  }

  public clear(): void {
    this.past = []
    this.future = []
  }

  private cloneSnapshot(snapshot: TimelineSnapshot): TimelineSnapshot {
    return JSON.parse(JSON.stringify(snapshot))
  }
}
