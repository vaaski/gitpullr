import express from "express"
import execa from "execa"
import { payload } from "./util"
import secret from "./secret"

import config from "../config"

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.post(config.hookPath, async (req, res) => {
  const body = payload(req.body)

  const project = config.projects.find(p => p.name === body.repository.full_name)

  if (!project) return res.sendStatus(404)
  if (project.secret && !secret(project.secret, req)) return res.sendStatus(401)

  if (project.filter) {
    const reg = new RegExp(project.filter)
    if (reg.test(body.head_commit.message)) return res.status(200).send("filter flag detected")
  }

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
