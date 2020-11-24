import DateFnsUtils from '@date-io/date-fns'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import {
  KeyboardDatePicker, MuiPickersUtilsProvider
} from '@material-ui/pickers'
import 'date-fns'
import React, { useState } from 'react'
import { useIpfs } from '../../context/IpfsProvider'
import { useUser } from '../../context/UserProvider'
import styles from './newEntry.module.css'

const NewEntry = () => {
  const { user, allUsers } = useUser()
  const ipfs = useIpfs()

  // States
  const [uploadSuccessful, setUploadSuccessful] = useState(false)
  const [educationType, setEducationType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('Hochschule Luzern')
  const [publishDate, setPublishDate] = useState(new Date())
  const [documentBuffer, setDocumentBuffer] = useState(null)

  const captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new FileReader()
    if (!file) return
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setDocumentBuffer(Buffer.from(reader.result))
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const educationData = {
      type: educationType,
      title: title,
      description: description,
      autor: author,
      publishDate: publishDate,
      document: documentBuffer,
    };

    // temporär bis user ausgewählt werden kann
    const applicantPublicKey = allUsers[0].publicKey
    const ipfsHash = await ipfs.upload(applicantPublicKey, educationData)
    console.log(ipfsHash)
    alert(`ipfs hash from uploaded document: ${ipfsHash}`)
  }

  return (
    <Box component='div'>
      <h1>University Upload Page</h1>
      <h3>Information</h3>
      <form onSubmit={onSubmit} className={styles.formcontainer}>
        <TextField required id="standard-required1" label="Ausbildungstyp" fullWidth value={educationType} onChange={event => setEducationType(event.target.value)} />
        <TextField required id="standard-required2" label="Titel" fullWidth value={title} onChange={event => setTitle(event.target.value)}  />
        <TextField id="standard-basic1" label="Beschreibung" fullWidth value={description} onChange={event => setDescription(event.target.value)}  />
        <TextField disabled id="standard-disabled1" label="Autor" fullWidth value={author} onChange={event => setAuthor(event.target.value)}  />
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker margin='normal' label='Publizierungsdatum' format='dd.MM.yyyy' value={publishDate} onChange={setPublishDate} fullWidth/>
        </MuiPickersUtilsProvider>
        <div>
        <h4>Certificate</h4>
          <input required type='file' onChange={captureFile} />
        </div>
        <br />
        <Button variant="contained" color="primary" type="submit">Save</Button>
      </form>
      {uploadSuccessful ? (
        <Typography>Upload was successful!</Typography>
      ) : (
        <></>
      )}
    </Box>
  )
}

export default NewEntry
