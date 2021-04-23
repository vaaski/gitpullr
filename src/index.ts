import debug from "debug"
import express from "express"
import execa from "execa"
import { payload } from "./util"
import secret from "./secret"
import plugins from "../plugins"
import got from "got"

const log = debug("gitpullr")

import config from "../config"

const pathname = config.hookPath || "/"
const port = config.hookPort || "8088"

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.get("/ping", (_, res) => {
  log("received ping, sending pong")
  res.status(200).send("pong")
})

server.post(pathname, async (req, res) => {
  const body = payload(req.body)

  const project = config.projects.find(p => p.name === body.repository.full_name)

  if (!project) return res.sendStatus(404)
  if (project.secret && !secret(project.secret, req)) return res.sendStatus(401)

  if (project.filter !== null) {
    const filter = project.filter ?? "\\[skip (?:backend|ci)\\]"
    const reg = new RegExp(filter)
    if (reg.test(body.head_commit.message)) return res.status(200).send("filter flag detected")
  }

  console.log(`new request for project ${project.name}`)

  try {
    for (const command of project.exec) {
      await execa.command(command, {
        cwd: project.path,
        stdout: process.stdout,
        stderr: process.stderr,
      })
    }
    await plugins.telegram(project)
  } catch (error) {
    await plugins.telegram(project, true)
  }

  res.sendStatus(200)
})

server.listen(port, async () => {
  console.log(`gitpullr running on port ${config.hookPort} and path ${config.hookPath}`)

  if (config.hookAddr) {
    console.log("performing self-check")

    const url = new URL(config.hookAddr)
    url.port = port
    url.pathname = pathname
    if (!url.pathname.endsWith("/")) url.pathname += "/"
    url.pathname += "ping"

    log("sending ping")
    try {
      await got.get(url)
      console.log("self-check passed")
    } catch (error) {
      console.log(`gitpullr is not reachable\n${error.name}:`, error.message)
    }
  }
})
