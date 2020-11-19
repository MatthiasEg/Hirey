import React, { useContext, useEffect, createContext, useState } from 'react'
import { useUser } from './UserProvider'

const UploadContext = createContext(null)

const UploadProvider = ({ children }) => {
//   const [contract, setContract] = useState(null)
  const { user } = useUser()

  

  useEffect(() => {
    ;(async () => {
    
    })()
  }, [user])

  return (
    <UploadContext.Provider value={{ }}>
      {children}
    </UploadContext.Provider>
  )
}

export const useUpload = () => useContext(UploadContext)

export default UploadProvider
