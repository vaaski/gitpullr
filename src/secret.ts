import crypto from "crypto"
import debug from "debug"
import { Request } from "express"
import { payload } from "./util"

const log = debug("gitpullr:secret")

const sigHeaderName = "X-Hub-Signature"

export default (secret: string, req: Request): boolean => {
  const sig = req.get(sigHeaderName) || ""
  const body = JSON.stringify(payload(req.body))

  try {
    const hmac = crypto.createHmac("sha1", secret)
    const digest = Buffer.from("sha1=" + hmac.update(body).digest("hex"), "utf8")
    const checksum = Buffer.from(sig, "utf8")
    const lengthMismatch = checksum.length !== digest.length
    const unequal = !crypto.timingSafeEqual(digest, checksum)

    if (lengthMismatch || unequal) {
      log(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
      return false
    }
  } catch (error) {
    log("an error occurred whilst trying to verify the signature, maybe its missing.")
    return false
  }

  log("signature verified successfully")
  return true
}
