/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-array-index-key */
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import Collapse from '@material-ui/core/Collapse'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MuiAlert from '@material-ui/lab/Alert'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useContract } from '../../context/ContractProvider'
import { useIpfs } from '../../context/IpfsProvider'
import { useUser } from '../../context/UserProvider'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

// CSS Styles
const useStyles = makeStyles((theme) => ({
  grid: {
    flexGrow: 1,
  },
  list: {
    minWidth: 200,
    backgroundColor: theme.palette.background.paper,
    marginBottom: 10,
  },
  targetAccountTextField: {
    maxWidth: 200,
    marginRight: 5,
  },
  cvDocumentTitleTextField: {
    width: '100%',
    marginBottom: 20,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}))

const CV = () => {
  // Providers
  const { user, allUsers } = useUser()
  const { contract } = useContract()
  const ipfs = useIpfs()
  const classes = useStyles()
  // States
  const [cvRecords, setCVRecords] = useState([])
  const [detailCVRecord, setDetailCVRecord] = useState(null)
  const [checked, setChecked] = useState([])
  const [expanded, setExpanded] = useState(false)
  // const [targetAccount, setTargetAccount] = useState('')
  const [cvDocumentTitle, setCVDocumentTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = React.useState(false)

  // Const
  const pageNumber = 1

  const loadCVRecords = async () => {
    if (contract && user) {
      const nbrOfCvRecordHashes = await contract.methods
        .getNbrOfCvRecordHashes()
        .call()
      console.log(nbrOfCvRecordHashes)
      const newCVRecords = []
      for (
        let cvRecordHashIndex = 0;
        cvRecordHashIndex < nbrOfCvRecordHashes;
        cvRecordHashIndex += 1
      ) {
        const cvRecord = await contract.methods
          .getCvRecordHash(cvRecordHashIndex)
          .call()
        const sender = cvRecord[0]
        const ipfsHash = cvRecord[1]

        const senderUser = allUsers.find((u) => u.address === sender)
        const result = await ipfs.download(
          user.privateKey,
          senderUser.publicKey,
          ipfsHash,
        )
        if (!result.sender) {
          result.sender = sender
        }
        console.log('cvRecord download result')
        console.log(result)

        newCVRecords.push(result)
      }

      setCVRecords(newCVRecords)
      if (newCVRecords.length > 0) {
        setDetailCVRecord(newCVRecords[0])
      }
      setIsLoading(false)
    }
  }

  const handleToggleCVRecordCheckbox = (cvRecordIndex) => () => {
    const currentIndex = checked.indexOf(cvRecordIndex)
    const newChecked = [...checked]
    if (currentIndex === -1) {
      newChecked.push(cvRecordIndex)
    } else {
      newChecked.splice(currentIndex, 1)
    }
    setChecked(newChecked)
  }

  const handleClickedCVRecord = (cvRecordIndex) => () => {
    // reset expanded documents
    setExpanded(false)
    setDetailCVRecord(cvRecords[cvRecordIndex])
  }

  const onCreate = async (event) => {
    event.preventDefault()
    const selectedRecords = []
    for (
      let checkedIndex = 0;
      checkedIndex < checked.length;
      checkedIndex += 1
    ) {
      selectedRecords.push(cvRecords[checked[checkedIndex]])
    }

    const cvDocument = {
      title: cvDocumentTitle,
      name: user.name,
      address: user.address,
      records: selectedRecords,
    }

    const ipfsHash = await ipfs.upload(
      user.publicKey,
      user.privateKey,
      cvDocument,
    )

    console.log('cv upload data')
    console.log(cvDocument)

    await contract.methods.storeCVDocument(ipfsHash).send({
      from: user.address,
    })
    setOpen(true)
  }

  // open and close expand with documents
  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  useEffect(() => {
    ;(async () => {
      await loadCVRecords()
    })()
  }, [contract])

  return (
    <Box component='div'>
      {!isLoading ? (
        <Box>
          {cvRecords.length > 0 ? (
            <>
              <Grid container className={classes.grid} spacing={3}>
                {/* LEFT SIDE */}
                <Grid item xs={12} md={6}>
                  <List dense className={classes.list}>
                    {cvRecords.map((cvRecord, cvRecordIndex) => {
                      const labelId = `checkbox-list-secondary-label-${cvRecordIndex}`
                      return (
                        <ListItem
                          key={cvRecordIndex}
                          onClick={handleClickedCVRecord(cvRecordIndex)}
                          className={classes.listItem}
                          button
                        >
                          <ListItemText
                            id={labelId}
                            primary={cvRecord.title}
                            secondary={`${
                              allUsers.find(
                                (u) => u.address === cvRecord.sender,
                              ).name
                            }`}
                          />
                          <ListItemSecondaryAction>
                            <Checkbox
                              edge='end'
                              onChange={handleToggleCVRecordCheckbox(
                                cvRecordIndex,
                              )}
                              checked={checked.indexOf(cvRecordIndex) !== -1}
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      )
                    })}
                  </List>
                  <Box component='div'>
                    <Typography paragraph>
                      Anzahl selektierter Lebenslaufeinträge: {checked.length}
                    </Typography>
                    <form onSubmit={onCreate}>
                      <TextField
                        onChange={(event) =>
                          setCVDocumentTitle(event.target.value)
                        }
                        className={classes.cvDocumentTitleTextField}
                        label='Lebenslauf Titel:'
                        required
                      />
                      <Button type='submit' variant='contained' color='primary'>
                        Erstellen
                      </Button>
                    </form>
                  </Box>
                </Grid>

                {/* RIGHT SIDE */}
                <Grid item xs={12} md={6}>
                  {detailCVRecord != null && (
                    <Card>
                      <CardHeader
                        title={detailCVRecord.title}
                        subheader={`von ${detailCVRecord.autor} | publiziert am: ${detailCVRecord.publishDate}`}
                      />
                      <CardContent>
                        {detailCVRecord.type === 'Anstellung' && (
                          <Typography variant='subtitle1' component='p'>
                            From: {detailCVRecord.from} To: {detailCVRecord.to}
                          </Typography>
                        )}
                        <Typography variant='body2' component='p'>
                          {detailCVRecord.description}
                        </Typography>
                      </CardContent>
                      <Divider light />
                      <CardActions disableSpacing>
                        <IconButton
                          className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
                          })}
                          onClick={handleExpandClick}
                          aria-expanded={expanded}
                          aria-label='Dokumente Anzeigen'
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </CardActions>
                      <Collapse in={expanded} timeout='auto' unmountOnExit>
                        <CardContent>
                          <Typography paragraph>Dokument</Typography>
                          <Box component='div'>
                            <Document file={detailCVRecord.document}>
                              <Page pageNumber={pageNumber} />
                            </Document>
                          </Box>
                        </CardContent>
                      </Collapse>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </>
          ) : (
            <>Keine Lebenslaufeinträge vorhanden.</>
          )}
        </Box>
      ) : (
        <Grid container className={classes.grid} spacing={3} justify='center'>
          <CircularProgress color='primary' variant='indeterminate' size={70} />
        </Grid>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <MuiAlert
          elevation={6}
          variant='filled'
          onClose={handleClose}
          severity='success'
        >
          Lebenslauf erfolgreich erstellt!
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default CV
