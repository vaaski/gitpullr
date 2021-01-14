import Koa from "koa"
import Router from "@koa/router"
import mount from "koa-mount"
import bodyParser from "koa-bodyparser"
import frontend from "./frontend"

const dev = process.env.NODE_ENV === "development"

const app = new Koa()
app.use(bodyParser())
const router = new Router()

const log = (...t: any[]) => console.log("\u001b[90m[backend]:\u001b[39m", ...t)

router.get("/hook", ctx => {
  ctx.body = "hook"
})
router.post("/hook", ctx => {
  console.log(ctx.request.body)
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
  .listen(80)
  .on("listening", () => log("listening"))
