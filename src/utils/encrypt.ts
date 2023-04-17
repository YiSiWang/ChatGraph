import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

export function encrypt(key, text) {
  const encrypted = AES.encrypt(text, key)
  return encrypted.toString()
}

export function decrypt(key, text) {
  const decrypted = AES.decrypt(text, key)
  return decrypted.toString(Utf8)
}
