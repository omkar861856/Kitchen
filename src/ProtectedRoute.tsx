import React from 'react';
import { useAuth, SignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import './ProtectedRoute.css'

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  // While Clerk is loading, show a loading spinner
  if (!isLoaded) {
    return (
      <div className="loading-spinner">
        {/* You can customize the spinner as needed */}
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  // If the user is not signed in, show the Clerk sign-in popup
  if (!isSignedIn) {
    return (
      <div>
        <SignIn path="/sign-in" routing="path" redirectUrl="/" />
      </div>
    );
  }

  // If the user is signed in, render the children (the protected route)
  return children;
};

export default ProtectedRoute;