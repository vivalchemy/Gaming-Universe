import Hero from "./components/Hero"
import Spaceship_Model from "./components/Spaceship_Model"
import Earth from "./components/Earth"
import Mars from "./components/Mars"
import Pluto from "./components/Pluto"
import Jupiter from "./components/Jupiter"
import Neptune from "./components/Neptune"
import Uranus from "./components/Uranus"
import Saturn from "./components/Saturn"

const App = () => {
  return (
    <div>
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <Saturn />
      
    </div>
    
    
  )
}

export default App
