//code adapted from lecture live code for full stack application
//also adapted from my Job App Tracker code
import {useState} from 'react'
import {Button, Modal, Box, TextField, Stack, MenuItem} from '@mui/material'

const style = {
  postition: 'absolute',
  top: '50%',
  left: '50%',
  width: 400,
  bgcolor: 'blanchedalmond',
  boxShadow: 24,
  p: 4,
}

//allows for the creation of account by inputting relevabt info
export default function MakeAcc({MakeAccOpen, setMakeAccOpen}) {

  //set up usestates for important values
  const [un, setUN] = useState()
  const [fn, setFN] = useState()
  const [ln, setLN] = useState()
  const [ea, setEA] = useState()
  const [dn, setDN] = useState()
  const [bo, setBO] = useState()
  const [pw, setPW] = useState()

  /*boolean value to see if input is valid. if invalid, display msg to user.*/
  const [undefMsg, setUndefMsg] = useState(false)
  const [message, setMessage] = useState()

  //Create a new user / add to database
  const addUser = () => {

    //account info
    const newAcc = {
      username: un,
      first_name: fn,
      last_name: ln,
      email: ea,
      role: 1,
      display_name: dn,
      biography: bo,
      password: pw
    }

    //if statement to check if any elements are undefined
    //if one is found to be undefined, toggles conditional rendering msg to prompt them to fill all fields.
    //gives specific message to missing infp
    if (un == undefined || fn == undefined || ln == undefined || ea == undefined || dn == undefined || pw == undefined) {

      /*If form is not full on click, inform user, then return so they can't submit undefined info.*/
      console.log("One or more fields is undefined. Please fill out all fields.")
      setMessage("One or more fields is undefined. Please fill out all fields.")
      setUndefMsg(true)
      return

    } else {
      setUndefMsg(false)

    }

    //api call to add new user's info to database
    fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAcc)
    })
    .then(response => {
      if(!response.ok) { 

        //set error message to display that the username/email are already in use, tell user to try again
        setMessage("This Username and / or Email Address are in use. Please try again.")
        setUndefMsg(true)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.text()
    })
    .then(responseData => {
      console.log(responseData)

      //need to set values undefined after app is added, or else they carry over
      setUN(undefined)
      setFN(undefined)
      setLN(undefined)
      setEA(undefined)
      setDN(undefined)
      setBO(undefined)
      setPW(undefined)
      setUndefMsg(false)
      handleModalClose()

    })
  }

  const handleModalClose = () => {
    //setting values undefined so that they don't carry over to next input
    //(which was previously a problem with the input validation)
    setUN(undefined)
    setFN(undefined)
    setLN(undefined)
    setEA(undefined)
    setDN(undefined)
    setBO(undefined)
    setPW(undefined)
    setUndefMsg(false)
    setMakeAccOpen(false)
  }

  return (
 <Modal open={MakeAccOpen} onClose={handleModalClose}>
      <Box sx={style}>
        <h3>Enter New Account Details:</h3>

        {/*Use conditional rendering to display error msg if input is undefined
        also display this if error was returned (aka: api notices email or user are not unique)*/}
        <h2>
          {undefMsg 
            ? message
            : ''
          }
        </h2>

        {/*input account info to make a new acc*/}
        <Stack spacing={2}>
            <TextField  required label="Username" onChange={event => setUN(event.target.value)} />
            <TextField required label="First Name" onChange={event => setFN(event.target.value)}/>
            <TextField required label="Last Name" onChange={event => setLN(event.target.value)}/>
            <TextField required label="Email Address" onChange={event => setEA(event.target.value)}/>
            <TextField required label="Display Name" onChange={event => setDN(event.target.value)}/>
            <TextField required label="Bio (Optional)" onChange={event => setBO(event.target.value)}/>
            <TextField required label="Password" onChange={event => setPW(event.target.value)}/>
            </Stack>
        <Button onClick={addUser}>Create User</Button>
        <Button onClick={handleModalClose}>Close</Button>
      </Box>
    </Modal>
  )

}