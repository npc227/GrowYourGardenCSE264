import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/*Basic navigation bar. Returns user to home page when logo is pressed.
      Go to profile when clicking on profile pic on the right (if not logged in, 
      prompt to log in OR continue observing), or to log in/out.
      
      Alternatively, to discuss with group: implement login, profile, and posts
      as modals so you never technically leave the home page. Less tab switching, 
      just need to refresh content...*/}
      <nav class="navBar">
        <a href="/" class="logo">
        </a>

        {/*nts:: add a listener to change this to log out when user is logged in*/}
        <a>
          <p>Login</p>
        </a>

        <a>

        </a>
      </nav>
      
      {/* This contains the code started off with
      <div>

        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
