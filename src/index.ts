import debug from "debug"
import express from "express"
import execa from "execa"
import { formatDuration, payload } from "./util"
import secret from "./secret"
import { telegram } from "../plugins"
import got from "got"

const log = debug("gitpullr")

import config from "../config"

const pathname = config.hookPath || "/"
const port = config.hookPort || "8088"

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.get(pathname, (_, res) => {
  log("received ping, sending pong")
  res.status(200).send("pong")
})

server.post(pathname, async (req, res) => {
  const body = payload(req.body)

  const project = config.projects.find(p => p.name === body.repository.full_name)

  if (!project) return res.sendStatus(404)
  if (project.secret && !secret(project.secret, req)) return res.sendStatus(401)

  if (body.zen) {
    console.log(`hook config works. Zen: ${body.zen}`)
    telegram.notify(project, telegram.strings.setupSuccess(body.zen))
    return res.status(200).send(body.zen)
  }

  if (!body.head_commit) return

  if (project.filter !== null) {
    const filter = project.filter ?? "\\[skip (?:backend|ci)\\]"
    const reg = new RegExp(filter)

    if (reg.test(body.head_commit.message)) {
      log("filter not passed")
      return res.status(200).send("filter flag detected")
    }
    log("filter passed")
  }

  if (project.branch !== null && body.ref) {
    const filter = project.branch ?? "^refs\\/heads\\/(?:main|master)$"
    const reg = new RegExp(filter)

    if (!reg.test(body.ref)) {
      log("branch not passed")
      return res.status(200).send("not the configured branch")
    }
    log("branch passed")
  }

  console.log(`new request for project ${project.name}`)

  res.sendStatus(200)

  const start = Date.now()
  try {
    for (const command of project.exec) {
      await execa.command(command, {
        cwd: project.path,
        stdout: process.stdout,
        stderr: process.stderr,
      })
    }

    let additional = `in ${formatDuration(Date.now() - start)}`
    const commits = body.commits?.map(c => c.message).join("\n\n")
    additional += `\n\n${commits}`

    await telegram.notify(project, telegram.strings.success(additional))
  } catch (error) {
    await telegram.notify(project, telegram.strings.fail())
  }
})

server.listen(port, async () => {
  console.log(`gitpullr running on port ${config.hookPort} and path ${config.hookPath}`)

  if (config.hookAddr) {
    console.log("performing self-check")

    log("sending ping")
    try {
      await got.get(config.hookAddr)
      console.log("self-check passed")
    } catch (error) {
      console.log(`gitpullr is not reachable\n${error.name}:`, error.message)
    }
  }
})
