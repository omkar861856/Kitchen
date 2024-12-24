import { useState } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [showMessage, setShowMessage] = useState(false);

  // Show a loading spinner while Clerk is determining the authentication state
  if (!isLoaded) {
    return (
      <div className="loading-spinner">
      </div>
    );
  }

  // If the user is not signed in, display a message before redirecting
  if (!isSignedIn) {
    if (!showMessage) {
      setShowMessage(true);
      setTimeout(() => {
        redirectToSignIn({
          redirectUrl: window.location.href, // Redirect back to the current page after sign-in
        });
      }, 3000); // Redirect after 3 seconds
    }

    return (
      <div className="login-message">
        <p>Please log in to continue...</p>
      </div>
    );
  }

  // If the user is signed in, render the children (the protected route)
  return <>{children}</>;
};

export default ProtectedRoute;