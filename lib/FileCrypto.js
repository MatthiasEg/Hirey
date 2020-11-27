var crypto = require("crypto");
var eccrypto = require('eccrypto')
var ethUtil = require('ethereumjs-util')

class FileCrypto {
  encrypt(publicKeyString, fileBuffer) {
    if (!(fileBuffer instanceof Buffer)) {
      throw Error('file is not a buffer!')
    }
    const publicKeyBuffer = ethUtil.toBuffer(publicKeyString)

    return eccrypto.encrypt(publicKeyBuffer, fileBuffer)
  }

  decrypt(privateKeyString, encryptedFileJson) {
    const privateKeyBuffer = ethUtil.toBuffer(privateKeyString)

    return eccrypto.decrypt(
      privateKeyBuffer,
      this.buildEncryptedFileBufferFromJson(encryptedFileJson),
    )
  }

  sign(privateKeyString, data) {
    const dataToHash = JSON.stringify(data)
    const dataHashDigest = crypto.createHash('sha256').update(dataToHash).digest()
    const privateKeyBuffer = ethUtil.toBuffer(privateKeyString)

    return eccrypto.sign(privateKeyBuffer, dataHashDigest)
  }

  verify(publicKeyString, dataToVerify, signatureData) {
    if (typeof publicKeyString !== 'string') {
      throw Error('public key ist not a string!')
    }
    if (!(signatureData instanceof Array)) {
      throw Error('signature is not an array')
    }

    const dataJsonString = JSON.stringify(dataToVerify)
    const dataHashDigest = crypto.createHash('sha256').update(dataJsonString).digest()
    const publicKeyBuffer = ethUtil.toBuffer(publicKeyString)
    const signatureBuffer = Buffer.from(Uint8Array.from(signatureData))

    try {
      await eccrypto.verify(publicKeyBuffer, dataHashDigest, signatureBuffer)
      return true
    } catch {
      return false
    }
  }

  buildEncryptedFileBufferFromJson(encryptedFileJson) {
    var encryptedFileBuffer = {}
    encryptedFileBuffer.iv = Buffer.from(
      Uint8Array.from(encryptedFileJson.iv.data),
    )
    encryptedFileBuffer.ephemPublicKey = Buffer.from(
      Uint8Array.from(encryptedFileJson.ephemPublicKey.data),
    )
    encryptedFileBuffer.ciphertext = Buffer.from(
      Uint8Array.from(encryptedFileJson.ciphertext.data),
    )
    encryptedFileBuffer.mac = Buffer.from(
      Uint8Array.from(encryptedFileJson.mac.data),
    )

    return encryptedFileBuffer
  }
}

const fileCrypto = new FileCrypto()

export default fileCrypto
