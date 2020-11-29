/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-array-index-key */
import Grid from '@material-ui/core/Grid'
import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import AccountCircle from '@material-ui/icons/AccountCircle'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import IconButton from '@material-ui/core/IconButton'
import clsx from 'clsx'
import Collapse from '@material-ui/core/Collapse'
import Divider from '@material-ui/core/Divider'
import { Document, Page, pdfjs } from 'react-pdf'
import { useContract } from '../../context/ContractProvider'
import { useUser } from '../../context/UserProvider'
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import ipfs from '../../lib/IPFSClient'
import { render } from 'react-dom'

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
    marginBottom:20,
  },
  detailCard: {
    marginBottom:20,
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
  const { user } = useUser()
  const { contract } = useContract()
  const classes = useStyles()
  // States
  const [cvDocuments, setCVDocuments] = useState([])
  const [cvDocumentHashes, setCVDocumentHashes] = useState([])
  const [detailCVDocument, setDetailCVDocument] = useState(null)
  const [detailCVDocumentHash, setDetailCVDocumentHash] = useState('')
  const [detailCVDocumentIndex, setDetailCVDocumentIndex] = useState(0)
  const [expanded, setExpanded] = useState([])
  const [targetAccount, setTargetAccount] = useState('')
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
        const isUnlocked = await contract.methods
        .isCvDocumentUnlocked(cvDocumentHashIndex)
        .call({
          from: user.address,
        })
        if(isUnlocked) {
          const cvDocument = await contract.methods
          .getCvDocumentHash(cvDocumentHashIndex)
          .call({
            from: user.address,
          })
          const sender = cvDocument[0]
          const hash = cvDocument[1]
          await fetch(`https://ipfs.infura.io/ipfs/${hash}`)
            .then((response) => response.json())
            .then((jsonData) => {
            jsonData.sender = sender
            jsonData.unlocked = true
            newCVDocuments.push(jsonData)
            newCVDocumentHashes.push(hash)
          })
        } else {
          newCVDocuments.push({unlocked: false, records: []})
          newCVDocumentHashes.push('')
        }
      }
      setCVDocuments(newCVDocuments)
      setCVDocumentHashes(newCVDocumentHashes)
      if (newCVDocuments.length > 0) {
        setDetailCVDocument(newCVDocuments[0])
        setDetailCVDocumentHash(newCVDocumentHashes[0])
        setDetailCVDocumentIndex(0)
      }
    }
  }

  const handleClickedCVDocument = (cvDocumentIndex) => () => {
    console.log('asdf')
    // reset expanded documents
    setExpanded([])
    setDetailCVDocument(cvDocuments[cvDocumentIndex])
    setDetailCVDocumentHash(cvDocumentHashes[cvDocumentIndex])
    setDetailCVDocumentIndex(cvDocumentIndex)
  }

  const handleClickedUnlock = (cvDocumentIndex) => () => {
    contract.methods
    .unlockCVDocument(cvDocumentIndex)
    .send({
      from: user.address,
      value: 30000,
    })
    .then(() => {
      console.log(
        `successfully unlock: https://ipfs.infura.io/ipfs/${detailCVDocumentHash}`,
      )
      const newCVDocuments = [...cvDocuments]
      const newCVDocumentHashes = [...cvDocumentHashes]
      contract.methods
      .getCvDocumentHash(cvDocumentIndex)
      .call({
        from: user.address,
      }).then((cvDocument) => {
        const sender = cvDocument[0]
        const hash = cvDocument[1]
        fetch(`https://ipfs.infura.io/ipfs/${hash}`)
          .then((response) => response.json())
          .then((jsonData) => {
          jsonData.sender = sender
          jsonData.unlocked = true
          newCVDocuments[cvDocumentIndex] = jsonData
          newCVDocumentHashes[cvDocumentIndex] = hash
          setCVDocuments(newCVDocuments)
          setCVDocumentHashes(newCVDocumentHashes)
          setDetailCVDocument(newCVDocuments[cvDocumentIndex])
          setDetailCVDocumentIndex(cvDocumentIndex)
        })
      })
    })
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
                      primary='LOCKED'
                    />
                    </ListItem>
                  ) 
                })}
              </List>
            </Grid>

            {/* RIGHT SIDE */}
            <Grid item xs={8}>
              {detailCVDocument != null && detailCVDocument.records.length > 0 ? (
                <>
                  {detailCVDocument.records.map((cvRecord, cvRecordIndex) => {
                    return (
                      <Card className={classes.detailCard} key={cvRecordIndex}>
                        <CardHeader
                          title={cvRecord.title}
                          subheader={`by ${cvRecord.autor} | publish date: ${cvRecord.publishDate}`}
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
                          {cvRecord.documents.length > 0 && (
                            <IconButton
                              className={clsx(classes.expand, {
                                [classes.expandOpen]: expanded.includes(cvRecordIndex),
                              })}
                              onClick={handleExpandClick(cvRecordIndex)}
                              aria-expanded={expanded.includes(cvRecordIndex)}
                              aria-label='show documents'
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                          )}
                        </CardActions>
                        <Collapse in={expanded.includes(cvRecordIndex)} timeout='auto' unmountOnExit>
                          <CardContent>
                            <Typography paragraph>Documents</Typography>
                            {cvRecord.documents.map(
                              (documentHash, documentIndex) => {
                                return (
                                  <Box component='div' key={documentIndex}>
                                    <p>
                                      Document Link: https://ipfs.infura.io/ipfs/
                                      {documentHash}
                                    </p>
                                    <Document
                                      file={`https://ipfs.infura.io/ipfs/${documentHash}`}
                                    >
                                      <Page pageNumber={pageNumber} />
                                    </Document>
                                  </Box>
                                )
                              },
                            )}
                          </CardContent>
                        </Collapse>
                      </Card>
                    )
                  })}
                
              {/* Fallback Detail*/}
              </>
              ) : (
                <>No CV Document selected!</>
              )}
            </Grid>
          </Grid>

          {/* Fallback Page*/}
        </>
      ) : (
        <Grid container className={classes.grid} spacing={3} justify='center'>
          <CircularProgress color='primary' variant='indeterminate' size={70} />
        </Grid>
      )}
    </Box>
  )
}

export default Read
