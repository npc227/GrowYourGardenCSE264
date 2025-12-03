//adapted from class full stack live code
//and my job application tracker
//show post info
import {useState, useEffect} from 'react'
import {Modal, Box} from '@mui/material'

export default function PostModal({PostModalOpen, setPostModalOpen, post}) {

    //handles open and close of the modal
    const handleModalClose = () => setPostModalOpen(false)

    //handles styling
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'blanchedalmond',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
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
        <h1>username: {user}</h1>
        <h1>title: {title}</h1>
        <h2>text_content: {text}</h2>
        <h3>likes: {likes}</h3>
      </Box>
    </Modal>
  )

}