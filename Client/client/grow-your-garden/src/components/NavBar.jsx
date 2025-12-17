import React from 'react'
import { useState, useEffect } from 'react'

//styling: navbar styling and logo image
import logoImg from '../assets/gyglogo.png'
import './NavBar.css'

//import ProfModal from './ProfModal'

//navbar component!
const NavBar = () => {

  //const [ProfModalOpen, setProfModalOpen] = useState(false)
  //const [selProf, setSelProf] = useState()
    
    //get applications to be used when things are updated, posted, or edited to keep
  //accurate updates of content
  /*const getProf = async() => {
    fetch('http://localhost:3000/users/3', {
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
      console.log("testing :3")
      setSelProf(resData)
    })
  }

  //useffect for checking api status and running getApplications
  useEffect(() => {

    fetch('http://localhost:3000/up')
    .then(res => res.json())
    .then(result => {
      console.log(result.status)
    })
    getProf()

  }, [])*/

  return (
    <>
    {/*Nav container*/}
      <nav class={'nav'}>

        {/*logo*/}
        <img src={logoImg} class={'logo'}></img>

        {/*temp placeholders -- replace with modals for login/profile*/}
        <div class={'links'}>
            <h3>Log In / Out</h3>
            <h3 /*onClick={ () =>{
              setSelProf(selProf)
              setProfModalOpen(true)
            }
          }*/>Profile</h3>
        </div>

      </nav>

      {/*Modal for profile info! (and modal for login)
      <ProfModal ProfModalOpen={ProfModalOpen} setProfModalOpen={setProfModalOpen} prof={selProf}
      */}
    </>
  )
}

export default NavBar