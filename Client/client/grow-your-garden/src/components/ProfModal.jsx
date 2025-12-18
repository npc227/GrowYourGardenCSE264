//adapted from class full stack live code
//and my job application tracker
//show profile info
import {useState, useEffect} from 'react'
import {Modal, Box} from '@mui/material'

export default function ProfModal({ProfModalOpen, setProfModalOpen, loggedIn}) {

    //handles open and close of the modal
    const handleModalClose = () => {
      setProfModalOpen(false)

    }

    //handles styling
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-40%, -70%)',
        width: 400,
        bgcolor: 'blanchedalmond',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,

        //more customize:\
        fontFamily: "Verdana"
    };

    //usestates for important values
    const [user, setUserInfo] = useState([])

    //sets profile data using values from logged in user upon load
    useEffect(() => {
        let tempKey = "Bearer " + (localStorage.getItem("key").replaceAll('"', ""))

        const getUser = async() => {
        fetch(`http://localhost:3000/users/me`, {
            method: 'GET',
            headers: {
              'authorization': tempKey
            },
            })
            .then(res => {
            if(!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
            })
            .then(resData => {
            console.log(resData)
            setUserInfo(resData)

            })

        }
        getUser()

    }, [loggedIn])

  //main area to display profile info
  return ( 
    <Modal open={ProfModalOpen} onClose={handleModalClose}>
      <Box sx={style}>
        <h1>Display Name: {user.display_name}</h1>
        <h2>Username: {user.username}</h2>
        <h3>Email: {user.email}</h3>
        <h3>bio: {user.biography}</h3>
      </Box>
    </Modal>
  )

}