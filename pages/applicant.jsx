import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import clsx from 'clsx';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import { useContract } from '../context/ContractProvider'
import { useUser } from '../context/UserProvider'
import { Document, Page, pdfjs } from 'react-pdf'
import ipfs from '../lib/IPFSClient'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const useStyles = makeStyles((theme) => ({
  gridroot: {
    flexGrow: 1,
  },
  listroot: {
    minWidth: 200,
    backgroundColor: theme.palette.background.paper,
  },  
  listitem: {
    overflow: "hidden"
  },
  listbuttonsection: {
    marginTop: 10
  },
  listbuttonacc: {
    maxWidth: 200,
    marginRight: 5
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
}));

const Applicant = () => {
  const { user } = useUser()
  const { contract } = useContract();
  const classes = useStyles()
  const [cvRecords, setCVRecords] = useState([]);
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [detailCVRecord, setDetailCVRecord] = useState(null);
  const [numberOfPages, setNumberOfPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [targetAccount, setTargetAccount] = useState('')

  useEffect(() => {
    ;(async () => {
      await loadCVRecordHashes()
    })()
  }, [contract])

  const loadCVRecordHashes = async () => {
    fetch("https://ipfs.infura.io/ipfs/QmdSu2BGx2i8X5svvh4Bpfjm8SjRyx3xSQ3iBjwvSQiDiu")
    .then(response => response.json())
    .then((jsonData) => {
      // jsonData is parsed json object received from url
      console.log(jsonData)
    })
    .catch((error) => {
      // handle your errors here
      console.error(error)
    })

    if (contract) {
      console.log('Start Load CV Record Hashes')
      const nbrOfCvRecordHashes = await contract.methods.getNbrOfCvRecordHashes().call()
      const tempCVRecords = []
      for (let cvRecordHashIndex = 0; cvRecordHashIndex < nbrOfCvRecordHashes; cvRecordHashIndex++) {
        const hash = await contract.methods.getCvRecordHash(cvRecordHashIndex).call()
        await fetch("https://ipfs.infura.io/ipfs/" + hash[1])
        .then(response => response.json())
        .then((jsonData) => {
          jsonData.sender = hash[0]
          tempCVRecords.push(jsonData)
        })
      }
      setCVRecords(tempCVRecords)
      setDetailCVRecord(tempCVRecords[0])
      console.log('END Load CV Record Hashes, found '+ nbrOfCvRecordHashes)
    }
  }

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleClicked = (value) => () => {
    setExpanded(false);
    setDetailCVRecord(cvRecords[value])
  };
  
  const onSubmit = (event) => {
    event.preventDefault();
    const records = []
    for (let checkedIndex = 0; checkedIndex < checked.length; checkedIndex++) {
      records.push(cvRecords[checked[checkedIndex]])
    }

    const cvDocument = {
      "name": user.name,
      "address": user.address,
      "records": records
    }
    ipfs.add(Buffer.from(JSON.stringify(cvDocument))).then((response) => {
      console.log(response.path)
      contract.methods
        .storeCVDocumentFor(targetAccount, response.path)
        .send({
          from: user.address,
        })
        .then(() => {
          setUploadSuccessful(response.path)
        })
    })
  }

  const setUploadSuccessful = (hash) => {
    console.log('successfully uploaded' + hash)
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumberOfPages(numPages)
  }

  return (
    <Box className={classes.gridroot} component='div'>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          { cvRecords.length>0 ? (
          <>
          <List dense className={classes.listroot}>
            {cvRecords.map((cvRecord, index) => {
              const labelId = `checkbox-list-secondary-label-${index}`;
              return (
                <ListItem 
                  key={index}
                  onClick={handleClicked(index)}
                  className={classes.listitem}
                  button>
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText id={labelId} 
                    primary={cvRecord.title} 
                    secondary={cvRecord.sender}/>
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      onChange={handleToggle(index)}
                      checked={checked.indexOf(index) !== -1}
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          <Box component='div' className={classes.listbuttonsection} >
            <Typography paragraph>
              Number of selected cv records to share: {checked.length}
            </Typography>
            <form onSubmit={onSubmit}>
              <TextField onChange={event => setTargetAccount(event.target.value)} className={classes.listbuttonacc} label="Share for AccountId" required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }
              }
              />
              <Button type='submit' variant="contained" color="primary">
                Share
              </Button>
            </form>
          </Box>
          </>
        ) : (
          <>
          No Cv Records found!
          </>
        )}
        </Grid>
        <Grid item xs={8} >
          { detailCVRecord !=null &&
          <Card>
            <CardHeader
              title={detailCVRecord.title}
              subheader={'by ' + detailCVRecord.autor + ' | publish date: ' + detailCVRecord.publishDate}
            />
            <CardContent>
              { detailCVRecord.type=='Anstellung' &&
                <Typography variant="subtitle1" component="p">
                  From: { detailCVRecord.from } To: { detailCVRecord.to }
                </Typography>
              }
              <Typography variant="body2" component="p">
                { detailCVRecord.description }
              </Typography>
            </CardContent>
            <Divider light />
            <CardActions disableSpacing>
              { detailCVRecord.documents.length > 0 &&
                <IconButton
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: expanded,
                  })}
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show documents"
                > 
                  <ExpandMoreIcon />
                </IconButton>
              }
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography paragraph>Documents</Typography>
                {detailCVRecord.documents.map((documentHash, index) => {
                  return (
                    <Box component='div' key={index}>
                      <p>Document Link: https://ipfs.infura.io/ipfs/{documentHash}</p>
                      <Document file={`https://ipfs.infura.io/ipfs/${documentHash}`}
                                onLoadSuccess={onDocumentLoadSuccess}
                      >
                        <Page pageNumber={pageNumber} />
                      </Document>
                      <p>
                        Page {pageNumber} of {numberOfPages}
                      </p>
                    </Box>
                  );
                })}
              </CardContent>
            </Collapse>
          </Card>
          }
        </Grid>
      </Grid>
    </Box>
  )
}

export default Applicant
