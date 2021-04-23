import type { Config } from "$/Config"

import debug from "debug"
import { read } from "fs-jetpack"
import { join } from "path"
import express from "express"
import execa from "execa"
import { payload } from "./util"
import secret from "./secret"

const log = debug("gitpullr")

const config: Config = read(join(__dirname, "../config.json"), "json")

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.post(config.hookPath, async (req, res) => {
  const body = payload(req.body)

  const project = config.projects.find(p => p.name === body.repository.full_name)

  if (!project) return res.sendStatus(404)
  if (!secret(project.secret, req)) return res.sendStatus(401)

  const reg = new RegExp(project.filter)
  if (reg.test(body.head_commit.message)) return res.status(200).send("filter flag detected")

  console.log(`new request for project ${project.name}`)

  for (const command of project.exec) {
    await execa.command(command, {
      cwd: project.path,
      stdout: process.stdout,
      stderr: process.stderr,
    })
  }

  res.sendStatus(200)
})

server.listen(config.hookPort, () => {
  console.log(`gitpullr running on port ${config.hookPort} and path ${config.hookPath}`)
})
