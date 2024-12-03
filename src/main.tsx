import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Layout from './Layout.tsx'
import { BrowserRouter } from 'react-router-dom'
import AppTheme from './pages/shared-theme/AppTheme.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store.ts'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk publishable key to the .env.local file')
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>

      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>


            <AppTheme>

              <Layout>
                <App />
              </Layout>
            </AppTheme>
          </PersistGate>

        </Provider>

      </ClerkProvider>

    </BrowserRouter>
  </StrictMode>,
)
