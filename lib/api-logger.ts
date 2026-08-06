type LogContext = Record<string, unknown>

export function logApiInfo(event: string, context: LogContext) {
  const payload = {
    level: 'info',
    event,
    timestamp: new Date().toISOString(),
    ...context,
  }

  console.info(JSON.stringify(payload))
}

export function logApiError(event: string, context: LogContext, error?: unknown) {
  const payload = {
    level: 'error',
    event,
    timestamp: new Date().toISOString(),
    ...context,
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
  }

  console.error(JSON.stringify(payload))
}

export function logApiWarning(event: string, context: LogContext) {
  const payload = {
    level: 'warn',
    event,
    timestamp: new Date().toISOString(),
    ...context,
  }

  console.warn(JSON.stringify(payload))
}
