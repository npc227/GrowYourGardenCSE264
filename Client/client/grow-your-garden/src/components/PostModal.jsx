//adapted from class full stack live code
//and my job application tracker
//show post info
import {useState, useEffect, use} from 'react'
import {Modal, Box, gridClasses} from '@mui/material'

import './PostModal.css'

//handles styling
const style = {
    position: 'absolute',
    top: '7%',
    left: '26.767%',
    width: 700,
    bgcolor: 'blanchedalmond',
    border: '2px solid #815717ff',
    boxShadow: 24,
    p: 4,

    //more customize:\
    fontFamily: "Verdana", 
    display: "grid",
    gridTemplateColumns: "300px 250px", // column widths
    gap: "10px", // space between grid items
    padding: "30px",
};

export default function PostModal({PostModalOpen, setPostModalOpen, post}) {

    //handles open and close of the modal
    const handleModalClose = () => {
      setComms([])
      setPostModalOpen(false)

    }

    //usestates for important values
    const [user, setUserID] = useState()
    const [img, setImg] = useState()
    const [title, setTitle] = useState()
    const [text, setTextContent] = useState()
    const [likes, setLikes] = useState()
    const [commTxt, setCT] = useState()
    const [comments, setComms] = useState([])
    const [tracker, setTracker] = useState(0)
    const [openComments, setOC] = useState(false)
    const [filteredCD, setFCD] = useState([])

    //sets post values upon load
    useEffect(() => {
      setUserID(post?.username || '')
/*
        const getUser = async() => {
        fetch(`http://localhost:3000/users/${user}`, {
            method: 'GET',
            })
            .then(res => {
            if(!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
            })
            .then(resData => {
            console.log(resData)
            setUserID(resData[0].username)

            })

        }
        getUser()*/

      setTitle(post?.title || '')
      setTextContent(post?.text_content || '')
      setImg(post?.image || '')
      setLikes(post?.likes || '')

    }, [post])

    //update text field info for comment
    const upTxt = (event) => {

      setCT(event.target.value)

    }

    //compile comment info
    function postComment() {

      //if statement to check if any elements are undefined
      //if one is found to be undefined, toggles conditional rendering msg to prompt them to fill all fields.
      if (commTxt == undefined) {

        /*If form is not full on click, inform user, then return so they can't submit undefined info.*/
        console.log("One or more fields is undefined. Please fill out all fields.")
        /*setMessage("One or more fields is undefined. Please fill out all fields.")
        setUndefMsg(true)*/
        return

      } else {
        //setUndefMsg(false)

      }

      //create temp key for user auth 
      //and compile post data for submission
      let tempKey = ''
      if (localStorage.getItem("key") === null) {

        return

      } else {

        //remove quotation marks from key
        tempKey = "Bearer " + (localStorage.getItem("key").replaceAll('"', ""))

      }
      const commentInfo = {

        text_content: commTxt,

      }
      console.log("right before api call")

      //api call to add new post to database
      fetch(`http://localhost:3000/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'authorization': tempKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentInfo)
      })
      .then(response => {
        if(!response.ok) { 
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.text()
      })
      .then(responseData => {
        console.log(responseData)

        //want to refresh comments so new one will appear in comment section
        let temp = tracker + 1
        setTracker(temp)


      })

    }

    //get comments from database to be displayed to comments section
    const getComments = async() => {
      fetch(`http://localhost:3000/posts/${post.id}/comments`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(res => {
        console.log(res.status)
        console.log("getComms")
        console.log(res)

        //set comments
        setComms(res)

      })

    }

    //whenever tracker is updated/changed, re-fetch comments
    useEffect(() => {

      if (post == null) {
        return
      }
      console.log("enter the comments updater")

      const fetchComments = async() => {
        await getComments()

      } 
      fetchComments()

    }, [tracker])

  //main area to display post info
  return ( 
    <Modal open={PostModalOpen} onClose={handleModalClose}>
      <Box sx={style}>

        <section class={"postContainer"}>
          {/*text info*/}
          <section class={"postContent"}>
            <div>
              <h1 class={'textColor'}>{title}</h1>
              <h2 class={'textColor'}>Creator ID: {user}</h2>
              <h3 class={'textColor'}>{text}</h3>

              <img  class={'tempImg'} src={img}>
            
              </img>

            </div>

            <p></p>

            <div class={"rightdiv"}>
              {/*Get comment info to be posted*/}
              <input type={"text"} id={"comment_text"} onChange={(event) => {
                upTxt(event)
                console.log(commTxt)

              }
              }></input> {/*only submit comment upon click so user can change before submission*/}
              <button id={"addComment"} onClick={() => {

                postComment()

              }}>Comment</button>

              <div id={"CommentSection"}>
                <h2 onClick={() => {

                  if (!openComments) {
                    
                    //referenced: https://react.dev/learn/rendering-lists
                    //only want to render username and text content of comments.
                    //need to refresh tracker in case new comments were added
                    let temp = tracker + 1
                    setTracker(temp)
                    let tempArr = [...comments]
                    console.log(tempArr)
                    setFCD(tempArr.map((comments) => <li>{comments.username}: {comments.text_content}</li>))
                    console.log(filteredCD)
                    setOC(true)

                  } else {

                    setOC(false)

                  }
            
                  
                }}>Comments Section</h2> {/*use conditional rendering to only show the list when comments are set to "Open" setOC = true*/}
                <h3 class="commentssec">{openComments 
                    ? <ul>{filteredCD}</ul>
                    : <ul class={"hidden"}></ul>
                  }</h3>

              </div>
            </div>

          </section>

        </section>

      </Box>
    </Modal>
  )

}