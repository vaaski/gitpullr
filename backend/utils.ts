import { ReceivedHook, GitHubWebhook } from "./types"

export const uniqueArray = (arr: string[]) => [...new Set(arr)]

export const handleXWwwForm = (data: ReceivedHook): GitHubWebhook => {
  if ("payload" in data && typeof data.payload === "string")
    return JSON.parse(data.payload)

  return data
}
