#!/usr/bin/env node

import minimist from "minimist"
import process from "process"

const argv = minimist(process.argv.slice(2), {
  default: {
    port: 8069,
    config: "gitpullr.config.js",
  },
})

console.log(argv, process.cwd())
