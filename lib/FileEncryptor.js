var eccrypto = require('eccrypto')
var ethUtil = require('ethereumjs-util')

class FileEncryptor {
  encrypt(publicKeyString, fileBuffer) {
    if (!(fileBuffer instanceof Buffer)) {
      throw Error('file is not a buffer!')
    }
    var publicKeyBuffer = ethUtil.toBuffer(publicKeyString)

    return eccrypto.encrypt(publicKeyBuffer, fileBuffer)
  }

  decrypt(privateKeyString, encryptedFileJson) {
    var privateKeyBuffer = ethUtil.toBuffer(privateKeyString)

    return eccrypto.decrypt(
      privateKeyBuffer,
      this.buildEncryptedFileBufferFromJson(encryptedFileJson),
    )
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

const fileEncryptor = new FileEncryptor()

export default fileEncryptor
