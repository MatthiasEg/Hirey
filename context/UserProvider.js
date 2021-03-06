/* eslint-disable no-alert */
import React, { useContext, useEffect, createContext, useState } from 'react'
import Web3 from 'web3'
import { useRouter } from 'next/router'
import users from '../lib/Users'

const UserContext = createContext(null)

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const router = useRouter()

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
    setCurrentUser(
      users.filter((user) => {
        return user.address === accounts[0]
      })[0],
    )
  }

  useEffect(() => {
    ;(async () => {
      setAllUsers(users)
      await loadWeb3()
      await loadAccount()
      // setup listener for accounts change
      window.ethereum.on('accountsChanged', async () => {
        await loadAccount()
        router.replace('/')
      })
    })()
  }, [])

  return (
    <UserContext.Provider value={{ user: currentUser, allUsers }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export default UserProvider
