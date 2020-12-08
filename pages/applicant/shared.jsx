/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-array-index-key */
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Chip from '@material-ui/core/Chip'
import CircularProgress from '@material-ui/core/CircularProgress'
import Collapse from '@material-ui/core/Collapse'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import AccountCircle from '@material-ui/icons/AccountCircle'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MuiAlert from '@material-ui/lab/Alert'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useContract } from '../../context/ContractProvider'
import { useIpfs } from '../../context/IpfsProvider'
import { useUser } from '../../context/UserProvider'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

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
  headerCard: {
    background: '#7798DA',
    marginBottom: 20,
  },
  detailCard: {
    marginBottom: 20,
  },
  sharedToContainer: {
    borderRadius: 25,
    display: 'flex',
  },
  sharedToContainerTitle: {
    marginBottom: 10,
    padding: 5,
    background: '#00111d',
    color: 'white',
  },
  sharedToContainerContent: {
    flexGrow: 1,
    background: '#9BB3E2',
    marginBottom: 10,
    padding: 5,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
}))

const Shared = () => {
  // Providers
  const { user, allUsers } = useUser()
  const { contract } = useContract()
  const ipfs = useIpfs()
  const classes = useStyles()
  // States
  const [cvDocuments, setCVDocuments] = useState([])
  const [detailCVDocument, setDetailCVDocument] = useState(null)
  const [detailCVDocumentIndex, setDetailCVDocumentIndex] = useState(0)
  const [expanded, setExpanded] = useState([])
  const [targetAccount, setTargetAccount] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = React.useState(false)
  // Const
  const pageNumber = 1

  const loadCVDocument = async () => {
    if (contract) {
      const nbrOfCvDocumentHashes = await contract.methods
        .getNbrOfCvDocumentHashes()
        .call({
          from: user.address,
        })
      const newCVDocuments = []
      const newCVDocumentHashes = []
      for (
        let cvDocumentHashIndex = 0;
        cvDocumentHashIndex < nbrOfCvDocumentHashes;
        cvDocumentHashIndex += 1
      ) {
        const cvDocument = await contract.methods
          .getCvDocumentHash(cvDocumentHashIndex)
          .call({
            from: user.address,
          })
        const sender = cvDocument[0]
        const ipfsHash = cvDocument[1]

        console.log(sender)

        const senderUser = allUsers.find((u) => u.address == sender)
        const result = await ipfs.download(
          user.privateKey,
          senderUser.publicKey,
          ipfsHash,
        )
        if (!result.sender) {
          result.sender = sender
        }

        result.sharedTo = []
        newCVDocuments.push(result)
        newCVDocumentHashes.push(ipfsHash)

        console.log('shared cvrecord download result')
        console.log(result)

        const nbrOfSharedToAddresses = await contract.methods
          .getNbrOfSharedTo(cvDocumentHashIndex)
          .call({
            from: user.address,
          })
        for (
          let sharedToIndex = 0;
          sharedToIndex < nbrOfSharedToAddresses;
          sharedToIndex += 1
        ) {
          const sharedToAddresse = await contract.methods
            .getSharedTo(cvDocumentHashIndex, sharedToIndex)
            .call({
              from: user.address,
            })
          newCVDocuments[cvDocumentHashIndex].sharedTo.push(sharedToAddresse)
        }
      }
      setCVDocuments(newCVDocuments)
      if (newCVDocuments.length > 0) {
        setDetailCVDocument(newCVDocuments[0])
        setDetailCVDocumentIndex(0)
      }
      setIsLoading(false)
    }
  }

  const handleClickedCVDocument = (cvDocumentIndex) => () => {
    // reset expanded documents
    setExpanded([])
    setDetailCVDocument(cvDocuments[cvDocumentIndex])
    setDetailCVDocumentIndex(cvDocumentIndex)
  }

  const onShare = async (event) => {
    event.preventDefault()

    const recipient = allUsers.find((u) => u.address === targetAccount)
    if (recipient) {
      console.log(recipient)

      var cvDocumentToUpload = Object.assign({}, detailCVDocument)
      delete cvDocumentToUpload.sharedTo

      console.log('new shared cv entry data')
      console.log(cvDocumentToUpload)

      const ipfsHash = await ipfs.upload(
        recipient.publicKey,
        user.privateKey,
        cvDocumentToUpload,
      )
      console.log(`IPFS hash from upload: ${ipfsHash}`)

      await contract.methods
        .shareCVDocument(targetAccount, detailCVDocumentIndex, ipfsHash)
        .send({
          from: user.address,
        })

      const newCvDocuments = [...cvDocuments]
      newCvDocuments[detailCVDocumentIndex].sharedTo.push(targetAccount)
      setCVDocuments(newCvDocuments)
      setOpen(true)
    } else {
      throw Error(`Recipient with address ${targetAccount} could not be found!`)
    }
  }

  // open and close expand with documents
  const handleExpandClick = (cvRecordIndex) => () => {
    const currentIndex = expanded.indexOf(cvRecordIndex)
    const newExpanded = [...expanded]
    if (currentIndex === -1) {
      newExpanded.push(cvRecordIndex)
    } else {
      newExpanded.splice(currentIndex, 1)
    }
    setExpanded(newExpanded)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const handleTargetAccountChange = (event) => {
    setTargetAccount(event.target.value)
  }

  useEffect(() => {
    ;(async () => {
      await loadCVDocument()
    })()
  }, [contract])

  return (
    <Box component='div'>
      {!isLoading ? (
        <Box>
          {cvDocuments.length > 0 ? (
            <>
              <Grid container className={classes.grid} spacing={3}>
                {/* LEFT SIDE */}
                <Grid item xs={4}>
                  <List dense className={classes.list}>
                    {cvDocuments.map((cvDocument, cvDocumentIndex) => {
                      return (
                        <ListItem
                          key={cvDocumentIndex}
                          onClick={handleClickedCVDocument(cvDocumentIndex)}
                          className={classes.listItem}
                          button
                        >
                          <ListItemText
                            primary={cvDocument.title}
                            secondary={cvDocument.name}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Grid>

                {/* RIGHT SIDE */}
                <Grid item xs={8}>
                  {detailCVDocument != null &&
                  detailCVDocument.records.length > 0 ? (
                    <>
                      <Card className={classes.headerCard}>
                        <CardHeader
                          title={detailCVDocument.title}
                          subheader={`von ${detailCVDocument.name} | Anzahl Lebenslaufeinträge: ${detailCVDocument.records.length}`}
                        />
                        <CardContent>
                          <Box
                            component='div'
                            className={classes.sharedToContainer}
                          >
                            <Box
                              component='div'
                              className={classes.sharedToContainerTitle}
                            >
                              Freigegeben an:
                            </Box>
                            <Box
                              component='div'
                              className={classes.sharedToContainerContent}
                            >
                              {detailCVDocument.sharedTo.map(
                                (sharedToAdresse, sharedToAdresseIndex) => {
                                  return (
                                    <Chip
                                      size='small'
                                      label={
                                        allUsers.find(
                                          (u) => u.address === sharedToAdresse,
                                        ).name
                                      }
                                      color='secondary'
                                      key={sharedToAdresseIndex}
                                    />
                                  )
                                },
                              )}
                            </Box>
                          </Box>
                          <form onSubmit={onShare}>
                            <Grid
                              container
                              justify='between'
                              alignItems='center'
                              alignContent='center'
                              spacing={3}
                            >
                              <Grid item xs={8} md={8}>
                                <InputLabel>Freigeben an</InputLabel>
                                <Select
                                  required
                                  fullWidth
                                  value={targetAccount || ''}
                                  onChange={handleTargetAccountChange}
                                >
                                  {allUsers
                                    .filter((u) => u.type === 'employer')
                                    .map((userObject) => (
                                      <MenuItem
                                        key={userObject.address}
                                        value={userObject.address}
                                      >
                                        {userObject.name}
                                      </MenuItem>
                                    ))}
                                </Select>
                              </Grid>
                              <Grid item xs={4} md={4}>
                                <Button
                                  type='submit'
                                  variant='contained'
                                  color='secondary'
                                >
                                  Freigeben
                                </Button>
                              </Grid>
                            </Grid>
                          </form>
                        </CardContent>
                      </Card>

                      {detailCVDocument.records.map(
                        (cvRecord, cvRecordIndex) => {
                          return (
                            <Card
                              className={classes.detailCard}
                              key={cvRecordIndex}
                            >
                              <CardHeader
                                title={cvRecord.title}
                                subheader={`von ${cvRecord.autor} | publiziert am: ${cvRecord.publishDate}`}
                              />
                              <CardContent>
                                {cvRecord.type === 'Anstellung' && (
                                  <Typography variant='subtitle1' component='p'>
                                    From: {cvRecord.from} To: {cvRecord.to}
                                  </Typography>
                                )}
                                <Typography variant='body2' component='p'>
                                  {cvRecord.description}
                                </Typography>
                              </CardContent>
                              <Divider light />
                              <CardActions disableSpacing>
                                <Typography paragraph>Dokument</Typography>
                                <IconButton
                                  className={clsx(classes.expand, {
                                    [classes.expandOpen]: expanded.includes(
                                      cvRecordIndex,
                                    ),
                                  })}
                                  onClick={handleExpandClick(cvRecordIndex)}
                                  aria-expanded={expanded.includes(
                                    cvRecordIndex,
                                  )}
                                  aria-label='Dokumente Anzeigen'
                                >
                                  <ExpandMoreIcon />
                                </IconButton>
                              </CardActions>
                              <Collapse
                                in={expanded.includes(cvRecordIndex)}
                                timeout='auto'
                                unmountOnExit
                              >
                                <CardContent>
                                  <Box component='div'>
                                    <Document file={cvRecord.document}>
                                      <Page pageNumber={pageNumber} />
                                    </Document>
                                  </Box>
                                </CardContent>
                              </Collapse>
                            </Card>
                          )
                        },
                      )}

                      {/* Fallback Detail*/}
                    </>
                  ) : (
                    <>Kein Lebenslauf selektiert!</>
                  )}
                </Grid>
              </Grid>

              {/* Fallback Page*/}
            </>
          ) : (
            <>Keine Lebenslaufeinträge gefunden.</>
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
          Lebenslauf erfolgreich geteilt!
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default Shared
