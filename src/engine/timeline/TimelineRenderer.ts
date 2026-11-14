export class TimelineRenderer {
  /**
   * Converts a timestamp in seconds to pixels based on current zoom (pixels/sec)
   */
  public static timeToPixels(time: number, zoom: number): number {
    return Math.max(0, time) * Math.max(1, zoom)
  }

  /**
   * Converts horizontal pixel offset to seconds
   */
  public static pixelsToTime(px: number, zoom: number): number {
    return Math.max(0, px) / Math.max(1, zoom)
  }

  /**
   * Calculates the currently visible time range in the viewport
   */
  public static visibleTimeRange(
    scrollLeft: number,
    viewportWidth: number,
    zoom: number
  ): { start: number; end: number } {
    const start = this.pixelsToTime(scrollLeft, zoom)
    const end = this.pixelsToTime(scrollLeft + viewportWidth, zoom)
    return { start, end }
  }

  /**
   * Calculates dynamic tick intervals based on zoom level
   */
  public static getRulerInterval(zoom: number): { major: number; minor: number } {
    if (zoom >= 80) {
      return { major: 1.0, minor: 0.2 } // Seconds and frame fractions
    }
    if (zoom >= 40) {
      return { major: 2.0, minor: 0.5 }
    }
    if (zoom >= 15) {
      return { major: 5.0, minor: 1.0 }
    }
    if (zoom >= 6) {
      return { major: 15.0, minor: 5.0 }
    }
    return { major: 30.0, minor: 10.0 }
  }

  /**
   * Calculates total scrollable timeline width
   */
  public static calculateTotalWidth(
    duration: number,
    zoom: number,
    minWidth: number = 1400
  ): number {
    return Math.max(minWidth, duration * zoom + 300)
  }
}
