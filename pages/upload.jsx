import React, { useEffect, useState } from 'react'
import Box from '@material-ui/core/Box'
import Web3 from 'web3'
import { Typography } from '@material-ui/core'
import ipfs from '../lib/IPFSClient'
import Document from '../abis/Document.json'

const Upload = () => {
  const [buffer, setBuffer] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState('')
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

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      )
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

  // 1. Get the account
  // 2. Get the network
  // 3. Get Smart contract (we need ABI & adress)
  // 4. Get Document Hash
  const loadBlockchainData = async () => {
    const { web3 } = window
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
    const networkId = await web3.eth.net.getId()
    const networkData = Document.networks[networkId]
    if (networkData) {
      const newContract = new web3.eth.Contract(
        Document.abi,
        networkData.address,
      )
      setContract(newContract)
      const uploadedDocumentHash = await newContract.methods.get().call()
      setLastUploadedDocumentHash(uploadedDocumentHash)
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadWeb3()
      await loadBlockchainData()
    })()
  }, [])

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
