export function gsr<T>(fn: string, ...args: unknown[]): Promise<T> {
  if (typeof google === 'undefined') {
    return Promise.reject(new Error('GAS runtime not available'))
  }

  return new Promise<T>((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)[fn](...args)
  })
}
