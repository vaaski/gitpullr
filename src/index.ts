import { read } from "fs-jetpack"
import { join } from "path"
import type { Config } from "../types/config"

const config: Config = read(join(__dirname, "../config.json"), "json")

console.log(config)
