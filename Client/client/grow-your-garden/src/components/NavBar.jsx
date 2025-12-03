import React from 'react'

//styling: navbar styling and logo image
import logoImg from '../assets/gyglogo.png'
import './NavBar.css'

//navbar component!
const NavBar = () => {

  return (
    <>
    {/*Nav container*/}
      <nav class={'nav'}>

        {/*logo*/}
        <img src={logoImg} class={'logo'}></img>

        {/*temp placeholders -- replace with modals for login/profile*/}
        <div class={'links'}>
            <h3>Log In</h3>
            <h3>Profile</h3>
        </div>

      </nav>
    </>
  )
}

export default NavBar