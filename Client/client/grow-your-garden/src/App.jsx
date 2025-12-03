import { useState, useEffect } from 'react'
import React from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

/*Custom components! (and modal)
NavBar - contains logo, login, profile*/
import NavBar from './components/NavBar'

//note: postModal adapted from my job application tracjer project
import PostModal from './components/PostModal'

//import test images from tempimages
import TI1 from './assets/tempart/snake.jpg'
import TI2 from './assets/tempart/thunder.jpg'
import TI3 from './assets/tempart/cat.jpg'
import TI4 from './assets/tempart/plains.jpg'
import TI5 from './assets/tempart/pup.jpg'
import TI6 from './assets/tempart/apple.jpg'
import TI7 from './assets/tempart/firdge.jpg'

function App() {
  //const [count, setCount] = useState(0)

  //attempt to get posts, usestate for posts
  //also: usestate for post modal, setting selected post
  const [posts, setPosts] = useState([])
  const [PostModalOpen, setPostModalOpen] = useState(false)
  const [selectedPost, setSelPost] = useState()
  
  //get posts to be used when something is posted
  //nts:: add randomizer in here!!! can reactivate whenever seed packet clicked
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

      //shuffle the JSON data before putting it in posts
      setPosts(shufflePosts(resData))
      console.log(posts)

    })

  }

  //useffect for checking api status and running getPosts
  useEffect(() => {

    fetch('http://localhost:3000/up')
    .then(res => res.json())
    .then(result => {
      console.log(result.status)

    })
    getPosts()

  }, [])

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
      
      //pick a random index with a value from 0 to length of posts - 1
      //(aka: all possible indexes, since start at 0)
      let j = Math.floor(Math.random() * (i + 1)); 

      //swap element at posts[i] with the element at posts[j]
      [postArr[i], postArr[j]] = [postArr[j], postArr[i]];
    } 
    return postArr

  }

  return (
    <>
      {/*render NavBar in the App*/}
      <NavBar />

      {/*Seperate from navbar: main body of page. keep all elements column aligned in the center*/}
      <section class={'pageElements'}>

        {/*Posts displayed in a grid: currently, 2x2. Responsiveness, change to 1x4 stack upon window shrink*/}
        <div class={'postGrid'}>
          <img src={TI1} onClick={ () =>{
            setSelPost(posts[0])
            setPostModalOpen(true)
          }
          }></img>
          <img src={TI4}></img>
          <img src={TI6}></img>
          <img src={TI7}></img>
          
        </div>

      </section>


      {/*Modal for post info!*/}
      <PostModal PostModalOpen={PostModalOpen} setPostModalOpen={setPostModalOpen} post={selectedPost}
    />

    </>
  )
}

export default App
