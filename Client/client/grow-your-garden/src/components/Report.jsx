//code adapted from lecture live code for full stack application
//also adapted from my Job App Tracker code
import {useState} from 'react'
import {Button, Modal, Box, TextField, Stack, MenuItem} from '@mui/material'

const style = {
  top: '50%',
  left: '50%',
  transform: 'translate(140%, 50%)',
  width: 400,
  bgcolor: 'blanchedalmond',
  boxShadow: 24,
  p: 4,

  //more customize:\
  fontFamily: "Verdana"
}

//allows for the reporting of account by inputting relevant info
export default function Report({ReportOpen, setReportOpen}) {

  //set up usestates for important values
  const [un, setUN] = useState()
  const [tc, setTC] = useState()

  /*boolean value to see if input is valid. if invalid, display msg to user.*/
  const [undefMsg, setUndefMsg] = useState(false)
  const [message, setMessage] = useState()

  //Create a new report attempt
  const reportAttempt = () => {

    //remove quotation marks from key
    let tempKey = "Bearer " + (localStorage.getItem("key").replaceAll('"', ""))

    //report info
    const reportInfo = {
      username: un,
      text_content: tc
    }

    //if statement to check if any elements are undefined
    //if one is found to be undefined, toggles conditional rendering msg to prompt them to fill all fields.
    //gives specific message to missing infp
    if (un == undefined || tc == undefined) {

      /*If form is not full on click, inform user, then return so they can't submit undefined info.*/
      console.log("One or more fields is undefined. Please fill out all fields.")
      setMessage("One or more fields is undefined. Please fill out all fields.")
      setUndefMsg(true)
      return

    } else {
      setUndefMsg(false)

    }

    //api call to report
    fetch('http://localhost:3000/users/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': tempKey,
      },
      body: JSON.stringify(reportInfo)
    })
    .then(response => {
      if(!response.ok) { 
        setMessage("Please double check that the user is valid.")
        setUndefMsg(true)
        throw new Error(`HTTP error! status: ${response.status}`)

      }
      return response.text()
    })
    .then(responseData => {

      //need to set values undefined after app is added, or else they carry over
      setUN(undefined)
      setTC(undefined)
      setUndefMsg(false)
      setReportOpen(false)

    })
  }

  const handleModalClose = () => {
    //setting values undefined so that they don't carry over to next input
    //(which was previously a problem with the input validation)
    setUN(undefined)
    setTC(undefined)
    setUndefMsg(false)
    setReportOpen(false)
  }

  return (
 <Modal open={ReportOpen} onClose={handleModalClose}>
      <Box sx={style}>
        <h3>Enter Report Info:</h3>

        {/*Use conditional rendering to display error msg if input is undefined*/}
        <h2>
          {undefMsg 
            ? message
            : ''
          }
        </h2>

        {/*input user/pass*/}
        <Stack spacing={2}>
            <TextField  required label="Offender's Username" onChange={event => setUN(event.target.value)} />
            <TextField required label="Describe Issue" onChange={event => setTC(event.target.value)}/>
            </Stack>
        <Button onClick={reportAttempt}>Report</Button>
        <Button onClick={handleModalClose}>Close</Button>
      </Box>
    </Modal>
  )

}