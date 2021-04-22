export interface Config {
  hookPath: string
  projects: Project[]
}

export type HookTypes = "push"

export interface Hook {
  exec: string
  filter: string
}

export interface Project {
  name: string
  path: string
  secret: string
  hooks: Record<HookTypes, Hook>
}
