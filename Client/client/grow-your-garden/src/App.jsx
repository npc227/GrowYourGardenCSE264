import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

/*Custom components!
NavBar - contains logo, login, profile*/
import NavBar from './components/NavBar'

//import test images from tempimages
//(these are images from a seperate project of mine - DES153)
import TI1 from './assets/tempart/snake.jpg'
import TI2 from './assets/tempart/thunder.jpg'
import TI3 from './assets/tempart/cat.jpg'
import TI4 from './assets/tempart/plains.jpg'
import TI5 from './assets/tempart/pup.jpg'
import TI6 from './assets/tempart/apple.jpg'
import TI7 from './assets/tempart/firdge.jpg'

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

      {/*Seperate from navbar: main body of page. keep all elements column aligned in the center*/}
      <section class={'pageElements'}>

        {/*Posts displayed in a grid: currently, 2x2. Responsiveness, change to 1x4 stack upon window shrink*/}
        <div class={'postGrid'}>
          <img src={TI1}></img>
          <img src={TI4}></img>
          <img src={TI6}></img>
          <img SRC={TI7}></img>
          
        </div>

      </section>

    </>
  )
}

export default App
