import { Config } from "$/Config"
import type { GithubHook } from "$/GithubHook"

export const payload = (input: GithubHook.JSONorURLEncoded): GithubHook.PushHook => {
  let ret = input
  if (typeof input?.payload === "string") ret = JSON.parse(input.payload)

  return ret
}

export const defineConfig = (input: Config): Config => input

export const formatDuration = (ms: number): string => {
  if (ms < 0) ms = -ms
  const time = {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
    ms: Math.floor(ms) % 1000,
  }
  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => `${val}${key}`)
    .join(", ")
}
