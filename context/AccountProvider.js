/* eslint-disable no-alert */
import React, { useContext, useEffect, createContext, useState } from 'react'
import Web3 from 'web3'
import Document from '../build/Document.json'

const AccountContext = createContext(null)

const AccountProvider = ({ children }) => {
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState('')

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

  const loadAccount = async () => {
    const { web3 } = window
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  // 1. Get the account
  // 2. Get the network
  // 3. Get Smart contract (we need ABI & adress)
  // 4. Get Document Hash
  const loadContract = async () => {
    const { web3 } = window
    const networkId = await web3.eth.net.getId()
    const networkData = Document.networks[networkId]
    if (networkData) {
      const newContract = new web3.eth.Contract(
        Document.abi,
        networkData.address,
      )
      setContract(newContract)
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadWeb3()
      await loadAccount()
      await loadContract()
    })()
  }, [])

  return (
    <AccountContext.Provider value={{ account, contract }}>
      {children}
    </AccountContext.Provider>
  )
}

export const useAccount = () => useContext(AccountContext)

export default AccountProvider
