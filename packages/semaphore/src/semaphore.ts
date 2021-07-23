export class Semaphore {
  private capacity: number

  private queue: {
    resolve: (value: void | PromiseLike<void>) => void
    reject: (reason?: any) => void
    fn: Function
  }[]

  private active: number

  /**
   * Create a new semaphore
   *
   * @param capacity - The number of active functions that can run simultaneously.
   */
  constructor(capacity = 1) {
    if (capacity < 1) {
      throw new Error("The capacity must not be lower than 1")
    }
    this.capacity = capacity
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
    while (this.active >= this.capacity) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    const next = this.queue.shift()
    if (!next) {
      return
    }
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

  /**
   * Resolves only after all tasks have been resolved
   * @example
   * ```
   * const semaphore = new Semaphore(2)
   * // ... add tasks
   * await semaphore.done()
   */
  public async done(): Promise<boolean> {
    await this.try()
    return this.queue.length === 0
  }
}
