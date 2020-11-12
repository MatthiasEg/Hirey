/* eslint-disable jsx-a11y/anchor-is-valid */
import { AppBar, Toolbar, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/icons/Menu'
import Drawer from '@material-ui/core/Drawer'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import DashboardIcon from '@material-ui/icons/Dashboard'
import HomeIcon from '@material-ui/icons/Home'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAccount } from '../context/AccountProvider'

const useStyles = makeStyles(() => ({
  homePageLink: {
    fontSize: '1.44rem',
    textDecoration: 'none',
    fontWeight: 'bold',
    margin: '1.44rem 0 1.44rem 0',
    color: 'white',
  },
  logo: {
    cursor: 'pointer',
  },
  icon: {
    overflow: 'overlay',
  },
  content: {
    marginTop: '2rem',
  },
  root: {
    flexGrow: 1,
    flexWrap: 'nowrap',
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  bottomPush: {
    position: 'fixed',
    bottom: 0,
    textAlign: 'center',
    paddingBottom: 10,
  },
  accountText: {
    fontSize: '0.5em',
  },
}))

const Layout = ({ children }) => {
  const classes = useStyles()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const { account } = useAccount()

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }

    setDrawerOpen(open)
  }

  const logoWidth = 160

  return (
    <>
      <AppBar position='static' color='primary'>
        <Toolbar>
          <div className={classes.root}>
            <Grid container alignItems='center'>
              <Grid item>
                <IconButton
                  edge='start'
                  className={classes.menuButton}
                  color='inherit'
                  aria-label='menu'
                  onClick={toggleDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
                  <div
                    className={classes.list}
                    role='presentation'
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                  >
                    <List>
                      <Link href='/' passHref>
                        <ListItem button>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText primary='Hirey' />
                        </ListItem>
                      </Link>
                      <Link href='/upload' passHref>
                        <ListItem button>
                          <ListItemIcon>
                            <DashboardIcon />
                          </ListItemIcon>
                          <ListItemText primary='Upload' />
                        </ListItem>
                      </Link>
                      <div className={classes.bottomPush}>
                        {account ? (
                          <>
                            <ListItem>
                              <Typography variant='body2'>
                                You are logged in with account:
                              </Typography>
                            </ListItem>
                            <ListItem>
                              <Typography
                                variant='caption'
                                className={classes.accountText}
                              >
                                {account}
                              </Typography>
                            </ListItem>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </List>
                  </div>
                </Drawer>
              </Grid>
              <Grid item>
                <Image
                  src='/logo_dark.png'
                  alt='logo'
                  width={150}
                  height={logoWidth / 3.18433179}
                  className={classes.logo}
                  onClick={() => {
                    router.push('/')
                  }}
                />
              </Grid>
            </Grid>
          </div>
        </Toolbar>
      </AppBar>

      <div className={classes.content}>{children}</div>
    </>
  )
}

export default Layout
