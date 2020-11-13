/* eslint-disable no-alert */
// eslint-disable-next-line no-unused-vars
import Web3 from 'web3'
import React, { useContext, useEffect, createContext, useState } from 'react'
import HireyStore from '../build/Document.json'

const ContractContext = createContext(null)

const ContractProvider = ({ children }) => {
  const [contract, setContract] = useState(null)

  const loadContract = async () => {
    const { web3 } = window
    if (web3.eth.net) {
      const networkId = await web3.eth.net.getId()
      const networkData = HireyStore.networks[networkId]
      if (networkData) {
        const newContract = new web3.eth.Contract(
          HireyStore.abi,
          networkData.address,
        )
        setContract(newContract)
      } else {
        window.alert('Smart contract not deployed to detected network.')
      }
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadContract()
    })()
  }, [])

  return (
    <ContractContext.Provider value={{ contract }}>
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = () => useContext(ContractContext)

export default ContractProvider
