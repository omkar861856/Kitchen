import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import SignUpLoginForm from './pages/SignUpPage';
import LoginForm from './pages/LoginPage';
import ProfilePage from './pages/Profile';
import axios from 'axios';
import { apiUrl } from './Layout';
import { useEffect } from 'react';
import { socket } from './Layout';


const App = () => {
  
  useEffect(() => {

    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const isUnsubscribed = await subscription.unsubscribe();
        if (isUnsubscribed) {
          console.log('Successfully unsubscribed from the push service.');
        } else {
          console.error('Failed to unsubscribe from the push service.');
        }
      } else {
        console.log('No subscription found.');
      }
    });

    function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary)
        .replace(/\+/g, '-') // Replace + with -
        .replace(/\//g, '_') // Replace / with _
        .replace(/=+$/, ''); // Remove trailing =
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('../service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    async function subscribeToPush() {
      const registration = await navigator.serviceWorker.ready;
      const response = await axios.get(`${apiUrl}/notifications/vapi`)
      const vapiPublicKey = response.data.vapiPublicKey

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Ensures notifications are visible to the user
        applicationServerKey: vapiPublicKey,
      });

      const p256dhBuffer = subscription.getKey('p256dh');
      const authBuffer = subscription.getKey('auth');

      if (!p256dhBuffer || !authBuffer) {
        throw new Error('Missing keys in subscription.');
      }

      const p256dh = arrayBufferToBase64Url(p256dhBuffer);
      const auth = arrayBufferToBase64Url(authBuffer);
      const endpoint = subscription.endpoint;

      socket.emit(`messageFromKitchen`, { p256dh, auth, endpoint })

      console.log(p256dh, auth, endpoint)
      console.log('Push subscription:', JSON.stringify(subscription));

      // Send this subscription to your server
    }

    subscribeToPush()

  }, [])

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