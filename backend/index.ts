import Koa from "koa"

const app = new Koa()

app.use(async ctx => {
  ctx.body = "test"
})

app.listen(80).on("listening", () => console.log("listening"))
