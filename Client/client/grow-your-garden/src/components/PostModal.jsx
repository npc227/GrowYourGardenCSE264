//adapted from class full stack live code
//and my job application tracker
//show post info
import {useState, useEffect} from 'react'
import {Modal, Box, gridClasses} from '@mui/material'

import './PostModal.css'

export default function PostModal({PostModalOpen, setPostModalOpen, post}) {

    //handles open and close of the modal
    const handleModalClose = () => setPostModalOpen(false)

    //handles styling
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
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

    //usestates for important values
    const [user, setUserID] = useState()
    const [title, setTitle] = useState()
    const [text, setTextContent] = useState()
    const [likes, setLikes] = useState()
    //const [userProfInf, setUserInfo] = useState()

    //sets post values upon load
    useEffect(() => {
        setUserID(post?.user_id || '')
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
        setLikes(post?.likes || '')

    }, [post])

  //main area to display post info
  return ( 
    <Modal open={PostModalOpen} onClose={handleModalClose}>
      <Box sx={style}>

        {/*text info*/}
        <div>
          <h1 class={'textColor'}>{title}</h1>
          <h2 class={'textColor'}>Creator ID: {user}</h2>
          <h3 class={'textColor'}>{text}</h3>

        </div>

        <div class={'tempImg'}>

        </div>

      </Box>
    </Modal>
  )

}