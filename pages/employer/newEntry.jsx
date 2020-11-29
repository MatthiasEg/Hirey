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
import Grid from '@material-ui/core/Grid';

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
  const [workType, setworkType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('Prima Produkte AG')
  const [FromDate, setFromDate] = useState(new Date())
  const [ToDate, setToDate] = useState(new Date())
  const [publishDate, setPublishDate] = useState(new Date())
  const [documentBuffer, setDocumentBuffer] = useState(undefined)
  const [recipient, setRecipient] = useState(undefined)

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value);
  };

  const captureFile = (event) => {
    event.preventDefault()
    //const file = event.target.files
    const file = event.target.files[0]
    const reader = new window.FileReader()
    // const reader = new FileReader()
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
    setworkType('')
    setTitle('')
    setDescription('')
    setFromDate(new Date())
    setToDate(new Date())
    setPublishDate(new Date())
    setDocumentBuffer(undefined)
    setRecipient(undefined)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    const educationData = {
      type: workType,
      title: title,
      description: description,
      autor: author,
      from: FromDate,
      to: ToDate,
      publishDate: publishDate,
      document: documentBuffer,
    };
    // console output
    console.log(educationData);

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
      <h1>Employer Upload Page</h1>
      <h3>Informationen</h3>
      <form onSubmit={onSubmit} className={styles.formcontainer}>
        <FormControl fullWidth={true}>
          <InputLabel>Angestellte/-r</InputLabel>
          <Select
              required
              value={recipient || ''}
              onChange={handleRecipientChange}>
                {allUsers.filter(u => u.type == 'applicant').map(user => <MenuItem key={user.address} value={user}>{user.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth={true}>
          <InputLabel>Arbeitsverh&auml;ltnis</InputLabel>
            <Select
              required
              value={workType || ''}
              onChange={event => setworkType(event.target.value)}
            >
              <MenuItem value="Lehre EBA">Vollzeit</MenuItem>
              <MenuItem value="Lehre EFZ">Teilzeit</MenuItem>
              <MenuItem value="Lehre Bachelor">Stundenlohn</MenuItem>
              <MenuItem value="Lehre Master">Praktikum</MenuItem>
              <MenuItem value="Lehre Weiterbildung">Lehre</MenuItem>
              <MenuItem value="Lehre Kurs">Externer Mitarbeiter</MenuItem>
            </Select>
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField required id="standard-required2" label="Titel" fullWidth value={title} onChange={event => setTitle(event.target.value)}  />
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField id="standard-basic1" label="Beschreibung (mehrere Zeilen m&ouml;glich)" multiline fullWidth value={description} onChange={event => setDescription(event.target.value)}  />
        </FormControl>
        <FormControl fullWidth={true}>
          <TextField disabled id="standard-disabled1" label="Autor" fullWidth value={author} onChange={event => setAuthor(event.target.value)}  />
        </FormControl>
        <Grid container direction="row" justify="space-between" alignItems="center">
          <FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker margin='normal' label='Anstellungsdatum' format='dd.MM.yyyy' value={FromDate} onChange={setFromDate} fullWidth/>
            </MuiPickersUtilsProvider>
          </FormControl>
          <FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker margin='normal' label='Entlassungsdatum' format='dd.MM.yyyy' value={ToDate} onChange={setToDate} fullWidth/>
            </MuiPickersUtilsProvider>
          </FormControl>
          <FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker margin='normal' label='Publizierungsdatum' format='dd.MM.yyyy' value={publishDate} onChange={setPublishDate} fullWidth/>
            </MuiPickersUtilsProvider>
          </FormControl>
        </Grid>
        <div>
        <h4>Arbeitszeugnis/-bescheinigung </h4>
          {/* <input required type='file' onChange={captureFile} /> */}
          <label htmlFor="upload-photo">
            <input style={{ display: 'none' }} id="upload-photo" name="upload-photo" required type="file" onChange={captureFile} />
          <Button color="secondary" variant="contained" component="span">
            Arbeitszeugnis oder -bescheinigung auswählen
          </Button>
          </label>
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
