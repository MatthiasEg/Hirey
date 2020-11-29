import React from 'react'
import Image from 'next/image'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { useUser } from '../context/UserProvider'

const Home = () => {
  const logoWidth = 300
  const { user } = useUser()

  return (
    <>
      <Grid
        container
        direction='column'
        alignItems='center'
        alignContent='center'
        justify='center'
        spacing={2}
      >
        <Grid item>
          <Image
            src='/logo.png'
            width={logoWidth}
            height={logoWidth * 1.085514834205}
          />
        </Grid>
        <Grid item>
          <Typography>Wilkommen, {user?.name || ''}</Typography>
        </Grid>
      </Grid>
    </>
  )
}

export default Home
