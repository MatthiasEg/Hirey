/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { AppBar, Toolbar, Grid, Box } from '@material-ui/core'
import React, { useState } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/icons/Menu'
import Drawer from '@material-ui/core/Drawer'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import HomeIcon from '@material-ui/icons/Home'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useUser } from '../../context/UserProvider'
import EmployerRoutes from './routes/EmployerRoutes'
import ApplicantRoutes from './routes/ApplicantRoutes'
import UniversityRoutes from './routes/UniversityRoutes'

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
    fontSize: '0.7em',
  },
}))

const NavigationBasis = () => {
  const classes = useStyles()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const { user } = useUser()

  const logoWidth = 160

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }

    setDrawerOpen(open)
  }

  const RoleSpecificRoutes = () => {
    if (user) {
      if (user.address === '0xa643664FBB17124B881cf5c757D68cEb9E39b577') {
        return <EmployerRoutes />
      }
      if (
        user.address === '0xd0C193a3a9A6A0ba12f9FCAa16d1F1702f0760Bb' ||
        user.address === '0x5A0ae00a7f472F79C12886B14D9d1dA7C285E5D0' ||
        user.address === '0x336326C6e975FF26FFffb0948af8b8424741678a'
      ) {
        return <ApplicantRoutes />
      }
  
      return <UniversityRoutes />
    }

    return null
  }

  return (
    <AppBar position='static' color='primary'>
      <Toolbar>
        <div className={classes.root}>
          <Grid container alignItems='center' justify='space-between'>
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
                    <RoleSpecificRoutes />
                    <Box className={classes.bottomPush} component='div'>
                      {user ? (
                        <>
                          <Grid
                            container
                            direction='column'
                            alignItems='flex-start'
                          >
                            <Grid item>
                              <Typography variant='body2'>
                                You are logged in with account:
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography className={classes.accountText}>
                                name: {user.name}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography className={classes.accountText}>
                                address:
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography className={classes.accountText}>
                                {user.address}
                              </Typography>
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <></>
                      )}
                    </Box>
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
  )
}

export default NavigationBasis
