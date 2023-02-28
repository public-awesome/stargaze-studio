/* eslint-disable eslint-comments/disable-enable-pair */

import * as crypto from 'crypto'
import { Word32Array } from 'jscrypto'
import { SHA256 } from 'jscrypto/SHA256'
import * as secp256k1 from 'secp256k1'

export function sha256(data: Buffer): Buffer {
  return Buffer.from(SHA256.hash(new Word32Array(data)).toUint8Array())
}

export function generateSignature(id: number, owner: string, privateKey: string) {
  try {
    const message = `claim badge ${id} for user ${owner}`

    const privKey = Buffer.from(privateKey, 'hex')
    // const pubKey = Buffer.from(secp256k1.publicKeyCreate(privKey, true))
    const msgBytes = Buffer.from(message, 'utf8')
    const msgHashBytes = sha256(msgBytes)
    const signedMessage = secp256k1.ecdsaSign(msgHashBytes, privKey)
    return Buffer.from(signedMessage.signature).toString('hex')
  } catch (e) {
    console.log(e)
    return ''
  }
}

export function generateKeyPairs(amount: number) {
  const keyPairs: { publicKey: string; privateKey: string }[] = []
  for (let i = 0; i < amount; i++) {
    let privKey: Buffer
    do {
      privKey = crypto.randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))

    const privateKey = privKey.toString('hex')
    const publicKey = Buffer.from(secp256k1.publicKeyCreate(privKey)).toString('hex')
    keyPairs.push({
      publicKey,
      privateKey,
    })
  }
  return keyPairs
}
