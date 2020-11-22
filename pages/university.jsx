import React from 'react'
// imports for TextFields
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField';
//imports for upload (unused atm)
import { useState } from 'react'
import ipfs from '../lib/IPFSClient'
import { useUser } from '../context/UserProvider'
import { useContract } from '../context/ContractProvider'

const University = () => {

  // States from Upload?
  const [buffer, setBuffer] = useState(null)
  const [hash, setHash] = useState('')
  const [uploadSuccessful, setUploadSuccessful] = useState(false)
  const { user } = useUser()
  const { contract } = useContract()

  // States 
  const [edu, setEdu] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [author, setAuthor] = useState('Hochschule Luzern')
  const [date, setDate] = useState('')
  const [doc, setDoc] = useState('')

  {/*
  const captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    if (!file) return
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      reader.readAsDataURL(file)
    //setBuffer(Buffer.from(reader.result))
    }
    console.log(file)
  }
  */}

  const captureFile = (event) => {
    event.preventDefault()
    let selectedFile = event.target.files;
    let file = null;
    let fileName = "";

    //Check File is not Empty
    if (selectedFile.length > 0) {
        // Select the very first file from list
        let fileToLoad = selectedFile[0];
        fileName = fileToLoad.name;
        // FileReader function for read the file.
        let fileReader = new FileReader();
        // Onload of file read the file content
        fileReader.onload = function(fileLoadedEvent) {
            file = fileLoadedEvent.target.result;
            // Print data in console
            //console.log(file);
            setDoc(file)
        };
        // Convert data to base64
        fileReader.readAsDataURL(fileToLoad);
        console.log(doc)
    }
  }

  // Anpassen für JSON
  const onSubmit = (event) => {
    event.preventDefault()
    JSON.stringify({
      "type": edu,
      "title": title,
      "description": desc,
      "autor": author,
      "publishDate": date,
      "documents": doc
    })
  }

  return (
    <Box component='div'>
      <h1>University</h1>
      <h3>Information</h3>
      <form onSubmit={onSubmit}>
        <TextField required id="standard-required1" label="Ausbildungstyp" fullWidth value={edu} onChange={event => setEdu(event.target.value)} />
        &nbsp;
        <TextField required id="standard-required2" label="Titel" fullWidth value={title} onChange={event => setTitle(event.target.value)}  />
        &nbsp;
        <TextField id="standard-basic1" label="Beschreibung" fullWidth value={desc} onChange={event => setDesc(event.target.value)}  />
        &nbsp;
        <TextField disabled id="standard-disabled1" label="Autor" fullWidth value={author} onChange={event => setAuthor(event.target.value)}  />
        &nbsp;
        <TextField required id="standard-required3" label="Publizierungsdatum" fullWidth value={date} onChange={event => setDate(event.target.value)}  />
        &nbsp;&nbsp;
        <h3>Certificate</h3>
        {/* <input required id="input1" type='file' onChange={captureFile}/> */}
        <input id="input1" type='file' onChange={captureFile}/>
        &nbsp;&nbsp;
        <h2>Upload</h2>
        <input type='submit' value='Auf zur Blockchain' />
    </form>
    {uploadSuccessful ? (
        <Typography>Upload was successful!</Typography>
      ) : (
        <></>
      )}
  </Box>
  )
  
}

export default University
