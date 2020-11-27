import DateFnsUtils from '@date-io/date-fns';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import MuiAlert from '@material-ui/lab/Alert';
import {
  KeyboardDatePicker, MuiPickersUtilsProvider
} from '@material-ui/pickers';
import 'date-fns';
import React, { useState } from 'react';
import { useContract } from '../../context/ContractProvider';
import { useIpfs } from '../../context/IpfsProvider';
import { useUser } from '../../context/UserProvider';
import styles from './newEntry.module.css';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const NewEntry = () => {
  const { user, allUsers } = useUser()
  const { contract } = useContract()
  const ipfs = useIpfs()

  // States
  const [isSaving, setIsSaving] = useState(false)
  const [uploadSuccessful, setUploadSuccessful] = useState(false)
  const [educationType, setEducationType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('Hochschule Luzern')
  const [publishDate, setPublishDate] = useState(new Date())
  const [documentBuffer, setDocumentBuffer] = useState(undefined)
  const [recipient, setRecipient] = useState(undefined)

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value);
  };

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setUploadSuccessful(false);
  };

  const resetForm = () => {
    setEducationType('')
    setTitle('')
    setDescription('')
    setPublishDate(new Date())
    setDocumentBuffer(undefined)
    setRecipient(undefined)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    const educationData = {
      type: educationType,
      title: title,
      description: description,
      autor: author,
      publishDate: publishDate,
      document: documentBuffer,
    };

    const ipfsHash = await ipfs.upload(recipient.publicKey, user.privateKey, educationData)
    console.log(`IPFS hash from upload: ${ipfsHash}`)
    
    await contract.methods
        .storeCvRecordFor(recipient.address, ipfsHash)
        .send({
          from: user.address,
        })
    setIsSaving(false)
    setUploadSuccessful(true)
    resetForm()
  }

  const buttonLoadingStyle = {
    display: 'flex',
    alignItems: 'center'
  }

  return (
    <Box component='div'>
      <h1>University Upload Page</h1>
      <h3>Information</h3>
      <form onSubmit={onSubmit} className={styles.formcontainer}>
        <FormControl fullWidth={true}>
          <InputLabel>Bewerber/-in</InputLabel>
          <Select
              required
              value={recipient || ''}
              onChange={handleRecipientChange}>
                {allUsers.filter(u => u.type == 'applicant').map(user => <MenuItem key={user.address} value={user}>{user.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField required id="standard-required1" label="Ausbildungstyp" fullWidth value={educationType} onChange={event => setEducationType(event.target.value)} />
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField required id="standard-required2" label="Titel" fullWidth value={title} onChange={event => setTitle(event.target.value)}  />
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField id="standard-basic1" label="Beschreibung" fullWidth value={description} onChange={event => setDescription(event.target.value)}  />
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField disabled id="standard-disabled1" label="Autor" fullWidth value={author} onChange={event => setAuthor(event.target.value)}  />
        </FormControl>
        <FormControl fullWidth={true}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker margin='normal' label='Publizierungsdatum' format='dd.MM.yyyy' value={publishDate} onChange={setPublishDate} fullWidth/>
          </MuiPickersUtilsProvider>
        </FormControl>
        <div>
        <h4>Certificate</h4>
          <input required type='file' onChange={captureFile} />
        </div>
        <br />
        <div style={buttonLoadingStyle}>
          <Button variant="contained" color="primary" type="submit" disabled={isSaving}>
              Speichern
          </Button>
          {isSaving ? (
              <CircularProgress style={{ marginLeft: '12px' }} color="secondary" />
              ) : (
              <></>
            )}
          </div>
      </form>
      <Snackbar open={uploadSuccessful} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success">
        Dokument erfolgreich hochgeladen!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default NewEntry
