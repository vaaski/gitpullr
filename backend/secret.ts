import { ParameterizedContext, Next } from "koa"
import log, { Logger } from "./log"

import { handleXWwwForm } from "./utils"
import crypto from "crypto"

const sigHeaderName = "X-Hub-Signature"

interface SecretConfig {
  logger?: Logger
  secret: string
}

export default ({ logger = log(), secret }: SecretConfig) => (
  ctx: ParameterizedContext,
  next: Next,
) => {
  const { warn, info, debug } = logger
  const payload = JSON.stringify(handleXWwwForm(ctx.request.body))
  if (!payload) {
    return warn("Request body empty")
  }

  debug("payload:", payload)

  const sig = ctx.request.get(sigHeaderName) || ""
  const hmac = crypto.createHmac("sha1", secret)
  const digest = Buffer.from(
    "sha1=" + hmac.update(payload).digest("hex"),
    "utf8",
  )
  const checksum = Buffer.from(sig, "utf8")
  const lengthMismatch = checksum.length !== digest.length
  const unequal = !crypto.timingSafeEqual(digest, checksum)

  if (lengthMismatch || unequal) {
    info(
      `Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`,
    )
    ctx.throw(401, "wrong secret")
  }
  return next()
}
