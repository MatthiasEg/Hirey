/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import ListItem from '@material-ui/core/ListItem'
import Link from 'next/link'

const UniversityRoutes = () => {
  return (
    <>
      <Link href='/university/newEntry' passHref>
        <ListItem button>
          <ListItemIcon>
            <NoteAddIcon />
          </ListItemIcon>
          <ListItemText primary='Create Entry' />
        </ListItem>
      </Link>
    </>
  )
}

export default UniversityRoutes
