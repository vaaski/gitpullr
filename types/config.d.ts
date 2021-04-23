export interface Config {
  hookPath: string
  hookPort: number
  projects: Project[]
}

export interface GitpullrPlugins {
  telegram: {
    token: string
    chat: string
    silent?: boolean
  }
  test: {
    test2: boolean
  }
}

export interface Project {
  name: string
  path: string
  exec: string[]
  secret?: string
  filter?: string
  plugins?: Partial<GitpullrPlugins>
}
