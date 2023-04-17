import aesjs from 'aes-js'

export function encrypt(key: string, text: string) {
  // eslint-disable-next-line new-cap
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(key))
  const encryptedBytes = aesCtr.encrypt(aesjs.utils.utf8.toBytes(text))
  return aesjs.utils.hex.fromBytes(encryptedBytes)
}

export function decrypt(key: string, text: string) {
  // eslint-disable-next-line new-cap
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(key))
  const decryptedBytes = aesCtr.decrypt(aesjs.utils.hex.toBytes(text))
  return aesjs.utils.utf8.fromBytes(decryptedBytes)
}
