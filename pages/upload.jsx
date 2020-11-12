import React, { useEffect, useState } from 'react'
import Box from '@material-ui/core/Box'

import { Typography } from '@material-ui/core'
import ipfs from '../lib/IPFSClient'
import { useAccount } from '../context/AccountProvider'

const Upload = () => {
  const [buffer, setBuffer] = useState(null)
  const [lastUploadedDocumentHash, setLastUploadedDocumentHash] = useState('')
  const { account, contract } = useAccount()

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

  // const uploadedDocumentHash = await newContract.methods.get().call()
  // setLastUploadedDocumentHash(uploadedDocumentHash)

  // Example hash: QmSAdbek1DDb91BM8no29LeRxapusH72pmMZWs8zokGt6p
  // Example url: https://ipfs.infura.io/ipfs/QmSAdbek1DDb91BM8no29LeRxapusH72pmMZWs8zokGt6p
  const onSubmit = (event) => {
    event.preventDefault()
    if (buffer) {
      ipfs.add(buffer).then((response) => {
        setLastUploadedDocumentHash(response.path)
        contract.methods
          .set(lastUploadedDocumentHash)
          .send({
            from: account,
          })
          .then((response) => {
            setLastUploadedDocumentHash(lastUploadedDocumentHash)
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
      {lastUploadedDocumentHash ? (
        <a href={`https://ipfs.infura.io/ipfs/${lastUploadedDocumentHash}`}>
          Link to last uploaded file
        </a>
      ) : (
        <></>
      )}
      <br />
      {account ? (
        <>
          <Typography>Connected account:</Typography>
          <Typography>{account}</Typography>
        </>
      ) : (
        <></>
      )}
    </Box>
  )
}

export default Upload
