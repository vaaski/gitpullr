import { Project } from "$/Config"
import got from "got"

export const strings = {
  fail: () => (project: Project): string => `⚠️ failed to update backend for ${project.name}.`,
  success: (add?: string) => (project: Project): string =>
    `⏬ successfully updated backend for ${project.name}${add ? " " + add : ""}.`,
}

export default async (project: Project, string = strings.success()): Promise<void> => {
  if (!project.plugins?.telegram) return
  const { token, chat, silent } = project.plugins.telegram
  const api = (m: string) => `https://api.telegram.org/bot${token}/${m}`

  const text = string(project)

  const url = new URL(api("sendMessage"))
  const params: Record<string, string> = {
    text,
    chat_id: chat,
    disable_web_page_preview: "true",
    parse_mode: "HTML",
  }
  if (silent) params.disable_notification = "true"

  Object.entries(params).forEach(p => url.searchParams.set(...p))

  await got.post(url)
}
