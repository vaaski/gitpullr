import crypto from "crypto"

export const newSecret = () => crypto.randomBytes(16).toString("hex")

export default (secret: string) => ({
  encrypt: (text: string) => {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-ctr", secret, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return JSON.stringify({
      iv: iv.toString("hex"),
      c: encrypted.toString("hex"),
    })
  },
  decrypt: (hash: string) => {
    const { iv, c } = JSON.parse(hash)

    const decipher = crypto.createDecipheriv(
      "aes-256-ctr",
      secret,
      Buffer.from(iv, "hex"),
    )

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(c, "hex")),
      decipher.final(),
    ])

    return decrypted.toString()
  },
})
