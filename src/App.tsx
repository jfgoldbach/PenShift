import { useState } from 'react'
import './App.css'
import { Viewport } from './assets/components/Viewport'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Viewport />
    </div>
  )
}

export default App