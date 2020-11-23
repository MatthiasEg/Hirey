import React from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const Shared = () => {
  return (
    <>
      <Grid container direction='column' spacing={2}>
        <Grid item>
          <Typography variant='h6'>
            This view should show shared CVs of the applicant
          </Typography>
        </Grid>
      </Grid>
    </>
  )
}

export default Shared
