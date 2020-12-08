/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import FolderSharedIcon from '@material-ui/icons/FolderShared'
import ListItem from '@material-ui/core/ListItem'
import Link from 'next/link'

const ApplicantRoutes = () => {
  return (
    <>
      <Link href='/applicant/cv' passHref>
        <ListItem button>
          <ListItemIcon>
            <NoteAddIcon />
          </ListItemIcon>
          <ListItemText primary='Lebenslauf erstellen' />
        </ListItem>
      </Link>
      <Link href='/applicant/shared' passHref>
        <ListItem button>
          <ListItemIcon>
            <FolderSharedIcon />
          </ListItemIcon>
          <ListItemText primary='Geteilte Lebensläufe' />
        </ListItem>
      </Link>
    </>
  )
}

export default ApplicantRoutes
