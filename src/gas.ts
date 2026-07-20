declare global {
  const google: {
    script: {
      run: {
        withSuccessHandler: (handler: (result: any) => void) => any
        withFailureHandler: (handler: (error: any) => void) => any
        [fn: string]: (...args: any[]) => any
      }
    }
  }
}

export function gsr<T>(fn: string, ...args: unknown[]): Promise<T> {
  if (typeof google === "undefined") {
    return Promise.reject(new Error("GAS runtime not available"))
  }

  return new Promise<T>((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)[fn](...args)
  })
}
