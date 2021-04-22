export interface Config {
  hookPath: string
  hookPort: number
  projects: Project[]
}

export interface Project {
  name: string
  path: string
  secret: string
  exec: string[]
  filter: string
}
