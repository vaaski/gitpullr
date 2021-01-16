import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import mount from "koa-mount"
import frontend from "./frontend"
import { uniqueArray, handleXWwwForm } from "./utils"
import log, { Logger } from "./log"
import setupSecret from "./secret"

interface ServerConfig {
  port: number
  logger?: Logger
  secret: string
}

const dev = process.env.NODE_ENV === "development"

export default ({ logger = log(), port, secret }: ServerConfig) => {
  const { warn, info, debug } = logger
  const app = new Koa()
  app.use(bodyParser())
  const router = new Router()
  debug("set up koa and plugins")

  const verifySecret = setupSecret({ logger, secret })

  router.post("/hook", verifySecret, (ctx, next) => {
    const payload = handleXWwwForm(ctx.request.body)

    let changedFiles = []

    if (!payload.commits) return warn("no commits found in payload")
    for (const commit of payload.commits) {
      changedFiles.push(...commit.added, ...commit.modified)
    }
    changedFiles = uniqueArray(changedFiles)

    info(`after ${payload.after.slice(0, 7)} changedFiles: ${changedFiles}`)

    ctx.status = 200
  })

  if (!dev) app.use(mount("/ui", frontend))

  app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(ctx => {
      if (dev) return ctx.redirect("http://localhost:8080/ui")
      return ctx.redirect("/ui")
    })
    .listen(port)
    .on("listening", () => info(`listening on port ${port}`))
}
