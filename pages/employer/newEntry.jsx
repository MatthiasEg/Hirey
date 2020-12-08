/* eslint-disable max-len */
import DateFnsUtils from '@date-io/date-fns'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import CheckIcon from '@material-ui/icons/Check'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Snackbar from '@material-ui/core/Snackbar'
import TextField from '@material-ui/core/TextField'
import MuiAlert from '@material-ui/lab/Alert'
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers'
import 'date-fns'
import React, { useState } from 'react'
import { useContract } from '../../context/ContractProvider'
import { useIpfs } from '../../context/IpfsProvider'
import { useUser } from '../../context/UserProvider'

function Alert(props) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const NewEntry = () => {
  const { user, allUsers } = useUser()
  const { contract } = useContract()
  const ipfs = useIpfs()

  // States
  const [isSaving, setIsSaving] = useState(false)
  const [uploadSuccessful, setUploadSuccessful] = useState(false)
  const [workType, setWorkType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('Prima Produkte AG')
  const [FromDate, setFromDate] = useState(new Date())
  const [ToDate, setToDate] = useState(new Date())
  const [publishDate, setPublishDate] = useState(new Date())
  const [documentBuffer, setDocumentBuffer] = useState(undefined)
  const [recipient, setRecipient] = useState(undefined)
  const [filename, setFilename] = useState('')

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value)
  }

  const captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    if (!file) return
    setFilename(file.name)
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setDocumentBuffer(Buffer.from(reader.result))
    }
  }

  const deleteDocument = () => {
    setDocumentBuffer(undefined)
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setUploadSuccessful(false)
  }

  const resetForm = () => {
    setWorkType('')
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
      title,
      description,
      autor: author,
      from: FromDate,
      to: ToDate,
      publishDate,
      document: documentBuffer,
    }

    const ipfsHash = await ipfs.upload(
      recipient.publicKey,
      user.privateKey,
      educationData,
    )
    console.log(`IPFS hash from upload: ${ipfsHash}`)

    await contract.methods.storeCvRecordFor(recipient.address, ipfsHash).send({
      from: user.address,
    })
    setIsSaving(false)
    setUploadSuccessful(true)
    resetForm()
  }

  return (
    <form onSubmit={onSubmit}>
      <Grid
        container
        justify='center'
        alignItems='center'
        alignContent='center'
        direction='column'
        spacing={6}
      >
        <Grid item xs={12}>
          <Typography variant='h4'>Arbeitsverhältnis eintragen</Typography>
        </Grid>
        <Grid item>
          <Grid
            container
            justify='center'
            alignItems='center'
            alignContent='center'
            spacing={3}
          >
            <Grid item xs={12} md={6}>
              <InputLabel>Angestellte/-r</InputLabel>
              <Select
                required
                fullWidth
                value={recipient || ''}
                onChange={handleRecipientChange}
              >
                {allUsers
                  .filter((u) => u.type === 'applicant')
                  .map((userObject) => (
                    <MenuItem key={userObject.address} value={userObject}>
                      {userObject.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <InputLabel>Arbeitsverh&auml;ltnis</InputLabel>
              <Select
                required
                fullWidth
                value={workType || ''}
                onChange={(event) => setWorkType(event.target.value)}
              >
                <MenuItem value='Vollzeit'>Vollzeit</MenuItem>
                <MenuItem value='Teilzeit'>Teilzeit</MenuItem>
                <MenuItem value='Stundenlohn'>Stundenlohn</MenuItem>
                <MenuItem value='Praktikum'>Praktikum</MenuItem>
                <MenuItem value='Lehre'>Lehre</MenuItem>
                <MenuItem value='Externer Mitarbeiter'>
                  Externer Mitarbeiter
                </MenuItem>
              </Select>
              {/* <TextField required id="standard-required1" label="Ausbildungstyp" fullWidth value={educationType} onChange={event => setEducationType(event.target.value)} /> */}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                id='standard-required2'
                label='Titel'
                fullWidth
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                disabled
                label='Autor'
                fullWidth
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Beschreibung (mehrere Zeilen m&ouml;glich)'
                multiline
                fullWidth
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  margin='normal'
                  label='Anstellungsdatum'
                  format='dd.MM.yyyy'
                  value={FromDate}
                  onChange={setFromDate}
                  fullWidth
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  margin='normal'
                  label='Entlassungsdatum'
                  format='dd.MM.yyyy'
                  value={ToDate}
                  onChange={setToDate}
                  fullWidth
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  margin='normal'
                  label='Publizierungsdatum'
                  format='dd.MM.yyyy'
                  value={publishDate}
                  onChange={setPublishDate}
                  fullWidth
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12}>
              <Grid container justify='space-between'>
                <Grid item>
                  {documentBuffer ? (
                    <Chip
                      color='secondary'
                      label={filename}
                      onDelete={deleteDocument}
                      icon={<CheckIcon />}
                    />
                  ) : (
                    <label htmlFor='upload-photo'>
                      <input
                        style={{ display: 'none' }}
                        id='upload-photo'
                        name='upload-photo'
                        required
                        type='file'
                        onChange={captureFile}
                      />
                      <Button
                        color='secondary'
                        variant='contained'
                        component='span'
                      >
                        Dokument hinzufügen
                      </Button>
                    </label>
                  )}
                </Grid>
                <Grid item>
                  <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={isSaving}
                  >
                    Hochladen & Ausstellen
                  </Button>
                  {isSaving ? (
                    <CircularProgress
                      style={{ marginLeft: '12px' }}
                      color='secondary'
                    />
                  ) : (
                    <></>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Snackbar
        open={uploadSuccessful}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity='success'>
          Dokument erfolgreich hochgeladen!
        </Alert>
      </Snackbar>
    </form>
  )
}

export default NewEntry
