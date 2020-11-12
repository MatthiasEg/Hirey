import React, { useEffect, useState } from 'react'
import Box from '@material-ui/core/Box'
import { Document, Page, pdfjs } from 'react-pdf'

import { Typography } from '@material-ui/core'
import { useAccount } from '../context/AccountProvider'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const Load = () => {
  const { contract } = useAccount()
  const [hash, setHash] = useState('')
  const [numberOfPages, setNumberOfPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)

  const loadHash = async () => {
    console.log(contract)
    if (contract) {
      const uploadedDocumentHash = await contract.methods.get().call()
      console.log(uploadedDocumentHash)
      setHash(uploadedDocumentHash)
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumberOfPages(numPages)
  }

  useEffect(() => {
    ;(async () => {
      await loadHash()
    })()
  }, [contract])

  return (
    <Box component='div'>
      <h1>Load from blockchain</h1>
      <Typography variant='body1'>Hash: {hash}</Typography>
      <div>
        {hash ? (
          <>
            <Document
              file={`https://ipfs.infura.io/ipfs/${hash}`}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} />
            </Document>
            <p>
              Page {pageNumber} of {numberOfPages}
            </p>
          </>
        ) : (
          <></>
        )}
      </div>
    </Box>
  )
}

export default Load
