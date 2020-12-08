/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import FolderSharedIcon from '@material-ui/icons/FolderShared'
import ListItem from '@material-ui/core/ListItem'
import Link from 'next/link'

const EmployerRoutes = () => {
  return (
    <>
      <Link href='/employer/newEntry' passHref>
        <ListItem button>
          <ListItemIcon>
            <NoteAddIcon />
          </ListItemIcon>
          <ListItemText primary='Arbeitsverhältnis eintragen' />
        </ListItem>
      </Link>
      <Link href='/employer/read' passHref>
        <ListItem button>
          <ListItemIcon>
            <FolderSharedIcon />
          </ListItemIcon>
          <ListItemText primary='Lebensläufe lesen' />
        </ListItem>
      </Link>
    </>
  )
}

export default EmployerRoutes
