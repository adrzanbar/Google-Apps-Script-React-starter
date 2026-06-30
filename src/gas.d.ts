declare namespace google {
  namespace script {
    interface Runner {
      withSuccessHandler(handler: (result: unknown) => void): Runner
      withFailureHandler(handler: (error: Error) => void): Runner
      [fn: string]: (...args: unknown[]) => Runner
    }
    const run: Runner
  }
}
