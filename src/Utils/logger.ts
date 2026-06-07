import pino from 'pino'

export function makeShiraoriLogger(level: string = 'info') {
  return pino({
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      },
    },
  })
}

export const defaultLogger = makeShiraoriLogger('info')
