import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

/*Custom components!
NavBar - contains logo, login, profile*/
import NavBar from './components/NavBar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/*render NavBar in the App*/}
      <NavBar />

    </>
  )
}

export default App
