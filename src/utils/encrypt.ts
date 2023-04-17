import CryptoJS from 'crypto-js'

export function encrypt(key, text) {
  const encrypted = CryptoJS.AES.encrypt(text, key)
  return encrypted.toString()
}

export function decrypt(key, text) {
  const decrypted = CryptoJS.AES.decrypt(text, key)
  return decrypted.toString(CryptoJS.enc.Utf8)
}
