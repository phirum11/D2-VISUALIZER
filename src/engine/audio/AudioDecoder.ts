export class AudioDecoder {
  private static sharedContext: AudioContext | null = null

  public static getContext(): AudioContext {
    if (!this.sharedContext || this.sharedContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.sharedContext = new AudioCtx({ latencyHint: 'interactive' })
    }
    return this.sharedContext
  }

  /**
   * Decodes raw binary audio data into a decoded AudioBuffer
   */
  public static async decodeBuffer(
    buffer: ArrayBuffer | Uint8Array
  ): Promise<AudioBuffer> {
    const ctx = this.getContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    let arrayBuffer: ArrayBuffer
    if (buffer instanceof Uint8Array) {
      const copy = new Uint8Array(new ArrayBuffer(buffer.byteLength))
      copy.set(buffer)
      arrayBuffer = copy.buffer
    } else {
      arrayBuffer = (buffer.slice(0) as ArrayBuffer)
    }

    try {
      const decoded = await ctx.decodeAudioData(arrayBuffer)
      return decoded
    } catch (err) {
      console.error('[AUDIO DECODER] Failed to decode audio buffer:', err)
      throw new Error(
        `Failed to decode audio data. Format may be unsupported or file corrupted: ${String(
          err
        )}`
      )
    }
  }
}
