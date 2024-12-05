import { Routes, Route } from 'react-router-dom'
import MenuManagement from './pages/MenuManagement'
import Orders from './pages/Orders'

const App = () => {
  return (
    <Routes>
      <Route path='/menu' element={<MenuManagement />}/>
      <Route path='/' element={<Orders />}/>
    </Routes>
  )
}

export default App