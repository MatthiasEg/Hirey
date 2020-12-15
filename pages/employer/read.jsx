/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-array-index-key */
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CircularProgress from '@material-ui/core/CircularProgress'
import Collapse from '@material-ui/core/Collapse'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
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

const Read = () => {
  // Providers
  const { user, allUsers } = useUser()
  const { contract } = useContract()
  const ipfs = useIpfs()
  const classes = useStyles()
  // States
  const [cvDocuments, setCVDocuments] = useState([])
  const [cvDocumentHashes, setCVDocumentHashes] = useState([])
  const [detailCVDocument, setDetailCVDocument] = useState(null)
  const [expanded, setExpanded] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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
        const isUnlocked = await contract.methods
          .isCvDocumentUnlocked(cvDocumentHashIndex)
          .call({
            from: user.address,
          })

        const cvDocument = await contract.methods
          .getCvDocumentHash(cvDocumentHashIndex)
          .call({
            from: user.address,
          })
        const sender = cvDocument[0]
        const ipfsHash = cvDocument[1]

        if (isUnlocked) {
          const downloadedDocument = await downloadCVDocument(sender, ipfsHash)
          if (downloadedDocument) {
            newCVDocuments.push(downloadedDocument)
            newCVDocumentHashes.push(ipfsHash)
          }
        } else {
          newCVDocuments.push({ unlocked: false, sender, records: [] })
          newCVDocumentHashes.push('')
        }
      }

      setCVDocuments(newCVDocuments)
      setCVDocumentHashes(newCVDocumentHashes)
      setIsLoading(false)
    }
  }

  const handleClickedUnlock = (cvDocumentIndex) => async () => {
    await contract.methods.unlockCVDocument(cvDocumentIndex).send({
      from: user.address,
      value: 30000,
    })

    const newCVDocuments = [...cvDocuments]
    const newCVDocumentHashes = [...cvDocumentHashes]
    const cvDocument = await contract.methods
      .getCvDocumentHash(cvDocumentIndex)
      .call({
        from: user.address,
      })

    const sender = cvDocument[0]
    const ipfsHash = cvDocument[1]

    const downloadedDocument = await downloadCVDocument(sender, ipfsHash)
    if (downloadedDocument) {
      newCVDocuments[cvDocumentIndex] = downloadedDocument
      newCVDocumentHashes[cvDocumentIndex] = ipfsHash
      setCVDocuments(newCVDocuments)
      setCVDocumentHashes(newCVDocumentHashes)
      setDetailCVDocument(newCVDocuments[cvDocumentIndex])
    }
  }

  const downloadCVDocument = async (sender, ipfsHash) => {
    const senderUser = allUsers.find((u) => u.address === sender)
    if (senderUser) {
      const result = await ipfs.download(
        user.privateKey,
        senderUser.publicKey,
        ipfsHash,
      )
      if (!result.sender) {
        result.sender = sender
      }
      result.unlocked = true

      console.log('shared cv read download result')
      console.log(result)

      return result
    }
    return null
  }

  const handleClickedCVDocument = (cvDocumentIndex) => () => {
    // reset expanded documents
    setExpanded([])
    setDetailCVDocument(cvDocuments[cvDocumentIndex])
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

  useEffect(() => {
    ;(async () => {
      await loadCVDocument()
    })()
  }, [contract])

  return (
    <Box component='div'>
      {!isLoading ? (
        <Box component='div'>
          {cvDocuments.length > 0 ? (
            <>
              <Grid container className={classes.grid} spacing={3}>
                {/* LEFT SIDE */}
                <Grid item xs={4}>
                  <List dense className={classes.list}>
                    {cvDocuments.map((cvDocument, cvDocumentIndex) => {
                      return cvDocument.unlocked ? (
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
                      ) : (
                        <ListItem
                          key={cvDocumentIndex}
                          className={classes.listItem}
                          onClick={handleClickedUnlock(cvDocumentIndex)}
                          button
                        >
                          <ListItemText
                            primary='Gesperrt'
                            secondary={`${
                              allUsers.find(
                                (u) => u.address === cvDocument.sender,
                              ).name
                            }`}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Grid>

                {/* RIGHT SIDE */}
                <Grid item xs={8}>
                  {detailCVDocument != null &&
                  detailCVDocument.records != null &&
                  detailCVDocument.records.length > 0 ? (
                    <>
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
                                    Von: {cvRecord.from} Bis: {cvRecord.to}
                                  </Typography>
                                )}
                                <Typography variant='body2' component='p'>
                                  {cvRecord.description}
                                </Typography>
                              </CardContent>
                              <Divider light />
                              <CardActions disableSpacing>
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
                                  aria-label='Dokumente anzeigen'
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
                                  <Typography paragraph>Dokument</Typography>
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

                      {/* Fallback Detail */}
                    </>
                  ) : (
                    <>Kein Lebenslauf selektiert!</>
                  )}
                </Grid>
              </Grid>

              {/* Fallback Page */}
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
    </Box>
  )
}

export default Read
