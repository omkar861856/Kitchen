import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';
import Payments from './pages/Payments';

const App = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute>
            <MenuManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default App;