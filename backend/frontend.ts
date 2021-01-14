import koaStatic from "koa-static"
import { join } from "path"
import Koa from "koa"

const uiPath = join(__dirname, "../dist")
const frontend = new Koa()
frontend.use(koaStatic(uiPath))

export default frontend