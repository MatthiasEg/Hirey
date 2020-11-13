import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import ipfs from '../lib/IPFSClient'
import { useUser } from '../context/UserProvider'
import { useContract } from '../context/ContractProvider'

const Upload = () => {
  const [buffer, setBuffer] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [hash, setHash] = useState('')
  const [uploadSuccessful, setUploadSuccessful] = useState(false)
  const { user } = useUser()
  const { contract } = useContract()

  const captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    if (!file) return
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setBuffer(Buffer.from(reader.result))
    }
  }

  // Example hash: QmSAdbek1DDb91BM8no29LeRxapusH72pmMZWs8zokGt6p
  // Example url: https://ipfs.infura.io/ipfs/QmSAdbek1DDb91BM8no29LeRxapusH72pmMZWs8zokGt6p
  const onSubmit = (event) => {
    event.preventDefault()
    if (buffer) {
      ipfs.add(buffer).then((response) => {
        setHash(response.path)
        contract.methods
          .set(response.path)
          .send({
            from: user.address,
          })
          .then(() => {
            setUploadSuccessful(true)
          })
      })
    }
  }

  return (
    <Box component='div'>
      <h1>Upload</h1>
      <form onSubmit={onSubmit}>
        <input type='file' onChange={captureFile} />
        <input type='submit' />
      </form>
      {uploadSuccessful ? (
        <Typography>Upload was successful!</Typography>
      ) : (
        <></>
      )}
    </Box>
  )
}

export default Upload
