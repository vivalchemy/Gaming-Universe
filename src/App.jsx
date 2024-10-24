import Hero from "./components/Hero"
import Spaceship_Model from "./components/Spaceship_Model"

const App = () => {
  return (
    <div>
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <Spaceship_Model />
      
    </div>
    
    
  )
}

export default App
