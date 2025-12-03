import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

/*Custom components!
NavBar - contains logo, login, profile*/
import NavBar from './components/NavBar'

function App() {
  //const [count, setCount] = useState(0)

  //attempt to get applications, usestate for apps
  //added UseEffect in accordance with live code
  const [posts, setPosts] = useState([])
  
  //get applications to be used when things are updated, posted, or edited to keep
  //accurate updates of content
  const getPosts = async() => {
    fetch('http://localhost:3000/posts', {
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
      setPosts(resData)
    })
  }

  //useffect for checking api status and running getApplications
  useEffect(() => {

    fetch('http://localhost:3000/up')
    .then(res => res.json())
    .then(result => {
      console.log(result.status)

    })
    getPosts()

  }, [])

  return (
    <>
      {/*render NavBar in the App*/}
      <NavBar />

    </>
  )
}

export default App
