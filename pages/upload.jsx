import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import ipfs from '../lib/IPFSClient'

const Upload = () => {
  const [buffer, setBuffer] = useState(null)
  const [lastUploadedDocumentHash, setLastUploadedDocumentHash] = useState('')

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
        console.log('ipfs result: ', response.path)
        setLastUploadedDocumentHash(response.path)
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
    </Box>
  )
}

export default Upload
