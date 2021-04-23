import type { GithubHook } from "$/GithubHook"

export const payload = (input: GithubHook.JSONorURLEncoded): GithubHook.PushHook => {
  let ret = input
  if (typeof input?.payload === "string") ret = JSON.parse(input.payload)

  return ret
}
