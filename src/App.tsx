import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import SignUpLoginForm from './pages/SignUpPage';
import LoginForm from './pages/LoginPage';
import ProfilePage from './pages/Profile';

const App = () => {
  return (
    <Routes>
      <Route
        path='/signin'
        element={
          <LoginForm />
        }
      />
      <Route
        path='/signup'
        element={
          <SignUpLoginForm />
        }
      />
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
      <Route

        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }

      />
    </Routes>
  );
};

export default App;