import { Semaphore } from "./semaphore"

test("fulfills all tasks", async () => {
  const n = 10
  for (let p = 1; p <= n; p += 1) {
    const results: number[] = []
    const semaphore = new Semaphore(p)

    for (let i = 0; i < n; i += 1) {
      semaphore.run(() => {
        results.push(i)
      })
    }
    // eslint-disable-next-line no-await-in-loop
    await semaphore.done()
    expect(results.length).toBe(n)
  }
})

describe("constructor", () => {
  test("Can not enter capacity lower than 1", () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Semaphore(-1)
    }).toThrowErrorMatchingInlineSnapshot(`"The capacity must not be lower than 1"`)
  })
})
describe("Calling done on an empty semaphore", () => {
  test("resolves", async () => {
    expect.assertions(1)
    const s = new Semaphore()
    await expect(s.done()).resolves.toBe(true)
  })
})
