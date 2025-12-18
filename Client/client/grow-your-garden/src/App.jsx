import { useState, useEffect } from 'react'
import React from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

//styling: navbar styling and logo image, create acc icon
import logoImg from './assets/gyglogo.png'
import createAcc from './assets/tempart/gygcreateacc.png'
import './components/NavBar.css'

//note: postModal adapted from my job application tracjer project
import PostModal from './components/PostModal'
import MakeAcc from './components/MakeAcc'
import Login from './components/Login'
import MakePost from './components/MakePost'
import ProfModal from './components/ProfModal'

//import test images from tempimages
import TI1 from './assets/tempart/snake.jpg'
import TI2 from './assets/tempart/thunder.jpg'
import TI3 from './assets/tempart/cat.jpg'
import TI4 from './assets/tempart/plains.jpg'
import TI5 from './assets/tempart/pup.jpg'
import TI6 from './assets/tempart/apple.jpg'
import TI7 from './assets/tempart/firdge.jpg'

//and seed, watering can imgs
import watercan from './assets/tempart/watercan.png'
import gygseed from './assets/tempart/gygseed.png'

function App() {
  //const [count, setCount] = useState(0)

  //attempt to get posts, usestate for posts
  //also: usestate for post modal, setting selected post, getting auth key
  //tracking logged in
  const [posts, setPosts] = useState([])
  const [PostModalOpen, setPostModalOpen] = useState(false)
  const [MakeAccOpen, setMakeAccOpen] = useState(false)
  const [selectedPost, setSelPost] = useState()
  const [LoginOpen, setLoginOpen] = useState()
  const [loggedIn, setLI] = useState(false)
  const [MakePostOpen, setMakePostOpen] = useState(false)
  const [ProfModalOpen, setProfModalOpen] = useState(false)

  //keep track of loading / current selected post's img url
  const [loading, setLoading] = useState(true)
  
  //get posts to be used when something is posted
  //nts:: add randomizer in here!!! can reactivate whenever seed packet clicked
  //accurate updates of content
  const getPosts = async() => {
    let data = await fetch('http://localhost:3000/posts', {
      method: 'GET',
    })
    .then(data => {
      if(!data.ok) {
        throw new Error(`HTTP error! status: ${data.status}`)
      }
      return data.json()
    })
    .then(data => {
      console.log(data)

      setPosts(data)
      console.log(posts)

    })

  }

  //useffect for checking api status and running getPosts
  useEffect(() => {

    const fetchPosts = async() => {
      fetch('http://localhost:3000/up')
      .then(res => res.json())
      .then(result => {
        console.log(result.status)

      })
      await getPosts()
      setLoading(false)

      //after updated posts have been fetched, reset the indicator
      localStorage.setItem("post added", "not yet")
    } 
    fetchPosts()

  }, [])

  //if it is loading, return div
  if (loading) {
    return (
      <div>
        LOADING...
      </div>
    )
  }

  //ensure posts are updated
  function updatePostArr() {
    //re-fetch posts...

    let data = fetch('http://localhost:3000/posts', {
      method: 'GET',
    })
    .then(data => {
      if(!data.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return data.json()
    })
    .then(data => {
      console.log(data)

      setPosts(data)
      console.log(posts)

    })
    
  }

  //post randomizer
  //post grid will auto pull first 4 posts, so shuffling all is a simpler algoritm
  //than creating an entirely different array/tracker for random index of posts 
  //(trust me, I tried... :3)
  function shufflePosts(postArr) {

    console.log("enter shuffle")

    //Using Fisher-Yates Algorithm adapted from
    //the demonstration here: https://www.geeksforgeeks.org/dsa/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
    for (let i = postArr.length - 1; i > 0; i--){
      console.log("enter shuffle iteration" + i)
      console.log(postArr[i])
      
      //pick a random index with a value from 0 to length of posts - 1
      //(aka: all possible indexes, since start at 0)
      let j = Math.floor(Math.random() * (i + 1)); 

      //swap element at posts[i] with the element at posts[j]
      [postArr[i], postArr[j]] = [postArr[j], postArr[i]]
    } 
    return postArr

  }

  return (
    <>
      {/*Nav container*/}
      <nav class={'nav'}>

        {/*logo*/}
        <img src={logoImg} class={'logo'}></img>

        {/*On click, open up login (if not logged in) or profile (if logged in)*/}
        <div class={'links'}>
            <h3 onClick={ () => {

              if (loggedIn === false) {

                console.log("logging in")
                setLI(true)
                setLoginOpen(true)

              } else {

                console.log("logging out")

                //set logged in to false to display correct text
                setLI(false)

                //key is returned with quotations.
                //need to remove the quotations before the bearer/auth can be utilized.
                //remove quotations from user specific token, combine with "Bearer " to create auth key 
                let key = "Bearer " + (localStorage.getItem("key").replaceAll('"', ""))
                
                //api call to log out
                fetch('http://localhost:3000/logout', {
                  method: 'POST',
                  headers: {
                    'authorization': key
                  },
                })
                .then(response => {
                  if(!response.ok) { 
                    throw new Error(`HTTP error! status: ${response.status}`)
                  }
                  return response.text()
                })
                .then(response => {
                  console.log(response)

                })

              }

              {/*Conditional rendering: if logged in,
                show Log Out, otherwise, show Log In*/}
            }}>{loggedIn 
                ? "Log Out"
                : "Log In"
              }</h3>
        
            <h3 onClick={ () => {

              if (loggedIn == true) {

                setProfModalOpen(true)

              }

            }}>Profile</h3>
        </div>

      </nav>
      

      {/*Seperate from navbar: main body of page. keep all elements column aligned in the center*/}
      <section class={'pageElements'}>

        <div class={'interactions'}>

          {/*Watering can "refreshes" posts*/}
          <img src={watercan} id={'seedImg'} onClick={ () => {

            //create copy of posts for shuffle
            //so it doesn't give a reference
            let tempArr = [...posts]
            console.log(tempArr)
            setPosts(shufflePosts(tempArr))
            console.log(posts)
              
            }
          }></img>

          {/*Seed will allow a logged in user to make a post*/}
          <img src={gygseed} id={'seedImg'} onClick={ () => {
            
            setMakePostOpen(true)

              
          }
          }></img>

        </div>

        {/*Posts displayed in a grid: currently, 2x2. Responsiveness, change to 1x4 stack upon window shrink*/}
        <div class={'postGrid'}>
          <img src={posts[0].image} onClick={ () => {
            console.log(posts[0])
            setSelPost(posts[0])
            setPostModalOpen(true)
          }
          }></img>
          <img src={posts[1].image} onClick={ () =>{
            setSelPost(posts[1])
            setPostModalOpen(true)
          }
          }></img>
          <img src={posts[2].image} onClick={ () =>{
            setSelPost(posts[2])
            setPostModalOpen(true)
          }
          }></img>
          <img src={posts[3].image} onClick={ () =>{
            setSelPost(posts[3])
            setPostModalOpen(true)
          }
          }></img>
          
        </div>

      </section>

      {/*Footer/Info for bottom of page*/}
      <section class={'footer'}>

        <img src={createAcc} id={'createAcc'} onClick={ () => {

          //on click open create account modal!
          //NTS:: add validation: if logged in (boolean tracker)
          //do not open the modal
          setMakeAccOpen(true)
            
          }
          }></img>

      </section>


      {/*Modal for post info!*/}
      <PostModal PostModalOpen={PostModalOpen} setPostModalOpen={setPostModalOpen} post={selectedPost}
      /> 
      <MakeAcc MakeAccOpen={MakeAccOpen} setMakeAccOpen={setMakeAccOpen}
      />
      <Login LoginOpen={LoginOpen} setLoginOpen={setLoginOpen}
      />
      <MakePost MakePostOpen={MakePostOpen} setMakePostOpen={setMakePostOpen} getPosts={getPosts}
      />
      <ProfModal ProfModalOpen={ProfModalOpen} setProfModalOpen={setProfModalOpen}
      />

    </>
  )
}

export default App
