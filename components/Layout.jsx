/* eslint-disable import/no-named-as-default-member */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Head from 'next/head'
import NavigationBasis from './navigation/NavigationBasis'

const useStyles = makeStyles(() => ({
  content: {
    marginTop: '2rem',
  },
}))

const Layout = ({ children }) => {
  const classes = useStyles()
  return (
    <>
      <Head>
        <title>Hirey</title>
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width'
        />
      </Head>
      <NavigationBasis />

      <div className={classes.content}>{children}</div>
    </>
  )
}

export default Layout
