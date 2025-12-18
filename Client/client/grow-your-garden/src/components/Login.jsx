//code adapted from lecture live code for full stack application
//also adapted from my Job App Tracker code
import {useState} from 'react'
import {Button, Modal, Box, TextField, Stack, MenuItem} from '@mui/material'

const style = {
  postition: 'absolute',
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

//allows for the creation of account by inputting relevant info
export default function Login({LoginOpen, setLoginOpen, setLI}) {

  //set up usestates for important values
  const [un, setUN] = useState()
  const [pw, setPW] = useState()

  /*boolean value to see if input is valid. if invalid, display msg to user.*/
  const [undefMsg, setUndefMsg] = useState(false)
  const [message, setMessage] = useState()

  //Create a new user / add to database
  const loginAttempt = () => {

    //account info
    const loginInfo = {
      username: un,
      password: pw
    }

    //if statement to check if any elements are undefined
    //if one is found to be undefined, toggles conditional rendering msg to prompt them to fill all fields.
    //gives specific message to missing infp
    if (un == undefined || pw == undefined) {

      /*If form is not full on click, inform user, then return so they can't submit undefined info.*/
      console.log("One or more fields is undefined. Please fill out all fields.")
      setMessage("One or more fields is undefined. Please fill out all fields.")
      setUndefMsg(true)
      return

    } else {
      setUndefMsg(false)

    }

    //api call to log in
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginInfo)
    })
    .then(response => {
      if(!response.ok) { 
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.text()
    })
    .then(responseData => {

      //pass username and user's auth token to the browser's local storage
      localStorage.setItem("key", responseData)
      localStorage.setItem("user", loginInfo.username)
      setLI(true)

      //need to set values undefined after app is added, or else they carry over
      setUN(undefined)
      setPW(undefined)
      setUndefMsg(false)
      setLoginOpen(false)

    })
  }

  const handleModalClose = () => {
    //setting values undefined so that they don't carry over to next input
    //(which was previously a problem with the input validation)
    setUN(undefined)
    setPW(undefined)
    setUndefMsg(false)
    setLoginOpen(false)
  }

  return (
 <Modal open={LoginOpen} onClose={handleModalClose}>
      <Box sx={style}>
        <h3>Enter Login Credentials:</h3>

        {/*Use conditional rendering to display error msg if input is undefined*/}
        <h2>
          {undefMsg 
            ? message
            : ''
          }
        </h2>

        {/*input user/pass*/}
        <Stack spacing={2}>
            <TextField  required label="Username" onChange={event => setUN(event.target.value)} />
            <TextField required label="Password" onChange={event => setPW(event.target.value)}/>
            </Stack>
        <Button onClick={loginAttempt}>Log In</Button>
        <Button onClick={handleModalClose}>Close</Button>
      </Box>
    </Modal>
  )

}