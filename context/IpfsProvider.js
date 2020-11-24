import { useContext, createContext } from 'react'
import { useUser } from './UserProvider'
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

const upload = async (publicKeyString, data) => {
  if (typeof publicKeyString !== 'string') {
    throw Error('public key ist not a string!')
  }

  const serializedData = JSON.stringify(data)
  const encryptedData = await fileCrypto.encrypt(
    publicKeyString,
    Buffer.from(serializedData),
  )
  const ipfsResponse = await ipfs.add(JSON.stringify(encryptedData))

  return ipfsResponse.path
}


const download = async (privateKeyString, ipfsHash) => {
  if (typeof ipfsHash !== 'string') {
    throw Error('ipfs hash must be a string!')
  }

  const url = `https://ipfs.infura.io/ipfs/${ipfsHash}`
  const response = await fetch(url)
  const encryptedFile = await response.json()

  const decryptedFile = await fileCrypto.decrypt(
    privateKeyString,
    encryptedFile,
  )

  return JSON.parse(decryptedFile.toString())
}
