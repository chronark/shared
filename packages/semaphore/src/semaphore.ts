export class Semaphore {
  private concurrency: number

  private queue: {
    resolve: (value: void | PromiseLike<void>) => void
    reject: (reason?: any) => void
    fn: Function
  }[]

  private active: number

  /**
   * Create a new semaphore
   *
   * @param concurrency - The number of active functions that can run simultaneously.
   */
  constructor(concurrency: number) {
    this.concurrency = concurrency
    this.queue = []
    this.active = 0
  }

  /**
   * Run a function if possible, or enqueue it if the semaphore has reached its
   * concurrent capacity.
   * @param fn - A synchrounous or asynchronous function.
   *
   * @example
   * ```
   * const semaphore = new Semaphore(4)
   * semaphore.run(() => console.log("Hello World"))
   * ```
   */
  public run(fn: Function): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        fn,
      })
      this.try()
    })
  }

  private async try(): Promise<void> {
    if (this.active === this.concurrency || this.queue.length === 0) {
      return
    }
    const next = this.queue.shift()
    if (next) {
      const { fn, resolve, reject } = next
      this.active += 1
      try {
        await fn()
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        this.active -= 1
        this.try()
      }
    }
  }
}
