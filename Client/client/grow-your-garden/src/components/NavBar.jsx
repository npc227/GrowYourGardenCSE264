import React from 'react'
import './NavBar.css'

//navbar component!
const NavBar = () => {

  return (
    <>
    {/*Nav container*/}
      <nav class={'nav'}>

        {/*logo*/}
        <h1 class={'logo'}>
            LOGO
        </h1>

        {/*temp placeholders -- replace with modals for login/profile*/}
        <div class={'links'}>
            <h3>login</h3>
            <h3>profile</h3>
        </div>

      </nav>
    </>
  )
}

export default NavBar