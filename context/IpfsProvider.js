import { useContext, createContext } from 'react'
import fileCrypto from '../lib/FileCrypto'
import ipfs from '../lib/IPFSClient'

const IpfsContext = createContext(null)
// University: QmPb5p1r5osHBksErtW6W6GUMn9SCC2Gc9dfLJvPWEhhbt

const IpfsProvider = (props) => {
  const value = {
    upload: props.upload || upload,
    download: props.download || download,
  }

  return (
    <IpfsContext.Provider value={value}>{props.children}</IpfsContext.Provider>
  )
}
export const useIpfs = () => useContext(IpfsContext)
export default IpfsProvider

const upload = async (
  publicKeyStringRecipient,
  privateKeyStringSender,
  data,
) => {
  if (typeof publicKeyStringRecipient !== 'string') {
    throw Error('recipient public key ist not a string!')
  }
  if (typeof privateKeyStringSender !== 'string') {
    throw Error('sender private key ist not a string!')
  }

  data['signature'] = await fileCrypto.sign(privateKeyStringSender, data)

  const serializedData = JSON.stringify(data)
  const encryptedData = await fileCrypto.encrypt(
    publicKeyStringRecipient,
    Buffer.from(serializedData),
  )
  const ipfsResponse = await ipfs.add(JSON.stringify(encryptedData))

  return ipfsResponse.path
}

const download = async (
  privateKeyStringRecipient,
  publicKeyStringSender,
  ipfsHash,
) => {
  if (typeof ipfsHash !== 'string') {
    throw Error('ipfs hash must be a string!')
  }

  const url = `https://ipfs.infura.io/ipfs/${ipfsHash}`
  const response = await fetch(url)
  const encryptedFile = await response.json()

  try {
    var decryptedFile = await fileCrypto.decrypt(
      privateKeyStringRecipient,
      encryptedFile,
    )

    var decryptedFileJson = JSON.parse(decryptedFile.toString())
    const signatureJson = decryptedFileJson.signature
    delete decryptedFileJson.signature

    if (
      await fileCrypto.verify(
        publicKeyStringSender,
        decryptedFileJson,
        signatureJson.data,
      )
    ) {
      return decryptedFileJson
    }
    throw Error('invalid signature of document')
  } catch (err) {
    if (err.message === 'Bad MAC') {
      throw new Error("You're not permitted to access this file")
    } else {
      throw err
    }
  }
}
