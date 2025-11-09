import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DiscussionForum from './pages/discussionForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DiscussionForum />
      
    </>
  )
}

export default App
