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
import { useContract } from '../context/ContractProvider'
import { useUser } from '../context/UserProvider'
import ipfs from '../lib/IPFSClient'

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

const Applicant = () => {
  // Providers
  const { user } = useUser()
  const { contract } = useContract()
  const classes = useStyles()
  // States
  const [cvRecords, setCVRecords] = useState([])
  const [detailCVRecord, setDetailCVRecord] = useState(null)
  const [checked, setChecked] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [targetAccount, setTargetAccount] = useState('')
  const [cvDocumentTitle, setCVDocumentTitle] = useState('')
  // Const
  const pageNumber = 1

  const loadCVRecords = async () => {
    if (contract) {
      const nbrOfCvRecordHashes = await contract.methods
        .getNbrOfCvRecordHashes()
        .call()
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
        const hash = cvRecord[1]
        await fetch(`https://ipfs.infura.io/ipfs/${hash}`)
          .then((response) => response.json())
          .then((jsonData) => {
            jsonData.sender = sender
            newCVRecords.push(jsonData)
          })
      }
      setCVRecords(newCVRecords)
      if (newCVRecords.length > 0) {
        setDetailCVRecord(newCVRecords[0])
      }
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

  const onShare = (event) => {
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

    ipfs.add(Buffer.from(JSON.stringify(cvDocument))).then((response) => {
      console.log(response.path)
      contract.methods
        .storeCVDocumentFor(targetAccount, response.path)
        .send({
          from: user.address,
        })
        .then(() => {
          console.log(
            `successfully uploaded: https://ipfs.infura.io/ipfs/${response.path}`,
          )
          console.log(cvDocument)
        })
    })
  }

  // open and close expand with documents
  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  useEffect(() => {
    ;(async () => {
      await loadCVRecords()
    })()
  }, [contract])

  return (
    <Box component='div'>
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
                        secondary={`${cvRecord.sender.substring(0, 25)}...`}
                      />
                      <ListItemSecondaryAction>
                        <Checkbox
                          edge='end'
                          onChange={handleToggleCVRecordCheckbox(cvRecordIndex)}
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
                  Number of selected cv records to share: {checked.length}
                </Typography>
                <form onSubmit={onShare}>
                  <TextField
                    onChange={(event) => setCVDocumentTitle(event.target.value)}
                    className={classes.cvDocumentTitleTextField}
                    label='CV document title:'
                    required
                  />
                  <TextField
                    onChange={(event) => setTargetAccount(event.target.value)}
                    className={classes.targetAccountTextField}
                    label='Share for AccountId'
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button type='submit' variant='contained' color='primary'>
                    Share
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
                    subheader={`by ${detailCVRecord.autor} | publish date: ${detailCVRecord.publishDate}`}
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
                    {detailCVRecord.documents.length > 0 && (
                      <IconButton
                        className={clsx(classes.expand, {
                          [classes.expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label='show documents'
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    )}
                  </CardActions>
                  <Collapse in={expanded} timeout='auto' unmountOnExit>
                    <CardContent>
                      <Typography paragraph>Documents</Typography>
                      {detailCVRecord.documents.map(
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
              )}
            </Grid>
          </Grid>

          {/* Fallback Page */}
        </>
      ) : (
        <>No Cv Records found!</>
      )}
    </Box>
  )
}

export default Applicant
