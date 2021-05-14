export interface Config {
  /**
   * the path where gitpullr will be reachable.
   *
   * default: "/"
   */
  hookPath?: string
  /**
   * the path where gitpullr will be reachable.
   *
   * default: "8088"
   */
  hookPort?: string
  /**
   * used for self-testing, leave empty if you don't want
   * to verify if the server is reachable upon startup.
   *
   * this has to be the complete address, including port and path.
   */
  hookAddr?: string
  /**
   * list of projects
   */
  projects: Project[]
}

export interface GitpullrPlugins {
  telegram: {
    /**
     * telegram bot token
     */
    token: string
    /**
     * telegram chat_id or user_id
     */
    chat: string
    /**
     * send the message without a notification
     *
     * default: false
     */
    silent?: boolean
  }
}

export interface Project {
  /**
   * github username and repo
   * @example vaaski/gitpullr
   */
  name: string
  /**
   * the absolute path to your project.
   *
   * this is where the commands in `exec` will be executed
   */
  path: string
  /**
   * array of commands to execute upon receiving a webhook
   */
  exec: string[]
  /**
   * optional secret
   */
  secret?: string
  /**
   * optional regex to skip execution, can be `null` to disable filtering
   *
   * default: `\\[skip (?:backend|ci)\\]`
   */
  filter?: string
  /**
   * optional regex for the branch, can be `null` to disable branch matching
   *
   * default: `^refs\\/heads\\/(?:main|master)$`
   */
  branch?: string
  /**
   * list of plugins
   */
  plugins?: Partial<GitpullrPlugins>
}
