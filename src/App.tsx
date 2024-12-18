import { Routes, Route } from 'react-router-dom'
import MenuManagement from './pages/MenuManagement'
import Orders from './pages/Orders'
import Payments from './pages/Payments'

const App = () => {
  return (
    <Routes>
      <Route path='/menu' element={<MenuManagement />}/>
      <Route path='/' element={<Orders />}/>
      <Route path='/payments' element={<Payments />}/>
    </Routes>
  )
}

export default App