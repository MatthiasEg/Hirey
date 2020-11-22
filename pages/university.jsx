import React from 'react'

// imports for TextFields
import TextField from '@material-ui/core/TextField';

const University = () => {
  return (
    <form noValidate autoComplete="off">
    <div>
      <h1>University</h1>
      <h3>Information</h3>
      <TextField required id="standard-required" label="Ausbildungstyp" fullWidth defaultValue="Bachelor" />
      &nbsp;
      <TextField required id="standard-required" label="Titel" fullWidth defaultValue="Bachelor of Science / Informatik" />
      &nbsp;
      <TextField id="standard-basic" label="Beschreibung" fullWidth defaultValue="bla bli bla blup" />
      &nbsp;
      <TextField disabled id="standard-disabled" label="Autor" fullWidth defaultValue="Hochschule Luzern Informatik" />
      &nbsp;
      <TextField required id="standard-required" label="Publizierungsdatum" fullWidth defaultValue="01.01.1990" />
      
      &nbsp;&nbsp;
      
      <h3>Certificate</h3>
      <form>
        <input type='file' />
      </form>

      &nbsp;&nbsp;
      &nbsp;&nbsp;

      <h2>Upload</h2>
      <form>
        <input type='submit' value='Auf zur Blockchain' />
      </form>
  </div>
  </form>
  )

  
}

// "type": "ausbildung",
// "title": "bla",
// "description": "bla",
// "autor": "bla",
// "publishDate": "bla",
// "documents": ["filebuffer"]


export default University
