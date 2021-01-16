import chalk from "chalk"

type LoggerSetup = (verbosity?: 0 | 1 | 2, prefix?: string) => Logger

export interface Logger {
  warn(...t: any[]): void
  info(...t: any[]): void
  debug(...t: any[]): void
}

const logger: LoggerSetup = (verbosity = 0, prefix = "gitpullr"): Logger => {
  const v = () => {
    if ("VERBOSITY" in process.env) return Number(process.env.VERBOSITY)
    return verbosity
  }

  return {
    warn: (...t: any[]) =>
      v() >= 0 && console.log(chalk.yellow(`[${prefix}]`, ...t)),
    info: (...t: any[]) =>
      v() >= 1 && console.log(chalk.blue(`[${prefix}]`, ...t)),
    debug: (...t: any[]) =>
      v() >= 2 && console.log(chalk.grey(`[${prefix}]`, ...t)),
  }
}

export default logger
