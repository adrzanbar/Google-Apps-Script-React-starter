export function gsr<T>(fn: string, ...args: unknown[]): Promise<T> {
  const runner = typeof google !== 'undefined' ? google.script.run : null

  if (!runner) {
    return Promise.reject(new Error('GAS runtime not available'))
  }

  return new Promise((resolve, reject) => {
    runner.withSuccessHandler(resolve).withFailureHandler(reject)[fn](...args)
  })
}
