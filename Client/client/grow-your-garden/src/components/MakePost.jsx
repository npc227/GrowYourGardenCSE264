//code adapted from lecture live code for full stack application
//also adapted from my Job App Tracker code
import {useState} from 'react'
import {Button, Modal, Box, TextField, Stack} from '@mui/material'

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
export default function MakePost({MakePostOpen, setMakePostOpen}) {

  //set up usestates for important values
  const [title, setTitle] = useState()
  const [text_content, setTC] = useState()
  const [imgFile, setImgFile] = useState()

  /*boolean value to see if input is valid. if invalid, display msg to user.*/
  const [undefMsg, setUndefMsg] = useState(false)
  const [message, setMessage] = useState()

  //upload an image file
  const upImg = (event) => {

    //set the image to be uploaded as the selected one
    setImgFile(event.target.files[0])

  }

  //Create / add a new post to database
  const addPost = () => {

    //account info
    const newPost = {
      title: title,
      text_content: text_content
    }

    //if statement to check if any elements are undefined
    //if one is found to be undefined, toggles conditional rendering msg to prompt them to fill all fields.
    if (title == undefined || text_content == undefined) {

      /*If form is not full on click, inform user, then return so they can't submit undefined info.*/
      console.log("One or more fields is undefined. Please fill out all fields.")
      setMessage("One or more fields is undefined. Please fill out all fields.")
      setUndefMsg(true)
      return

    } else {
      setUndefMsg(false)

    }

    //create temp key for user auth 
    //and compile post data for submission
    const postData = new FormData() 
    let tempKey = ''
    if (localStorage.getItem("key") === null) {

      //error message. tell user to log in
      return

    } else {

      //remove quotation marks from key
      tempKey = "Bearer " + (localStorage.getItem("key").replaceAll('"', ""))
      postData.append("image", imgFile)
      let postBody = JSON.stringify(newPost)

      //seperate title and text content, not combine to body
      //i know this because i tried adding the whole newPost as "body"
      //but server alr interprets all text content as body so that is not needed
      postData.append("title", postBody.title)
      postData.append("text_content", postBody.text_content)

      console.log(postData.body)

    }

    //api call to add new post to database
    fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'authorization': tempKey
      },
      body: postData
    })
    .then(response => {
      if(!response.ok) { 

        //set error message
        setMessage("Post Upload Failure. Oops")
        setUndefMsg(true)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.text()
    })
    .then(responseData => {
      console.log(responseData)

      //need to set values undefined after app is added, or else they carry over
      setTitle(undefined)
      setTC(undefined)
      setUndefMsg(false)
      setMakePostOpen(false)
      handleModalClose()

    })
  }

  const handleModalClose = () => {
    //setting values undefined so that they don't carry over to next input
    //(which was previously a problem with the input validation)
    setTitle(undefined)
    setTC(undefined)
    setUndefMsg(false)

    //also: close the modal
    setMakePostOpen(false)
  }

  return (
 <Modal open={MakePostOpen} onClose={handleModalClose}>
      <Box sx={style}>
        <h3>Enter Post Details:</h3>

        {/*Use conditional rendering to display error msg if input is undefined
        also display this if error was returned (aka: api notices email or user are not unique)*/}
        <h2>
          {undefMsg 
            ? message
            : ''
          }
        </h2>

        {/*input info to make a new post*/}
        <Stack spacing={2}>
            <TextField  required label="Title" onChange={event => setTitle(event.target.value)} />
            <TextField required label="Description" onChange={event => setTC(event.target.value)}/>
            <input type="file" onChange={upImg}></input>
          </Stack>
        <Button onClick={addPost}>Create Post</Button>
        <Button onClick={handleModalClose}>Close</Button>
      </Box>
    </Modal>
  )

}